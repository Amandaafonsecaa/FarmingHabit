import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ClaimsQueryDto, HarvestDto } from './dto/progress.dto';
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

  @Get('claims')
  @ApiOperation({
    summary: 'Recompensas pagas num período',
    description: 'Colheitas e bônus da semana entre dois dias (inclusive).',
  })
  async listClaims(
    @CurrentUser() user: AuthUser,
    @Query() query: ClaimsQueryDto,
  ) {
    return this.progressService.listClaims(user.id, query.from, query.to);
  }
}
