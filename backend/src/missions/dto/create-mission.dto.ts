import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

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
    example: 100,
    description: 'Recompensa em pontos de experiência (XP)',
    default: 100,
  })
  @IsInt({ message: 'A recompensa de XP deve ser um número inteiro' })
  @IsPositive({ message: 'A recompensa de XP deve ser positiva' })
  xpReward: number;

  @ApiProperty({
    example: 25,
    description: 'Recompensa em moedas do jogo',
    default: 25,
  })
  @IsInt({ message: 'A recompensa de moedas deve ser um número inteiro' })
  @Min(0, { message: 'A quantidade de moedas não pode ser negativa' })
  coinsReward: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Estado inicial de conclusão da missão',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean = false;

  @ApiPropertyOptional({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do usuário ao qual a missão pertence (opcional se for missão global)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'O userId deve ser um UUID válido' })
  userId?: string;
}
