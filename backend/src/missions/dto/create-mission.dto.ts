import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { MISSION_LIMITS } from '../../progress/economy';

export class CreateMissionDto {
  @ApiProperty({
    example: 'Primeira Colheita',
    description: 'Título da missão',
    maxLength: 60,
  })
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @MaxLength(60, { message: 'O título deve ter no máximo 60 caracteres' })
  @IsNotEmpty({ message: 'O título da missão é obrigatório' })
  title: string;

  @ApiPropertyOptional({
    example: 'Complete seu primeiro hábito diário para aprender a cultivar.',
    description: 'Descrição e objetivos da missão (opcional)',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'A descrição deve ter no máximo 160 caracteres' })
  description?: string;

  @ApiProperty({
    example: 50,
    description: `Recompensa em pontos de experiência (XP), de 1 a ${MISSION_LIMITS.xp}`,
    maximum: MISSION_LIMITS.xp,
  })
  @IsInt({ message: 'A recompensa de XP deve ser um número inteiro' })
  @IsPositive({ message: 'A recompensa de XP deve ser positiva' })
  @Max(MISSION_LIMITS.xp, { message: `A recompensa de XP pode ser no máximo ${MISSION_LIMITS.xp}` })
  xpReward: number;

  @ApiProperty({
    example: 30,
    description: `Recompensa em moedas do jogo, de 0 a ${MISSION_LIMITS.coins}`,
    maximum: MISSION_LIMITS.coins,
  })
  @IsInt({ message: 'A recompensa de moedas deve ser um número inteiro' })
  @Min(0, { message: 'A quantidade de moedas não pode ser negativa' })
  @Max(MISSION_LIMITS.coins, { message: `A recompensa de moedas pode ser no máximo ${MISSION_LIMITS.coins}` })
  coinsReward: number;
}
