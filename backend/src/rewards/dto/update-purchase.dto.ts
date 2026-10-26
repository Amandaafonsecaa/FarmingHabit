import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePurchaseDto {
  @ApiProperty({
    example: true,
    description: 'Marca a compra como aproveitada (true) ou desfaz (false)',
  })
  @IsBoolean({ message: 'O campo used deve ser verdadeiro ou falso' })
  used: boolean;
}
