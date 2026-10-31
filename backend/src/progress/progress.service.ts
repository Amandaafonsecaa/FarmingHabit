import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HARVEST_REWARD, WEEK_BONUS, isPlayerToday } from './economy';
import {
  GOALS_KEY,
  amountOn,
  dailyTarget,
  isWeeklyGoalMet,
  mondayOf,
  parseGoalBook,
} from './goal-rules';
import { adjustWallet } from './wallet';

interface Claim {
  key: string;
  kind: 'harvest' | 'week';
  day: string;
  coins: number;
  xp: number;
}

/**
 * Economia do jogo: colheita de metas e bônus da semana. O servidor confere a ação,
 * decide o valor e paga uma vez só (livro-caixa reward_claims), atualizando moedas, XP e nível.
 */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /** Paga a colheita do dia (e o bônus da semana, se a meta semanal foi batida). Repetir não paga de novo. */
  async harvest(userId: string, goalId: string, day: string) {
    if (!isPlayerToday(day))
      throw new BadRequestException('A colheita só vale para o dia de hoje.');
    const stored = await this.prisma.userData.findUnique({
      where: { userId_key: { userId, key: GOALS_KEY } },
    });
    const book = parseGoalBook(stored?.value);
    const goal = book?.goals.find((item) => item.id === goalId);
    if (!book || !goal)
      throw new NotFoundException('Meta não encontrada na sua conta.');
    if (amountOn(goal, book, day) < dailyTarget(goal))
      throw new BadRequestException('Esta meta ainda não foi cumprida hoje.');

    const claims: Claim[] = [
      {
        key: `harvest:${day}:${goal.id}`,
        kind: 'harvest',
        day,
        ...HARVEST_REWARD,
      },
    ];
    if (isWeeklyGoalMet(goal, book, day))
      claims.push({
        key: `week:${mondayOf(day)}:${goal.id}`,
        kind: 'week',
        day,
        ...WEEK_BONUS,
      });
    const { paid, user } = await this.payOnce(userId, claims);
    return {
      coins: sum(paid, 'coins'),
      xp: sum(paid, 'xp'),
      weekBonus: paid.some((claim) => claim.kind === 'week'),
      user,
    };
  }

  /** Recompensas pagas entre dois dias (inclusive), para os gráficos da semana */
  async listClaims(userId: string, from: string, to: string) {
    return this.prisma.rewardClaim.findMany({
      where: { userId, day: { gte: from, lte: to } },
      select: { key: true, kind: true, day: true, coins: true, xp: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Registra as recompensas que ainda não existem e credita só essas, tudo na mesma transação */
  private async payOnce(
    userId: string,
    claims: Claim[],
  ): Promise<{ paid: Claim[]; user: User }> {
    return this.prisma.$transaction(async (tx) => {
      const paid: Claim[] = [];
      for (const claim of claims) {
        const { count } = await tx.rewardClaim.createMany({
          data: [
            {
              userId,
              key: claim.key,
              kind: claim.kind,
              day: claim.day,
              coins: claim.coins,
              xp: claim.xp,
            },
          ],
          skipDuplicates: true,
        });
        if (count === 1) paid.push(claim);
      }
      const user = paid.length
        ? (
            await adjustWallet(tx, userId, sum(paid, 'coins'), sum(paid, 'xp'))
          )[0]
        : await tx.user.findUniqueOrThrow({ where: { id: userId } });
      return { paid, user };
    });
  }
}

const sum = (claims: Claim[], field: 'coins' | 'xp') =>
  claims.reduce((total, claim) => total + claim[field], 0);
