import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { DAY_PATTERN } from '../economy';

const DAY_MESSAGE = 'A data deve estar no formato AAAA-MM-DD';

export class HarvestDto {
  @ApiProperty({
    example: 'exemplo-leitura',
    description: 'Id da meta cumprida (das metas salvas na conta)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  goalId: string;

  @ApiProperty({
    example: '2026-10-27',
    description: 'Dia do jogador em que a meta foi cumprida (precisa ser hoje)',
  })
  @Matches(DAY_PATTERN, { message: DAY_MESSAGE })
  date: string;
}

export class OpenChestDto {
  @ApiProperty({
    example: '2026-10-27',
    description: 'Dia do jogador (precisa ser hoje)',
  })
  @Matches(DAY_PATTERN, { message: DAY_MESSAGE })
  date: string;
}

export class ClaimsQueryDto {
  @ApiProperty({
    example: '2026-10-20',
    description: 'Primeiro dia (inclusive)',
  })
  @Matches(DAY_PATTERN, { message: DAY_MESSAGE })
  from: string;

  @ApiProperty({ example: '2026-10-27', description: 'Último dia (inclusive)' })
  @Matches(DAY_PATTERN, { message: DAY_MESSAGE })
  to: string;
}
