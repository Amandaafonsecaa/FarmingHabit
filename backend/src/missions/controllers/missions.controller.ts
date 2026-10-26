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
import { MissionsService } from '../services/missions.service';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { Mission } from '../entities/mission.entity';

@ApiTags('missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar uma nova missão / desafio',
    description: 'Cadastra uma nova missão definindo prêmios de XP e Moedas.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Missão criada com sucesso.',
    type: Mission,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de validação incorretos.',
  })
  async create(@Body() createMissionDto: CreateMissionDto): Promise<Mission> {
    return this.missionsService.create(createMissionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar missões disponíveis',
    description: 'Retorna todas as missões globais ou missões do usuário.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID do usuário para filtrar missões específicas',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de missões retornada.',
    type: [Mission],
  })
  async findAll(@Query('userId') userId?: string): Promise<Mission[]> {
    return this.missionsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar detalhes de uma missão',
    description: 'Retorna informações de uma missão pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da missão',
    example: '7c86a11e-2ff7-44bc-b530-9b3ec7095493',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Missão encontrada.',
    type: Mission,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Missão não encontrada.',
  })
  async findOne(@Param('id') id: string): Promise<Mission> {
    return this.missionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma missão',
    description: 'Permite editar título, descrição, recompensas ou estado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da missão a atualizar',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Missão atualizada.',
    type: Mission,
  })
  async update(
    @Param('id') id: string,
    @Body() updateMissionDto: UpdateMissionDto,
  ): Promise<Mission> {
    return this.missionsService.update(id, updateMissionDto);
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Concluir missão e resgatar recompensas',
    description:
      'Marca a missão como completada e credita as recompensas de XP e Moedas para o usuário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da missão',
    example: '7c86a11e-2ff7-44bc-b530-9b3ec7095493',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID do usuário que receberá as recompensas',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Missão completada com sucesso!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Missão já concluída.',
  })
  async completeMission(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.missionsService.completeMission(id, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover missão',
    description: 'Exclui permanentemente uma missão.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da missão',
    example: '7c86a11e-2ff7-44bc-b530-9b3ec7095493',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Missão removida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Missão não encontrada.',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.missionsService.remove(id);
  }
}
