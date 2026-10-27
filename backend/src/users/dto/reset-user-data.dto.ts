import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn } from 'class-validator';

/** Partes do jogo que podem ser apagadas separadamente (a conta nunca entra aqui) */
export const RESET_SCOPES = ['goals', 'diary', 'missions', 'shop', 'treasure', 'motivation', 'progress'] as const;
export type ResetScope = (typeof RESET_SCOPES)[number];

export class ResetUserDataDto {
  @ApiProperty({
    description: 'O que apagar, separado por vírgula',
    example: 'missions,progress',
    enum: RESET_SCOPES,
    isArray: true,
  })
  // Na query chega como "a,b,c"; vira lista antes de validar
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.split(',').filter(Boolean) : value))
  @IsArray()
  @ArrayMinSize(1, { message: 'Escolha pelo menos uma parte para apagar' })
  @IsIn(RESET_SCOPES, { each: true, message: 'Parte desconhecida: $value' })
  scopes: ResetScope[];
}
