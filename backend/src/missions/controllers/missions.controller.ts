import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MissionsService } from '../services/missions.service';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { Mission } from '../entities/mission.entity';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user';

@ApiTags('missions')
@ApiBearerAuth()
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
  async create(@CurrentUser() user: AuthUser, @Body() createMissionDto: CreateMissionDto): Promise<Mission> {
    return this.missionsService.create(createMissionDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar missões disponíveis',
    description: 'Retorna as missões do jogador logado e as globais.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de missões retornada.',
    type: [Mission],
  })
  async findAll(@CurrentUser() user: AuthUser): Promise<Mission[]> {
    return this.missionsService.findAll(user.id);
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
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<Mission> {
    return this.missionsService.findOne(id, user.id);
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
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateMissionDto: UpdateMissionDto,
  ): Promise<Mission> {
    return this.missionsService.update(id, updateMissionDto, user.id);
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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Missão completada com sucesso!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Missão já concluída.',
  })
  async completeMission(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.missionsService.completeMission(id, user.id);
  }

  @Patch(':id/uncomplete')
  @ApiOperation({
    summary: 'Desfazer missão concluída',
    description:
      'Volta a missão para "em aberto" e devolve o XP e as moedas que ela tinha creditado (sem deixar o saldo negativo).',
  })
  @ApiParam({ name: 'id', description: 'ID da missão' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Missão desfeita.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Missão ainda não concluída.' })
  async uncompleteMission(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.missionsService.uncompleteMission(id, user.id);
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
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<{ message: string }> {
    return this.missionsService.remove(id, user.id);
  }
}
