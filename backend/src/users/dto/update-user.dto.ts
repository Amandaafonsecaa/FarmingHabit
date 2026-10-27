import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * O único dado que o jogador muda direto é o nome. Moedas, XP e nível só mudam por ações
 * que o servidor confere (missões, colheitas, baús, compras); o e-mail vem da conta do Supabase.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Aventureiro da Silva', description: 'Nome do jogador', maxLength: 40 })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode ficar em branco' })
  @MaxLength(40, { message: 'O nome pode ter no máximo 40 caracteres' })
  name?: string;
}
