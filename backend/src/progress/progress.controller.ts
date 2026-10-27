import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ClaimsQueryDto, HarvestDto, OpenChestDto } from './dto/progress.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';

/** Ganhos do jogador: o servidor confere a ação e decide quanto ela paga */
@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('harvest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Colher uma meta cumprida hoje',
    description:
      'Confere nas metas salvas na conta que o dia foi cumprido e paga a colheita (e o bônus da semana) uma única vez. Repetir devolve 0 moedas.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Moedas e XP pagos agora e o jogador atualizado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Meta não cumprida ou data que não é hoje.',
  })
  async harvest(@CurrentUser() user: AuthUser, @Body() dto: HarvestDto) {
    return this.progressService.harvest(user.id, dto.goalId, dto.date);
  }

  @Post('chests/:chestId/open')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Abrir um baú da jornada',
    description:
      'O baú precisa ter sido alcançado pelas missões cumpridas. O conteúdo é sorteado no servidor e pago uma vez; abrir de novo devolve o mesmo conteúdo sem pagar.',
  })
  @ApiParam({
    name: 'chestId',
    example: '1:0:2',
    description: 'volta:capítulo:parada',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conteúdo do baú, moedas e XP pagos e o jogador atualizado.',
  })
  async openChest(
    @CurrentUser() user: AuthUser,
    @Param('chestId') chestId: string,
    @Body() dto: OpenChestDto,
  ) {
    return this.progressService.openChest(user.id, chestId, dto.date);
  }

  @Get('claims')
  @ApiOperation({
    summary: 'Recompensas pagas num período',
    description:
      'Colheitas, bônus da semana e baús entre dois dias (inclusive).',
  })
  async listClaims(
    @CurrentUser() user: AuthUser,
    @Query() query: ClaimsQueryDto,
  ) {
    return this.progressService.listClaims(user.id, query.from, query.to);
  }
}
