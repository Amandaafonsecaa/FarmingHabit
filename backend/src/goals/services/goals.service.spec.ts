import { BadRequestException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { PrismaService } from '../../prisma/prisma.service';

const day = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const TODAY = day(0);
const PAST = day(-3);

const blob = (goals: unknown[]) => JSON.stringify({ goals });
const reading = { id: 'leitura', frequency: { kind: 'daily' } };

describe('GoalsService', () => {
  let tx: {
    goalCheckin: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
    };
    userData: { findUnique: jest.Mock };
    rewardClaim: { createMany: jest.Mock };
    user: { findUniqueOrThrow: jest.Mock };
    $queryRaw: jest.Mock;
  };
  let prisma: {
    $transaction: jest.Mock;
    goalCheckin: { findMany: jest.Mock; createMany: jest.Mock };
  };
  let service: GoalsService;
  const player = { id: 'p', coins: 5, xp: 5, level: 1 };

  beforeEach(() => {
    tx = {
      goalCheckin: {
        upsert: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      userData: {
        findUnique: jest.fn().mockResolvedValue({ value: blob([reading]) }),
      },
      rewardClaim: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue(player) },
      $queryRaw: jest.fn().mockResolvedValue([player]),
    };
    prisma = {
      $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
      goalCheckin: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    service = new GoalsService(prisma as unknown as PrismaService);
  });

  it('saves the check-in and pays the harvest of today', async () => {
    const result = await service.setCheckin('p', 'leitura', TODAY, 1);
    expect(result).toMatchObject({
      goalId: 'leitura',
      day: TODAY,
      amount: 1,
      coins: 5,
      xp: 5,
      weekBonus: false,
      user: player,
    });
    expect(tx.goalCheckin.upsert).toHaveBeenCalledTimes(1);
    expect(tx.rewardClaim.createMany).toHaveBeenCalledTimes(1);
    expect(tx.rewardClaim.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            key: `harvest:${TODAY}:leitura`,
            kind: 'harvest',
          }),
        ],
      }),
    );
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('does not pay again after unchecking and checking', async () => {
    tx.rewardClaim.createMany.mockResolvedValue({ count: 0 });
    const result = await service.setCheckin('p', 'leitura', TODAY, 1);
    expect(tx.rewardClaim.createMany).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).not.toHaveBeenCalled();
    expect(result).toMatchObject({ coins: 0, xp: 0, weekBonus: false });
  });

  it('pays the weekly bonus when the week target is met', async () => {
    const weekly = {
      id: 'leitura',
      frequency: { kind: 'weekly', timesPerWeek: 1 },
    };
    tx.userData.findUnique.mockResolvedValue({ value: blob([weekly]) });
    tx.goalCheckin.findMany.mockResolvedValue([{ day: TODAY, amount: 1 }]);
    const result = await service.setCheckin('p', 'leitura', TODAY, 1);
    const keys = tx.rewardClaim.createMany.mock.calls.map(
      (call: [{ data: { key: string }[] }]) => call[0].data[0].key,
    );
    expect(keys).toEqual([
      `harvest:${TODAY}:leitura`,
      expect.stringMatching(/^week:\d{4}-\d{2}-\d{2}:leitura$/),
    ]);
    expect(result).toMatchObject({ coins: 20, xp: 15, weekBonus: true });
  });

  it('stores past days without paying', async () => {
    await service.setCheckin('p', 'leitura', PAST, 1);
    expect(tx.goalCheckin.upsert).toHaveBeenCalledTimes(1);
    expect(tx.rewardClaim.createMany).not.toHaveBeenCalled();
    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it('rejects future days', async () => {
    await expect(
      service.setCheckin('p', 'leitura', '2999-01-01', 1),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes the row when the amount is zero', async () => {
    const result = await service.setCheckin('p', 'leitura', TODAY, 0);
    expect(tx.goalCheckin.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'p', goalId: 'leitura', day: TODAY },
    });
    expect(tx.goalCheckin.upsert).not.toHaveBeenCalled();
    expect(result).toMatchObject({ amount: 0, coins: 0, xp: 0 });
  });

  it('does not touch other goals', async () => {
    await service.setCheckin('p', 'leitura', TODAY, 1);
    expect(tx.goalCheckin.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_goalId_day: { userId: 'p', goalId: 'leitura', day: TODAY },
        },
      }),
    );
  });

  it('saves the check-in of an unknown goal without paying', async () => {
    tx.userData.findUnique.mockResolvedValue({ value: blob([]) });
    const result = await service.setCheckin('p', 'leitura', TODAY, 1);
    expect(tx.goalCheckin.upsert).toHaveBeenCalledTimes(1);
    expect(tx.rewardClaim.createMany).not.toHaveBeenCalled();
    expect(result).toMatchObject({ coins: 0, xp: 0 });
  });

  it('imports a log without paying', async () => {
    const result = await service.importLog('p', {
      leitura: { [PAST]: 1, [TODAY]: 2 },
    });
    expect(prisma.goalCheckin.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'p', goalId: 'leitura', day: PAST, amount: 1 },
        { userId: 'p', goalId: 'leitura', day: TODAY, amount: 2 },
      ],
      skipDuplicates: true,
    });
    expect(tx.rewardClaim.createMany).not.toHaveBeenCalled();
    expect(result).toEqual({ imported: 2 });
  });

  it('rejects malformed import entries', async () => {
    for (const log of [
      { leitura: { '31/10/2026': 1 } },
      { leitura: { [TODAY]: 0 } },
      { leitura: { [TODAY]: 1.5 } },
      { leitura: { '2999-01-01': 1 } },
    ]) {
      await expect(service.importLog('p', log)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    }
  });
});
