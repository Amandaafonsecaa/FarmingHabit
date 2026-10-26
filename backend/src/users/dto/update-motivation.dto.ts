import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// Foto já vem reduzida do navegador; ~600 KB de data URL é folga de sobra
const MAX_PHOTO_LENGTH = 600_000;

export class UpdateMotivationDto {
  @ApiProperty({ example: 'Quero ter energia para brincar com meus filhos', description: 'Frase de motivação principal (até 160 caracteres)' })
  @IsString()
  @MaxLength(160, { message: 'A motivação deve ter até 160 caracteres' })
  text: string;

  @ApiPropertyOptional({ description: 'Foto como data URL de imagem (JPEG/PNG/WebP). Null remove a foto.', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PHOTO_LENGTH, { message: 'A foto é grande demais' })
  @Matches(/^data:image\/(jpeg|png|webp);base64,/, { message: 'A foto deve ser uma imagem JPEG, PNG ou WebP' })
  photo?: string | null;
}
