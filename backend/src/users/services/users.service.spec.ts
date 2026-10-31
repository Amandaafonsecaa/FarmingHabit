import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

describe('UsersService', () => {
  let prisma: any;
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
      user: { findUnique: jest.fn().mockResolvedValue(user) },
    };
    service = new UsersService(
      prisma as PrismaService,
      {} as SupabaseStorageService,
    );
  });

  it('loads the player without relations', async () => {
    await service.findOne('player');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'player' },
    });
  });
});
