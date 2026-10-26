import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RewardsService } from './rewards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';

describe('Shop purchase transaction', () => {
  const reward = {
    id: 'reward',
    key: 'fixo-cafe',
    title: 'Café',
    price: 150,
    available: true,
    userId: null,
  };
  let tx: any;
  let prisma: any;
  let service: RewardsService;
  beforeEach(() => {
    tx = {
      rewardOverride: { findUnique: jest.fn().mockResolvedValue(null) },
      reward: { findFirst: jest.fn().mockResolvedValue(reward) },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'player', coins: 200 }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ id: 'player', coins: 50, level: 1, xp: 0 }),
      },
      purchase: {
        create: jest.fn().mockResolvedValue({
          id: 'purchase',
          title: 'Café',
          price: 150,
          used: false,
        }),
      },
    };
    prisma = {
      $transaction: jest
        .fn()
        .mockImplementation((callback: any) => callback(tx)),
    };
    service = new RewardsService(
      prisma as PrismaService,
      {
        findOne: jest.fn().mockResolvedValue({ id: 'player' }),
      } as unknown as UsersService,
    );
  });
  it('debits the server price and snapshots a fixed item in the same serializable transaction', async () => {
    const result = await service.claimReward('fixo-cafe', 'player');
    expect(result.user.remainingCoins).toBe(50);
    expect(result.purchase.id).toBe('purchase');
    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'player', coins: { gte: 150 } },
      data: { coins: { decrement: 150 } },
    });
    expect(tx.purchase.create).toHaveBeenCalledWith({
      data: { title: 'Café', price: 150, userId: 'player', rewardId: 'reward' },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });
  it('does not create a purchase when the conditional debit fails', async () => {
    tx.user.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.claimReward('reward', 'player'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.purchase.create).not.toHaveBeenCalled();
  });
  it('rejects unavailable items before debiting', async () => {
    tx.reward.findFirst.mockResolvedValue({ ...reward, available: false });
    await expect(
      service.claimReward('reward', 'player'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });
  it('does not buy another player’s personal reward', async () => {
    tx.reward.findFirst.mockResolvedValue({ ...reward, userId: 'other' });
    await expect(
      service.claimReward('reward', 'player'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });
  it('retries a serialization conflict from a concurrent purchase', async () => {
    prisma.$transaction.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('conflict', {
        code: 'P2034',
        clientVersion: '6',
      }),
    );
    await expect(
      service.claimReward('reward', 'player'),
    ).resolves.toHaveProperty('purchase');
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });
  it('does not hide a storage failure or perform an independent debit outside the transaction', async () => {
    tx.purchase.create.mockRejectedValue(new Error('storage failed'));
    await expect(service.claimReward('reward', 'player')).rejects.toThrow(
      'storage failed',
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
  it('stores fixed-item edits only for the selected player', async () => {
    prisma.reward = {
      findUnique: jest.fn().mockResolvedValue(reward),
      update: jest.fn(),
    };
    prisma.rewardOverride = {
      upsert: jest
        .fn()
        .mockResolvedValue({
          title: 'Meu café',
          price: 40,
          description: '',
          hidden: false,
        }),
    };
    const updated = await service.update('reward', {
      userId: 'player',
      title: 'Meu café',
      description: '',
      price: 40,
    });
    expect(updated.title).toBe('Meu café');
    expect(updated.price).toBe(40);
    expect(updated.description).toBe('');
    expect(prisma.reward.update).not.toHaveBeenCalled();
    expect(prisma.rewardOverride.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_rewardId: { userId: 'player', rewardId: 'reward' } },
      }),
    );
  });
  it('charges the personal price and snapshots the personal title', async () => {
    tx.rewardOverride.findUnique.mockResolvedValue({
      title: 'Meu café',
      price: 40,
      description: '',
      hidden: false,
    });
    await service.claimReward('reward', 'player');
    expect(tx.purchase.create).toHaveBeenCalledWith({
      data: {
        title: 'Meu café',
        price: 40,
        userId: 'player',
        rewardId: 'reward',
      },
    });
  });
  it('rejects buying a fixed item removed from this player’s showcase', async () => {
    tx.rewardOverride.findUnique.mockResolvedValue({
      title: null,
      description: null,
      price: null,
      hidden: true,
    });
    await expect(
      service.claimReward('reward', 'player'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });
  it('rejects editing or deleting another player’s item', async () => {
    prisma.reward = {
      findUnique: jest
        .fn()
        .mockResolvedValue({ ...reward, key: null, userId: 'other' }),
    };
    await expect(service.remove('reward', 'player')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
