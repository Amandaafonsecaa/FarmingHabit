import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Habit } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHabitDto: CreateHabitDto, userId: string): Promise<Habit> {
    return this.prisma.habit.create({
      data: {
        title: createHabitDto.title,
        progress: createHabitDto.progress ?? 0,
        userId,
      },
    });
  }

  /** Só os hábitos do jogador logado */
  async findAll(userId: string): Promise<Habit[]> {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Habit> {
    const habit = await this.prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      throw new NotFoundException(`Hábito com ID ${id} não encontrado.`);
    }

    return habit;
  }

  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string): Promise<Habit> {
    await this.findOne(id, userId);

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

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.findOne(id, userId);
    await this.prisma.habit.delete({
      where: { id },
    });

    return { message: `Hábito ${id} removido com sucesso.` };
  }
}
