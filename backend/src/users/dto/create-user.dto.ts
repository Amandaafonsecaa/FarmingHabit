import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Aventureiro da Silva',
    description: 'Nome completo ou nickname do jogador',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'hero@farmhabit.com',
    description: 'Endereço de e-mail único do usuário',
  })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @ApiPropertyOptional({
    example: 'SenhaForte#2026',
    description: 'Senha de acesso do usuário (opcional, gerenciada pelo Supabase Auth)',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Nível inicial do usuário',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number = 1;

  @ApiPropertyOptional({
    example: 0,
    description: 'Pontos de Experiência iniciais',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  xp?: number = 0;

  @ApiPropertyOptional({
    example: 0,
    description: 'Moedas iniciais',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  coins?: number = 0;
}
