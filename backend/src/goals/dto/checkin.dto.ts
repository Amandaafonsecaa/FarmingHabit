import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Matches,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { DAY_PATTERN } from '../../progress/economy';

export class GoalParamsDto {
  @ApiProperty({ example: 'leitura' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  goalId: string;
}

export class CheckinParamsDto extends GoalParamsDto {
  @ApiProperty({
    example: '2026-10-31',
    description: 'Dia do jogador (AAAA-MM-DD)',
  })
  @Matches(DAY_PATTERN)
  day: string;
}

export class SetCheckinDto {
  @ApiProperty({ example: 1, description: 'Quantidade do dia; 0 desmarca' })
  @IsInt()
  @Min(0)
  @Max(10000)
  amount: number;
}

export class ImportCheckinsDto {
  @ApiProperty({
    example: { leitura: { '2026-10-30': 1 } },
    description: 'Histórico antigo: meta -> dia -> quantidade',
  })
  @IsObject()
  log: Record<string, Record<string, number>>;
}
