import { NotFoundException } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';

describe('Purchased item usage', () => {
  let prisma: any;
  let service: PurchasesService;
  beforeEach(() => {
    prisma = {
      purchase: {
        findFirst: jest.fn(),
        update: jest.fn().mockImplementation(({ data }: any) => data),
      },
    };
    service = new PurchasesService(prisma as PrismaService, {} as UsersService);
  });
  it('requires the purchase to belong to the selected player', async () => {
    prisma.purchase.findFirst.mockResolvedValue(null);
    await expect(
      service.setUsed('purchase', true, 'player'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.purchase.findFirst).toHaveBeenCalledWith({
      where: { id: 'purchase', userId: 'player' },
    });
    expect(prisma.purchase.update).not.toHaveBeenCalled();
  });
  it('records when the item was enjoyed', async () => {
    prisma.purchase.findFirst.mockResolvedValue({ used: false });
    await expect(service.setUsed('purchase', true, 'player')).resolves.toEqual({
      used: true,
      usedAt: expect.any(Date),
    });
  });
  it('does not change the original timestamp when the same state is sent again', async () => {
    const purchase = { used: true, usedAt: new Date('2026-10-25') };
    prisma.purchase.findFirst.mockResolvedValue(purchase);
    expect(await service.setUsed('purchase', true, 'player')).toBe(purchase);
    expect(prisma.purchase.update).not.toHaveBeenCalled();
  });
  it('allows undoing usage without refunding or spending coins', async () => {
    prisma.purchase.findFirst.mockResolvedValue({ used: true });
    await expect(service.setUsed('purchase', false, 'player')).resolves.toEqual(
      { used: false, usedAt: null },
    );
  });
});
