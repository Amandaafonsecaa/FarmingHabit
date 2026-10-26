import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';
import { Habit } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(createHabitDto: CreateHabitDto): Promise<Habit> {
    // Garante que o usuário existe
    await this.usersService.findOne(createHabitDto.userId);

    return this.prisma.habit.create({
      data: {
        title: createHabitDto.title,
        progress: createHabitDto.progress ?? 0,
        userId: createHabitDto.userId,
      },
    });
  }

  async findAll(): Promise<Habit[]> {
    return this.prisma.habit.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByUser(userId: string): Promise<Habit[]> {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Habit> {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      throw new NotFoundException(`Hábito com ID ${id} não encontrado.`);
    }

    return habit;
  }

  async update(id: string, updateHabitDto: UpdateHabitDto): Promise<Habit> {
    await this.findOne(id);

    return this.prisma.habit.update({
      where: { id },
      data: {
        ...(updateHabitDto.title && { title: updateHabitDto.title }),
        ...(updateHabitDto.progress !== undefined && {
          progress: updateHabitDto.progress,
        }),
      },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.habit.delete({
      where: { id },
    });

    return { message: `Hábito ${id} removido com sucesso.` };
  }
}
