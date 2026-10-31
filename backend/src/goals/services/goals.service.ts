import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DAY_PATTERN,
  HARVEST_REWARD,
  WEEK_BONUS,
  isPlayerToday,
  isUpToPlayerToday,
} from '../../progress/economy';
import {
  GOALS_KEY,
  dailyTarget,
  isWeeklyGoalMet,
  mondayOf,
  parseGoals,
  weekDays,
} from '../../progress/goal-rules';
import { Claim, payOnce, sumClaims } from '../../progress/ledger';

export interface CheckinView {
  goalId: string;
  day: string;
  amount: number;
}
export type CheckinResult = CheckinView & {
  coins: number;
  xp: number;
  weekBonus: boolean;
  user: User;
};

const MAX_IMPORT_ENTRIES = 20_000;
const MAX_AMOUNT = 10_000;
const MAX_GOAL_ID = 100;

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Todo o histórico de check-ins do jogador */
  async list(userId: string): Promise<CheckinView[]> {
    return this.prisma.goalCheckin.findMany({
      where: { userId },
      select: { goalId: true, day: true, amount: true },
      orderBy: [{ day: 'asc' }, { goalId: 'asc' }],
    });
  }

  /** Grava (ou apaga, com quantidade 0) o check-in e paga a colheita do dia na mesma transação */
  async setCheckin(
    userId: string,
    goalId: string,
    day: string,
    amount: number,
  ): Promise<CheckinResult> {
    if (!isUpToPlayerToday(day)) {
      throw new BadRequestException('Dia inválido ou no futuro.');
    }
    return this.prisma.$transaction(async (tx) => {
      if (amount === 0) {
        await tx.goalCheckin.deleteMany({ where: { userId, goalId, day } });
      } else {
        await tx.goalCheckin.upsert({
          where: { userId_goalId_day: { userId, goalId, day } },
          create: { userId, goalId, day, amount },
          update: { amount },
        });
      }

      const none = { coins: 0, xp: 0, weekBonus: false };
      const base = { goalId, day, amount };
      if (amount === 0 || !isPlayerToday(day)) {
        return { ...base, ...none, user: await this.currentUser(tx, userId) };
      }
      const stored = await tx.userData.findUnique({
        where: { userId_key: { userId, key: GOALS_KEY } },
      });
      const goal = parseGoals(stored?.value)?.find((g) => g.id === goalId);
      if (!goal || amount < dailyTarget(goal)) {
        return { ...base, ...none, user: await this.currentUser(tx, userId) };
      }

      const claims: Claim[] = [
        {
          key: `harvest:${day}:${goalId}`,
          kind: 'harvest',
          day,
          ...HARVEST_REWARD,
        },
      ];
      const week = await tx.goalCheckin.findMany({
        where: { userId, goalId, day: { in: weekDays(day) } },
        select: { day: true, amount: true },
      });
      const amounts = Object.fromEntries(week.map((r) => [r.day, r.amount]));
      if (isWeeklyGoalMet(goal, amounts, day)) {
        const monday = mondayOf(day);
        claims.push({
          key: `week:${monday}:${goalId}`,
          kind: 'week',
          day: monday,
          ...WEEK_BONUS,
        });
      }
      const { paid, user } = await payOnce(tx, userId, claims);
      return {
        ...base,
        coins: sumClaims(paid, 'coins'),
        xp: sumClaims(paid, 'xp'),
        weekBonus: paid.some((claim) => claim.kind === 'week'),
        user,
      };
    });
  }

  /** Apaga todo o histórico de uma meta (usado ao excluí-la) */
  async removeGoal(userId: string, goalId: string) {
    const { count } = await this.prisma.goalCheckin.deleteMany({
      where: { userId, goalId },
    });
    return { goalId, removed: count };
  }

  /** Importa o histórico antigo do navegador; nunca paga e ignora o que já existe */
  async importLog(
    userId: string,
    log: Record<string, Record<string, number>>,
  ): Promise<{ imported: number }> {
    const data: {
      userId: string;
      goalId: string;
      day: string;
      amount: number;
    }[] = [];
    for (const [goalId, days] of Object.entries(log ?? {})) {
      if (
        !goalId ||
        goalId.length > MAX_GOAL_ID ||
        !days ||
        typeof days !== 'object'
      ) {
        throw new BadRequestException('Histórico inválido.');
      }
      for (const [day, amount] of Object.entries(days)) {
        if (
          !DAY_PATTERN.test(day) ||
          !isUpToPlayerToday(day) ||
          !Number.isInteger(amount) ||
          amount < 1 ||
          amount > MAX_AMOUNT
        ) {
          throw new BadRequestException('Histórico inválido.');
        }
        data.push({ userId, goalId, day, amount });
        if (data.length > MAX_IMPORT_ENTRIES) {
          throw new BadRequestException('Histórico grande demais.');
        }
      }
    }
    const { count } = await this.prisma.goalCheckin.createMany({
      data,
      skipDuplicates: true,
    });
    return { imported: count };
  }

  private currentUser(
    tx: Pick<PrismaService, 'user'>,
    userId: string,
  ): Promise<User> {
    return tx.user.findUniqueOrThrow({ where: { id: userId } });
  }
}
