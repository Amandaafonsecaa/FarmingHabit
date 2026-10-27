import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SaveUserDataDto {
  @ApiProperty({ description: 'Conteúdo da chave como texto (o mesmo JSON que o navegador guarda)', example: '{"goals":[],"log":{}}' })
  @IsString()
  @MaxLength(900_000, { message: 'Dados grandes demais para esta chave' })
  value: string;
}
