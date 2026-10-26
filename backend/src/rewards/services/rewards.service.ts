import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ConflictException,
} from '@nestjs/common';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';
import { Prisma, Reward } from '@prisma/client';
import { SHOP_CATALOG } from '../catalog';

@Injectable()
export class RewardsService implements OnModuleInit {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /** Garante que a vitrine fixa existe no banco com os preços atuais do catálogo */
  async onModuleInit() {
    try {
      await this.syncCatalog();
    } catch (error) {
      this.logger.warn(
        `Não foi possível sincronizar a vitrine fixa: ${(error as Error).message}`,
      );
    }
  }

  async syncCatalog() {
    await this.prisma.$transaction(
      SHOP_CATALOG.map((item) =>
        this.prisma.reward.upsert({
          where: { key: item.key },
          create: { ...item, available: true, userId: null },
          update: {
            title: item.title,
            price: item.price,
            description: item.description,
            available: true,
          },
        }),
      ),
    );
  }

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    if (createRewardDto.userId) {
      await this.usersService.findOne(createRewardDto.userId);
    }

    return this.prisma.reward.create({
      data: {
        title: createRewardDto.title,
        description: createRewardDto.description ?? null,
        price: createRewardDto.price,
        available: createRewardDto.available ?? true,
        userId: createRewardDto.userId ?? null,
      },
    });
  }

  async findAll(userId?: string): Promise<Reward[]> {
    const rewards = await this.prisma.reward.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : { userId: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!userId) return rewards;
    const overrides = await this.prisma.rewardOverride.findMany({
      where: { userId },
    });
    return rewards.map((reward) =>
      this.applyOverride(
        reward,
        overrides.find((item) => item.rewardId === reward.id),
      ),
    );
  }

  private applyOverride(
    reward: Reward,
    override?: {
      title: string | null;
      description: string | null;
      price: number | null;
      hidden: boolean;
    } | null,
  ): Reward {
    return override
      ? {
          ...reward,
          title: override.title ?? reward.title,
          description: override.description ?? reward.description,
          price: override.price ?? reward.price,
          available: reward.available && !override.hidden,
        }
      : reward;
  }

  async findOne(id: string): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
    });

    if (!reward) {
      throw new NotFoundException(`Recompensa com ID ${id} não encontrada.`);
    }

    return reward;
  }

  async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.findOne(id);
    const userId = updateRewardDto.userId;
    if (!userId || (reward.userId && reward.userId !== userId))
      throw new NotFoundException(
        'Recompensa não encontrada para este jogador.',
      );
    await this.usersService.findOne(userId);
    if (!reward.userId) {
      const data = {
        ...(updateRewardDto.title !== undefined && {
          title: updateRewardDto.title,
        }),
        ...(updateRewardDto.description !== undefined && {
          description: updateRewardDto.description,
        }),
        ...(updateRewardDto.price !== undefined && {
          price: updateRewardDto.price,
        }),
        ...(updateRewardDto.available !== undefined && {
          hidden: !updateRewardDto.available,
        }),
      };
      const override = await this.prisma.rewardOverride.upsert({
        where: { userId_rewardId: { userId, rewardId: id } },
        create: { userId, rewardId: id, ...data },
        update: data,
      });
      return this.applyOverride(reward, override);
    }

    return this.prisma.reward.update({
      where: { id },
      data: {
        ...(updateRewardDto.title && { title: updateRewardDto.title }),
        ...(updateRewardDto.description !== undefined && {
          description: updateRewardDto.description,
        }),
        ...(updateRewardDto.price !== undefined && {
          price: updateRewardDto.price,
        }),
        ...(updateRewardDto.available !== undefined && {
          available: updateRewardDto.available,
        }),
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.update(id, { userId, available: false });
  }

  /**
   * Compra: confere disponibilidade, dono e saldo, desconta as moedas e registra no histórico
   * numa única transação (sem compra pela metade se algo falhar).
   */
  async claimReward(rewardId: string, userId: string) {
    // Serializable isolation prevents concurrent purchases from spending the same coins.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            let reward = await tx.reward.findFirst({
              where: { OR: [{ id: rewardId }, { key: rewardId }] },
            });
            if (!reward)
              throw new NotFoundException('Recompensa não encontrada.');
            if (!reward.userId) {
              const override = await tx.rewardOverride.findUnique({
                where: { userId_rewardId: { userId, rewardId: reward.id } },
              });
              reward = this.applyOverride(reward, override);
            }
            if (!reward.available)
              throw new BadRequestException(
                'Esta recompensa não está disponível no momento.',
              );
            if (reward.userId && reward.userId !== userId)
              throw new NotFoundException('Recompensa não encontrada.');
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw new NotFoundException('Jogador não encontrado.');
            const debit = await tx.user.updateMany({
              where: { id: userId, coins: { gte: reward.price } },
              data: { coins: { decrement: reward.price } },
            });
            if (debit.count !== 1)
              throw new BadRequestException(
                'Moedas insuficientes para comprar este item.',
              );
            const purchase = await tx.purchase.create({
              data: {
                title: reward.title,
                price: reward.price,
                userId,
                rewardId: reward.id,
              },
            });
            const updatedUser = await tx.user.findUniqueOrThrow({
              where: { id: userId },
            });
            return {
              message: `Recompensa '${reward.title}' resgatada com sucesso!`,
              reward,
              purchase,
              user: {
                id: updatedUser.id,
                level: updatedUser.level,
                xp: updatedUser.xp,
                remainingCoins: updatedUser.coins,
              },
            };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034'
        ) {
          if (attempt < 2) continue;
          throw new ConflictException(
            'Outra compra alterou o saldo. Atualize a loja e tente novamente.',
          );
        }
        throw error;
      }
    }
    throw new ConflictException('Não foi possível concluir a compra.');
  }
}
