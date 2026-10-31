import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { RESET_SCOPES } from '../dto/reset-user-data.dto';

describe('UsersService', () => {
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock };
    userData: { upsert: jest.Mock };
  };
  let service: UsersService;
  const user = {
    id: 'player',
    name: 'Jogadora',
    email: 'jogadora@example.com',
    level: 1,
    xp: 0,
    coins: 0,
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        create: jest.fn(),
      },
      userData: {
        upsert: jest
          .fn()
          .mockResolvedValue({ key: 'k', updatedAt: new Date() }),
      },
    };
    service = new UsersService(
      prisma as unknown as PrismaService,
      {} as SupabaseStorageService,
    );
  });

  it('loads the player without relations', async () => {
    await service.findOne('player');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'player' },
    });
  });

  it('rejects the removed treasure scope', () => {
    expect(RESET_SCOPES).not.toContain('treasure');
  });

  const duplicate = () =>
    new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });

  it('returns the player created by a concurrent request', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user);
    prisma.user.create.mockRejectedValue(duplicate());
    await expect(service.ensureUser('player', user.email)).resolves.toBe(user);
  });

  it('still rejects an email owned by another player', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockRejectedValue(duplicate());
    await expect(
      service.ensureUser('player', user.email),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('accepts only the synced keys', async () => {
    await expect(
      service.saveData('player', 'farminghabit.cards.v1', { value: '{}' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.userData.upsert).not.toHaveBeenCalled();
    await service.saveData('player', 'farminghabit.goals.v1', { value: '{}' });
    expect(prisma.userData.upsert).toHaveBeenCalledTimes(1);
  });
});
