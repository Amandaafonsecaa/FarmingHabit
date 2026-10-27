import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMotivationDto } from '../dto/update-motivation.dto';
import { SaveUserDataDto } from '../dto/save-user-data.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Motivation, Prisma, User } from '@prisma/client';
import type { ResetScope } from '../dto/reset-user-data.dto';
import { randomUUID } from 'node:crypto';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { adjustWallet } from '../../progress/wallet';

const MOTIVATION_BUCKET = 'motivation-photos';
/** Só chaves do próprio jogo ("farminghabit.algo.v1") */
const DATA_KEY = /^farminghabit\.[a-z0-9.-]{1,60}$/;
/** Chaves sincronizadas do navegador que pertencem a cada parte apagável (perfil e preferências ficam de fora) */
const RESET_DATA_KEYS: Record<ResetScope, string[]> = {
  goals: ['farminghabit.goals.v1', 'farminghabit.harvest-rewards.v1', 'farminghabit.perfect-day'],
  diary: ['farminghabit.diary.v1', 'farminghabit.adventures.v1'],
  missions: ['farminghabit.missions.accepted.v1'],
  shop: ['farminghabit.wish.v1'],
  treasure: ['farminghabit.treasure.v1'],
  motivation: [],
  progress: [],
};
export interface MotivationView { text: string; photoUrl: string | null; createdAt: Date | null; updatedAt: Date | null }

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly storage: SupabaseStorageService) {}

  /**
   * Garante a linha do jogador para a conta que acabou de se autenticar (o id é o UUID do Supabase Auth).
   * Chamado pelo AuthGuard em toda requisição; o create só roda na primeira vez.
   */
  async ensureUser(id: string, email: string, displayName?: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (existing) return existing;
    const name = displayName?.trim().slice(0, 40) || email.split('@')[0].slice(0, 40) || 'Aventureiro';
    try {
      return await this.prisma.user.create({ data: { id, email, name } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Este e-mail já está ligado a outro jogador.');
      }
      throw error;
    }
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
        ...(updateUserDto.name?.trim() && { name: updateUserDto.name.trim() }),
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

  /**
   * Apaga só as partes escolhidas (metas, diário, missões, loja, baús, motivação, progresso), tudo numa transação.
   * A conta (nome, e-mail, perfil e preferências) nunca é apagada aqui.
   */
  async resetData(id: string, scopes: ResetScope[]): Promise<User> {
    await this.findOne(id);
    const chosen = new Set(scopes);
    const where = { userId: id };
    const operations: Prisma.PrismaPromise<unknown>[] = [];
    if (chosen.has('goals')) operations.push(this.prisma.habit.deleteMany({ where }));
    if (chosen.has('missions')) operations.push(this.prisma.mission.deleteMany({ where }));
    if (chosen.has('shop')) operations.push(
      this.prisma.purchase.deleteMany({ where }),
      this.prisma.rewardOverride.deleteMany({ where }),
      this.prisma.reward.deleteMany({ where }),
    );
    if (chosen.has('motivation')) operations.push(this.prisma.motivation.deleteMany({ where }));
    const keys = scopes.flatMap(scope => RESET_DATA_KEYS[scope]);
    if (keys.length) operations.push(this.prisma.userData.deleteMany({ where: { userId: id, key: { in: keys } } }));
    if (chosen.has('treasure')) {
      // Baús voltam a ficar fechados e o que eles pagaram sai do saldo (senão reabrir daria moedas de novo)
      const chests = await this.prisma.rewardClaim.findMany({ where: { userId: id, kind: 'chest' }, select: { coins: true, xp: true } });
      operations.push(this.prisma.rewardClaim.deleteMany({ where: { userId: id, kind: 'chest' } }));
      const coins = chests.reduce((total, chest) => total + chest.coins, 0);
      const xp = chests.reduce((total, chest) => total + chest.xp, 0);
      if (!chosen.has('progress') && (coins || xp)) operations.push(adjustWallet(this.prisma, id, -coins, -xp));
    }
    if (chosen.has('progress')) operations.push(this.prisma.user.update({ where: { id }, data: { level: 1, xp: 0, coins: 0 } }));

    // A foto da motivação mora no Storage: guarda o caminho antes de apagar a linha
    const photoPath = chosen.has('motivation') ? (await this.prisma.motivation.findUnique({ where }))?.photoPath ?? null : null;
    await this.prisma.$transaction(operations);
    if (photoPath) await this.storage.remove(MOTIVATION_BUCKET, [photoPath]);
    return this.findOne(id);
  }
}
