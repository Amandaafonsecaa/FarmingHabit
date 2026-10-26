import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RewardsService } from '../services/rewards.service';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { Reward } from '../entities/reward.entity';

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar nova recompensa na loja',
    description:
      'Cria uma recompensa / item cosmético definindo seu preço em moedas.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recompensa cadastrada.',
    type: Reward,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos.',
  })
  async create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardsService.create(createRewardDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar itens e recompensas disponíveis',
    description:
      'Retorna o catálogo de recompensas disponíveis para compra com moedas.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por recompensas específicas do usuário',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de recompensas.',
    type: [Reward],
  })
  async findAll(@Query('userId') userId?: string): Promise<Reward[]> {
    return this.rewardsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar detalhes de uma recompensa',
    description: 'Retorna informações de uma recompensa específica pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da recompensa',
    example: '8b63e8c2-3e2b-4fa9-83bc-42bfe041f909',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recompensa encontrada.',
    type: Reward,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recompensa não encontrada.',
  })
  async findOne(@Param('id') id: string): Promise<Reward> {
    return this.rewardsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar recompensa',
    description: 'Altera título, preço ou disponibilidade de uma recompensa.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da recompensa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recompensa atualizada.',
    type: Reward,
  })
  async update(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<Reward> {
    return this.rewardsService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Apagar recompensa da vitrine pessoal, preservando compras anteriores',
  })
  @ApiQuery({ name: 'userId', required: true })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ): Promise<void> {
    await this.rewardsService.remove(id, userId);
  }

  @Post(':id/claim')
  @ApiOperation({
    summary: 'Comprar / resgatar recompensa',
    description:
      'Deduz as moedas necessárias da conta do usuário e desbloqueia o item correspondente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da recompensa desejada',
    example: '8b63e8c2-3e2b-4fa9-83bc-42bfe041f909',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'ID do usuário que está comprando o item',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item resgatado com sucesso!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Saldo de moedas insuficiente ou item indisponível.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recompensa ou usuário não encontrado.',
  })
  async claimReward(
    @Param('id') id: string,
    @Query('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.rewardsService.claimReward(id, userId);
  }
}
