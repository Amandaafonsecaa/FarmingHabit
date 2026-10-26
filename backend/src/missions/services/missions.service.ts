import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';
import { Mission } from '@prisma/client';

@Injectable()
export class MissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createMissionDto: CreateMissionDto): Promise<Mission> {
    if (createMissionDto.userId) {
      await this.usersService.findOne(createMissionDto.userId);
    }

    return this.prisma.mission.create({
      data: {
        title: createMissionDto.title,
        description: createMissionDto.description ?? '',
        xpReward: createMissionDto.xpReward,
        coinsReward: createMissionDto.coinsReward,
        completed: createMissionDto.completed ?? false,
        userId: createMissionDto.userId ?? null,
      },
    });
  }

  async findAll(userId?: string): Promise<Mission[]> {
    return this.prisma.mission.findMany({
      where: userId
        ? {
            OR: [{ userId }, { userId: null }],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Mission> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
    });

    if (!mission) {
      throw new NotFoundException(`Missão com ID ${id} não encontrada.`);
    }

    return mission;
  }

  async update(
    id: string,
    updateMissionDto: UpdateMissionDto,
  ): Promise<Mission> {
    await this.findOne(id);

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
        ...(updateMissionDto.completed !== undefined && {
          completed: updateMissionDto.completed,
          completedAt: updateMissionDto.completed ? new Date() : null,
        }),
      },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.mission.delete({
      where: { id },
    });

    return { message: `Missão ${id} removida com sucesso.` };
  }

  async completeMission(id: string, targetUserId: string) {
    const mission = await this.findOne(id);

    if (mission.completed) {
      throw new BadRequestException('Esta missão já foi concluída.');
    }

    // Marca a missão como completada
    const completedMission = await this.prisma.mission.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
        userId: targetUserId,
      },
    });

    // Concede as recompensas de XP e moedas ao usuário
    const updatedUser = await this.usersService.addRewards(
      targetUserId,
      mission.xpReward,
      mission.coinsReward,
    );

    return {
      message: 'Missão cumprida! Recompensas creditadas com sucesso.',
      mission: completedMission,
      rewards: {
        xpGained: mission.xpReward,
        coinsGained: mission.coinsReward,
      },
      user: {
        id: updatedUser.id,
        level: updatedUser.level,
        xp: updatedUser.xp,
        coins: updatedUser.coins,
      },
    };
  }

  /** Desfaz uma missão cumprida: volta a ficar em aberto e o XP e as moedas que ela deu são devolvidos */
  async uncompleteMission(id: string, targetUserId: string) {
    const mission = await this.findOne(id);

    if (!mission.completed) {
      throw new BadRequestException('Esta missão ainda não foi concluída.');
    }

    const reopened = await this.prisma.mission.update({
      where: { id },
      data: { completed: false, completedAt: null },
    });

    const updatedUser = await this.usersService.revokeRewards(
      targetUserId,
      mission.xpReward,
      mission.coinsReward,
    );

    return {
      message: 'Missão desfeita. As recompensas foram devolvidas.',
      mission: reopened,
      user: {
        id: updatedUser.id,
        level: updatedUser.level,
        xp: updatedUser.xp,
        coins: updatedUser.coins,
      },
    };
  }
}
