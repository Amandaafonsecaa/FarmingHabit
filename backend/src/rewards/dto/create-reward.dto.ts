import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({
    example: 'Skin: Regador Dourado',
    description: 'Título ou nome da recompensa / item cosmético',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MaxLength(60)
  @IsString()
  @IsNotEmpty({ message: 'O título da recompensa é obrigatório' })
  title: string;

  @ApiPropertyOptional({
    example: 'Um cappuccino caprichado, tomado sem pressa nenhuma.',
    description: 'Descrição curta exibida no card da vitrine',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  description?: string;

  @ApiProperty({
    example: 100,
    description: 'Custo em moedas para desbloquear',
    minimum: 0,
    default: 50,
  })
  @IsInt({ message: 'O preço deve ser um valor inteiro' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  @Max(10000)
  price: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Disponibilidade do item na loja de recompensas',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean = true;
}
