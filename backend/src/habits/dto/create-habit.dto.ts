import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do usuário proprietário deste hábito',
  })
  @IsUUID('4', { message: 'O userId deve ser um UUID válido' })
  userId: string;
}
