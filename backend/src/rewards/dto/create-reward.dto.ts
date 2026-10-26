import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({
    example: 'Skin: Regador Dourado',
    description: 'Título ou nome da recompensa / item cosmético',
  })
  @IsString()
  @IsNotEmpty({ message: 'O título da recompensa é obrigatório' })
  title: string;

  @ApiPropertyOptional({
    example: 'Um cappuccino caprichado, tomado sem pressa nenhuma.',
    description: 'Descrição curta exibida no card da vitrine',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 100,
    description: 'Custo em moedas para desbloquear',
    minimum: 0,
    default: 50,
  })
  @IsInt({ message: 'O preço deve ser um valor inteiro' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  price: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Disponibilidade do item na loja de recompensas',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean = true;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description:
      'ID do jogador proprietário; itens globais são gerenciados pelo catálogo',
  })
  @IsUUID('4', { message: 'O userId deve ser um UUID válido' })
  userId: string;
}
