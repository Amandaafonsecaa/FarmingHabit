import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ClaimsQueryDto } from './dto/progress.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';

/** Ganhos do jogador: o servidor confere a ação e decide quanto ela paga */
@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

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
