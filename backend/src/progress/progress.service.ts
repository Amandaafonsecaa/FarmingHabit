import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Consulta do livro-caixa de recompensas (reward_claims) */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /** Recompensas pagas entre dois dias (inclusive), para os gráficos da semana */
  async listClaims(userId: string, from: string, to: string) {
    return this.prisma.rewardClaim.findMany({
      where: { userId, day: { gte: from, lte: to } },
      select: { key: true, kind: true, day: true, coins: true, xp: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
