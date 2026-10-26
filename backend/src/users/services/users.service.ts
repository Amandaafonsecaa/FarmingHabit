import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        level: createUserDto.level ?? 1,
        xp: createUserDto.xp ?? 0,
        coins: createUserDto.coins ?? 0,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        habits: true,
        missions: true,
        rewards: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        habits: true,
        missions: true,
        rewards: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.name && { name: updateUserDto.name }),
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(updateUserDto.level !== undefined && { level: updateUserDto.level }),
        ...(updateUserDto.xp !== undefined && { xp: updateUserDto.xp }),
        ...(updateUserDto.coins !== undefined && { coins: updateUserDto.coins }),
      },
    });
  }

  /** Apaga tudo que o jogador criou ou conquistou, mas mantém a conta (nome e e-mail) */
  async resetData(id: string): Promise<User> {
    await this.findOne(id);
    const [, , , , , user] = await this.prisma.$transaction([
      this.prisma.purchase.deleteMany({ where: { userId: id } }),
      this.prisma.rewardOverride.deleteMany({ where: { userId: id } }),
      this.prisma.reward.deleteMany({ where: { userId: id } }),
      this.prisma.mission.deleteMany({ where: { userId: id } }),
      this.prisma.habit.deleteMany({ where: { userId: id } }),
      this.prisma.user.update({ where: { id }, data: { level: 1, xp: 0, coins: 0 } }),
    ]);
    return user;
  }

  /** Devolve XP e moedas de uma missão desfeita (nunca deixa negativo) e recalcula o nível */
  async revokeRewards(userId: string, xpToRemove: number, coinsToRemove: number): Promise<User> {
    const user = await this.findOne(userId);
    const newXp = Math.max(0, user.xp - xpToRemove);
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        coins: Math.max(0, user.coins - coinsToRemove),
        level: Math.floor(newXp / 100) + 1,
      },
    });
  }

  async addRewards(
    userId: string,
    xpToAdd: number,
    coinsToAdd: number,
  ): Promise<User> {
    const user = await this.findOne(userId);
    const newXp = user.xp + xpToAdd;
    const newCoins = user.coins + coinsToAdd;

    // Regra de evolução de nível: a cada 100 XP sobe 1 nível
    const newLevel = Math.floor(newXp / 100) + 1;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        coins: newCoins,
        level: newLevel,
      },
    });
  }

  async deductCoins(userId: string, amount: number): Promise<User> {
    const user = await this.findOne(userId);

    if (user.coins < amount) {
      throw new BadRequestException(
        `Saldo insuficiente. O item custa ${amount} moedas e você possui ${user.coins}.`,
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        coins: user.coins - amount,
      },
    });
  }
}
