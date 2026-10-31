import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CheckinResult,
  CheckinView,
  GoalsService,
} from '../services/goals.service';
import {
  CheckinParamsDto,
  GoalParamsDto,
  ImportCheckinsDto,
  SetCheckinDto,
} from '../dto/checkin.dto';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { AuthUser } from '../../auth/auth-user';

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get('checkins')
  @ApiOperation({ summary: 'Listar o histórico de check-ins do jogador' })
  list(@CurrentUser() user: AuthUser): Promise<CheckinView[]> {
    return this.goalsService.list(user.id);
  }

  @Post('checkins/import')
  @ApiOperation({
    summary: 'Importar o histórico antigo do navegador (não paga recompensas)',
  })
  importLog(@CurrentUser() user: AuthUser, @Body() dto: ImportCheckinsDto) {
    return this.goalsService.importLog(user.id, dto.log);
  }

  @Put(':goalId/checkins/:day')
  @ApiOperation({
    summary:
      'Marcar (ou desmarcar, com 0) uma meta no dia e colher a recompensa',
  })
  setCheckin(
    @CurrentUser() user: AuthUser,
    @Param() params: CheckinParamsDto,
    @Body() dto: SetCheckinDto,
  ): Promise<CheckinResult> {
    return this.goalsService.setCheckin(
      user.id,
      params.goalId,
      params.day,
      dto.amount,
    );
  }

  @Delete(':goalId/checkins')
  @ApiOperation({ summary: 'Apagar todo o histórico de uma meta' })
  removeGoal(@CurrentUser() user: AuthUser, @Param() params: GoalParamsDto) {
    return this.goalsService.removeGoal(user.id, params.goalId);
  }
}
