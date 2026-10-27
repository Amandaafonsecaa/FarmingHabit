import { BadRequestException, NotFoundException } from '@nestjs/common';
import { isPlayerToday, levelFor } from './economy';
import {
  dailyTarget,
  isWeeklyGoalMet,
  mondayOf,
  parseGoalBook,
  weekChecks,
  type GoalBook,
} from './goal-rules';
import { chestFromId, lootTotals, rollLoot } from './chest-rules';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';

const TODAY = new Date().toISOString().slice(0, 10);

describe('economy rules', () => {
  it('levels up every 100 XP', () => {
    expect([levelFor(0), levelFor(99), levelFor(100), levelFor(250)]).toEqual([
      1, 1, 2, 3,
    ]);
  });
  it('accepts only "today" in some time zone', () => {
    const now = new Date('2026-10-27T12:00:00Z');
    expect(isPlayerToday('2026-10-27', now)).toBe(true);
    expect(isPlayerToday('2026-10-28', now)).toBe(true); // UTC+14 já é dia 28
    expect(isPlayerToday('2026-10-26', new Date('2026-10-27T05:00:00Z'))).toBe(
      true,
    ); // UTC−12 ainda é dia 26
    expect(isPlayerToday('2026-10-25', now)).toBe(false);
    expect(isPlayerToday('2026-10-29', now)).toBe(false);
    expect(isPlayerToday('27/10/2026', now)).toBe(false);
  });
});

describe('goal rules', () => {
  const book: GoalBook = {
    goals: [
      {
        id: 'agua',
        frequency: { kind: 'daily' },
        measure: { kind: 'quantity', target: 8 },
      },
      {
        id: 'academia',
        frequency: { kind: 'weekly', timesPerWeek: 2 },
        measure: { kind: 'check' },
      },
    ],
    log: {
      '2026-10-26': { academia: 1 },
      '2026-10-27': { agua: 8, academia: 1 },
    },
  };
  it('uses the quantity target or 1 for checks', () => {
    expect(dailyTarget(book.goals[0])).toBe(8);
    expect(dailyTarget(book.goals[1])).toBe(1);
  });
  it('finds the monday of the week', () => {
    expect(mondayOf('2026-10-27')).toBe('2026-10-26');
    expect(mondayOf('2026-11-01')).toBe('2026-10-26');
    expect(mondayOf('2026-10-26')).toBe('2026-10-26');
  });
  it('counts week checks and detects a met weekly goal', () => {
    expect(weekChecks(book.goals[1], book, '2026-10-27')).toBe(2);
    expect(isWeeklyGoalMet(book.goals[1], book, '2026-10-27')).toBe(true);
    expect(isWeeklyGoalMet(book.goals[0], book, '2026-10-27')).toBe(false);
  });
  it('rejects malformed goal storage', () => {
    expect(parseGoalBook('{oops')).toBeNull();
    expect(parseGoalBook(JSON.stringify({ goals: 'x', log: {} }))).toBeNull();
  });
});

describe('chest rules', () => {
  it('maps ids to journey stops that hold chests', () => {
    expect(chestFromId('1:0:2')).toMatchObject({ size: 'mid', requires: 3 });
    expect(chestFromId('1:0:4')).toMatchObject({ size: 'big', requires: 5 });
    expect(chestFromId('2:1:4')).toMatchObject({ size: 'big', requires: 30 });
    expect(chestFromId('1:0:1')).toBeNull();
    expect(chestFromId('1:9:2')).toBeNull();
    expect(chestFromId('abc')).toBeNull();
  });
  it('always pays coins within the size range', () => {
    const big = chestFromId('1:0:4')!;
    for (let i = 0; i < 50; i++) {
      const loot = rollLoot(big);
      expect(loot[0]).toMatchObject({ kind: 'coins' });
      expect(lootTotals(loot).coins).toBeGreaterThanOrEqual(30);
      expect(lootTotals(loot).coins).toBeLessThanOrEqual(70);
      expect(loot).toHaveLength(3);
    }
  });
});

describe('ProgressService', () => {
  let prisma: any;
  let tx: any;
  let service: ProgressService;
  const user = { id: 'player', coins: 15, xp: 15, level: 1 };
  const goals = (amount: number) => ({
    value: JSON.stringify({
      goals: [
        {
          id: 'leitura',
          frequency: { kind: 'daily' },
          measure: { kind: 'check' },
        },
      ],
      log: { [TODAY]: { leitura: amount } },
    }),
  });

  beforeEach(() => {
    tx = {
      rewardClaim: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue(user) },
      $queryRaw: jest.fn().mockResolvedValue([user]),
    };
    prisma = {
      userData: { findUnique: jest.fn().mockResolvedValue(goals(1)) },
      mission: { count: jest.fn().mockResolvedValue(0) },
      rewardClaim: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((fn: (client: unknown) => unknown) => fn(tx)),
    };
    service = new ProgressService(prisma as PrismaService);
  });

  it('pays a harvest decided by the server', async () => {
    const result = await service.harvest('player', 'leitura', TODAY);
    expect(result).toMatchObject({ coins: 5, xp: 5, weekBonus: false });
    expect(tx.rewardClaim.createMany.mock.calls[0][0].data[0]).toMatchObject({
      key: `harvest:${TODAY}:leitura`,
      coins: 5,
      xp: 5,
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('does not pay the same harvest twice', async () => {
    tx.rewardClaim.createMany.mockResolvedValue({ count: 0 });
    const result = await service.harvest('player', 'leitura', TODAY);
    expect(result).toMatchObject({ coins: 0, xp: 0 });
    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it('refuses a goal that was not done, unknown goals and other days', async () => {
    prisma.userData.findUnique.mockResolvedValue(goals(0));
    await expect(
      service.harvest('player', 'leitura', TODAY),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.harvest('player', 'inventada', TODAY),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.harvest('player', 'leitura', '2020-01-01'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('refuses chests the journey has not reached', async () => {
    prisma.mission.count.mockResolvedValue(2);
    await expect(
      service.openChest('player', '1:0:2', TODAY),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rolls and pays a reached chest once, and replays the stored loot afterwards', async () => {
    prisma.mission.count.mockResolvedValue(3);
    const first = await service.openChest('player', '1:0:2', TODAY);
    expect(first.alreadyOpened).toBe(false);
    expect(first.coins).toBeGreaterThanOrEqual(10);
    prisma.rewardClaim.findUnique.mockResolvedValue({ detail: first.loot });
    prisma.user = { findUniqueOrThrow: jest.fn().mockResolvedValue(user) };
    const again = await service.openChest('player', '1:0:2', TODAY);
    expect(again).toMatchObject({
      alreadyOpened: true,
      coins: 0,
      xp: 0,
      loot: first.loot,
    });
  });
});
