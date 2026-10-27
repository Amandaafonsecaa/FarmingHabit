import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMotivationDto } from '../dto/update-motivation.dto';
import { SaveUserDataDto } from '../dto/save-user-data.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Motivation, User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

const MOTIVATION_BUCKET = 'motivation-photos';
/** Só chaves do próprio jogo ("farminghabit.algo.v1") */
const DATA_KEY = /^farminghabit\.[a-z0-9.-]{1,60}$/;
/** O que "apagar tudo" mantém: perfil e preferências fazem parte da conta */
const ACCOUNT_DATA_KEYS = ['farminghabit.profile.v1', 'farminghabit.settings.v1'];
export interface MotivationView { text: string; photoUrl: string | null; createdAt: Date | null; updatedAt: Date | null }

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly storage: SupabaseStorageService) {}

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

  /** Motivação do jogador (a foto vem como link temporário do bucket privado); quem ainda não escreveu recebe uma vazia */
  async getMotivation(userId: string): Promise<MotivationView> {
    await this.findOne(userId);
    const motivation = await this.prisma.motivation.findUnique({ where: { userId } });
    return this.toView(motivation);
  }

  /** Salva a frase e a foto (photo: data URL troca a foto, null remove, ausente mantém a atual) */
  async saveMotivation(userId: string, dto: UpdateMotivationDto): Promise<MotivationView> {
    await this.findOne(userId);
    const current = await this.prisma.motivation.findUnique({ where: { userId } });
    let photoPath: string | null | undefined;
    if (dto.photo === null) photoPath = null;
    else if (dto.photo) {
      const [, mime, base64] = dto.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/) ?? [];
      if (!mime) throw new BadRequestException('A foto deve ser uma imagem JPEG, PNG ou WebP.');
      // Sempre dentro da pasta do usuário: é o que as regras do bucket conferem
      photoPath = `${userId}/${randomUUID()}.${mime.split('/')[1].replace('jpeg', 'jpg')}`;
      await this.storage.upload(MOTIVATION_BUCKET, photoPath, Buffer.from(base64, 'base64'), mime);
    }
    const text = dto.text.trim();
    const saved = await this.prisma.motivation.upsert({
      where: { userId },
      create: { userId, text, photoPath: photoPath ?? null },
      update: { text, ...(photoPath !== undefined && { photoPath }) },
    });
    // A foto antiga só sai do bucket depois que a nova já está salva
    if (photoPath !== undefined && current?.photoPath && current.photoPath !== photoPath) await this.storage.remove(MOTIVATION_BUCKET, [current.photoPath]);
    return this.toView(saved);
  }

  private async toView(motivation: Motivation | null): Promise<MotivationView> {
    return {
      text: motivation?.text ?? '',
      photoUrl: motivation?.photoPath ? await this.storage.signedUrl(MOTIVATION_BUCKET, motivation.photoPath) : null,
      createdAt: motivation?.createdAt ?? null,
      updatedAt: motivation?.updatedAt ?? null,
    };
  }

  /** Todos os dados sincronizados do jogador, com a data da última alteração de cada chave */
  async listData(userId: string): Promise<{ key: string; value: string; updatedAt: Date }[]> {
    await this.findOne(userId);
    return this.prisma.userData.findMany({ where: { userId }, select: { key: true, value: true, updatedAt: true } });
  }

  async saveData(userId: string, key: string, dto: SaveUserDataDto): Promise<{ key: string; updatedAt: Date }> {
    if (!DATA_KEY.test(key)) throw new BadRequestException('Chave de dados inválida.');
    await this.findOne(userId);
    const saved = await this.prisma.userData.upsert({
      where: { userId_key: { userId, key } },
      create: { userId, key, value: dto.value },
      update: { value: dto.value },
    });
    return { key: saved.key, updatedAt: saved.updatedAt };
  }

  async deleteData(userId: string, key: string): Promise<{ key: string }> {
    if (!DATA_KEY.test(key)) throw new BadRequestException('Chave de dados inválida.');
    await this.findOne(userId);
    await this.prisma.userData.deleteMany({ where: { userId, key } });
    return { key };
  }

  /** Apaga tudo que o jogador criou ou conquistou, mas mantém a conta (nome e e-mail) */
  async resetData(id: string): Promise<User> {
    await this.findOne(id);
    const [, , , , , , user] = await this.prisma.$transaction([
      this.prisma.purchase.deleteMany({ where: { userId: id } }),
      this.prisma.rewardOverride.deleteMany({ where: { userId: id } }),
      this.prisma.reward.deleteMany({ where: { userId: id } }),
      this.prisma.mission.deleteMany({ where: { userId: id } }),
      this.prisma.habit.deleteMany({ where: { userId: id } }),
      this.prisma.userData.deleteMany({ where: { userId: id, key: { notIn: ACCOUNT_DATA_KEYS } } }),
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
