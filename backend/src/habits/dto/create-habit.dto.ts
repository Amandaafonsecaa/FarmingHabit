import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateHabitDto {
  @ApiProperty({
    example: 'Regar os canteiros pela manhã',
    description: 'Título ou nome do hábito a ser cultivado',
  })
  @IsString()
  @IsNotEmpty({ message: 'O título do hábito é obrigatório' })
  title: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Progresso inicial em porcentagem (0 a 100)',
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'O progresso deve ser um número inteiro' })
  @Min(0, { message: 'O progresso mínimo é 0%' })
  @Max(100, { message: 'O progresso máximo é 100%' })
  progress?: number = 0;
}
