import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { DAY_PATTERN } from '../economy';

const DAY_MESSAGE = 'A data deve estar no formato AAAA-MM-DD';

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
