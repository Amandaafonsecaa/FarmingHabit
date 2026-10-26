import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HabitsService } from '../services/habits.service';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import { Habit } from '../entities/habit.entity';

@ApiTags('habits')
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar um novo hábito',
    description:
      'Cadastra um novo hábito com título e progresso percentual inicial (0-100%).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hábito criado com sucesso.',
    type: Habit,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado.',
  })
  async create(@Body() createHabitDto: CreateHabitDto): Promise<Habit> {
    return this.habitsService.create(createHabitDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar hábitos',
    description: 'Retorna todos os hábitos ou filtra pelos hábitos de um usuário.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID do usuário para filtrar os hábitos',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de hábitos retornada.',
    type: [Habit],
  })
  async findAll(@Query('userId') userId?: string): Promise<Habit[]> {
    if (userId) {
      return this.habitsService.findAllByUser(userId);
    }
    return this.habitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar detalhes de um hábito',
    description: 'Retorna as informações e progresso de um hábito pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador do hábito',
    example: 'd9b2d63d-a233-4123-8566-f00e395b263b',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hábito retornado.',
    type: Habit,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hábito não encontrado.',
  })
  async findOne(@Param('id') id: string): Promise<Habit> {
    return this.habitsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar hábito / progresso',
    description:
      'Atualiza o título ou o percentual de progresso (0-100%) de um hábito.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do hábito',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hábito atualizado.',
    type: Habit,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hábito não encontrado.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ): Promise<Habit> {
    return this.habitsService.update(id, updateHabitDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover um hábito',
    description: 'Exclui permanentemente um hábito do usuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do hábito a ser removido',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hábito excluído com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hábito não encontrado.',
  })
  async remove(@Param('id') id: string) {
    return this.habitsService.remove(id);
  }
}
