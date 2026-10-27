import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Mission, User } from '@prisma/client';
import { adjustWallet } from '../../progress/wallet';

const stats = (user: User) => ({ id: user.id, level: user.level, xp: user.xp, coins: user.coins });

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMissionDto: CreateMissionDto, userId: string): Promise<Mission> {
    return this.prisma.mission.create({
      data: {
        title: createMissionDto.title,
        description: createMissionDto.description ?? '',
        xpReward: createMissionDto.xpReward,
        coinsReward: createMissionDto.coinsReward,
        userId,
      },
    });
  }

  /** Missões do jogador e as globais (sem dono) */
  async findAll(userId: string): Promise<Mission[]> {
    return this.prisma.mission.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Missão que o jogador pode ver: a dele ou uma global */
  async findOne(id: string, userId: string): Promise<Mission> {
    const mission = await this.prisma.mission.findFirst({
      where: { id, OR: [{ userId }, { userId: null }] },
    });

    if (!mission) {
      throw new NotFoundException(`Missão com ID ${id} não encontrada.`);
    }

    return mission;
  }

  /** Só as missões do próprio jogador podem ser editadas ou apagadas */
  private async findOwned(id: string, userId: string): Promise<Mission> {
    const mission = await this.prisma.mission.findFirst({ where: { id, userId } });

    if (!mission) {
      throw new NotFoundException(`Missão com ID ${id} não encontrada.`);
    }

    return mission;
  }

  async update(
    id: string,
    updateMissionDto: UpdateMissionDto,
    userId: string,
  ): Promise<Mission> {
    const mission = await this.findOwned(id, userId);
    // Desfazer devolve o valor atual da missão: mudar o valor depois de cumprida deixaria ganhar de graça
    const changesReward = (updateMissionDto.xpReward !== undefined && updateMissionDto.xpReward !== mission.xpReward)
      || (updateMissionDto.coinsReward !== undefined && updateMissionDto.coinsReward !== mission.coinsReward);
    if (mission.completed && changesReward) {
      throw new BadRequestException('Desfaça a missão antes de mudar as recompensas dela.');
    }

    return this.prisma.mission.update({
      where: { id },
      data: {
        ...(updateMissionDto.title && { title: updateMissionDto.title }),
        ...(updateMissionDto.description !== undefined && {
          description: updateMissionDto.description,
        }),
        ...(updateMissionDto.xpReward !== undefined && {
          xpReward: updateMissionDto.xpReward,
        }),
        ...(updateMissionDto.coinsReward !== undefined && {
          coinsReward: updateMissionDto.coinsReward,
        }),
      },
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.findOwned(id, userId);
    await this.prisma.mission.delete({
      where: { id },
    });

    return { message: `Missão ${id} removida com sucesso.` };
  }

  /** Cumpre a missão e paga o valor dela numa transação só; dois cliques ao mesmo tempo pagam uma vez */
  async completeMission(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.$transaction(async tx => {
      const changed = await tx.mission.updateMany({
        where: { id, completed: false, OR: [{ userId }, { userId: null }] },
        data: { completed: true, completedAt: new Date(), userId },
      });
      if (changed.count !== 1) throw new BadRequestException('Esta missão já foi concluída.');
      const mission = await tx.mission.findUniqueOrThrow({ where: { id } });
      const [user] = await adjustWallet(tx, userId, mission.coinsReward, mission.xpReward);
      return {
        message: 'Missão cumprida! Recompensas creditadas com sucesso.',
        mission,
        rewards: { xpGained: mission.xpReward, coinsGained: mission.coinsReward },
        user: stats(user),
      };
    });
  }

  /** Desfaz uma missão cumprida: volta a ficar em aberto e o XP e as moedas que ela deu são devolvidos */
  async uncompleteMission(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.$transaction(async tx => {
      const changed = await tx.mission.updateMany({
        where: { id, userId, completed: true },
        data: { completed: false, completedAt: null },
      });
      if (changed.count !== 1) throw new BadRequestException('Esta missão ainda não foi concluída.');
      const mission = await tx.mission.findUniqueOrThrow({ where: { id } });
      const [user] = await adjustWallet(tx, userId, -mission.coinsReward, -mission.xpReward);
      return { message: 'Missão desfeita. As recompensas foram devolvidas.', mission, user: stats(user) };
    });
  }
}
