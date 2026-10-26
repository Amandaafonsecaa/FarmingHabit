import { Injectable, NotFoundException } from '@nestjs/common';
import { Purchase } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(userId: string): Promise<Purchase[]> {
    await this.usersService.findOne(userId);

    return this.prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setUsed(id: string, used: boolean, userId: string): Promise<Purchase> {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id, userId },
    });

    if (!purchase) {
      throw new NotFoundException(`Compra com ID ${id} não encontrada.`);
    }

    if (purchase.used === used) return purchase;

    return this.prisma.purchase.update({
      where: { id },
      data: { used, usedAt: used ? new Date() : null },
    });
  }
}
