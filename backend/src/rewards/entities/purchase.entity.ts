import { ApiProperty } from '@nestjs/swagger';

export class Purchase {
  @ApiProperty({
    example: 'c3f1b2a4-5d6e-4f70-8a9b-0c1d2e3f4a5b',
    description: 'Identificador único da compra (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Café especial na padaria',
    description: 'Título do item no momento da compra',
  })
  title: string;

  @ApiProperty({ example: 150, description: 'Preço pago em moedas' })
  price: number;

  @ApiProperty({
    example: false,
    description: 'Se a recompensa já foi aproveitada',
  })
  used: boolean;

  @ApiProperty({
    example: null,
    description: 'Quando foi marcada como aproveitada',
    required: false,
    nullable: true,
  })
  usedAt?: Date | null;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do jogador que comprou',
  })
  userId: string;

  @ApiProperty({
    example: '8b63e8c2-3e2b-4fa9-83bc-42bfe041f909',
    description: 'ID da recompensa comprada (nulo se ela foi apagada)',
    required: false,
    nullable: true,
  })
  rewardId?: string | null;

  @ApiProperty({
    example: '2026-10-25T20:00:00.000Z',
    description: 'Data da compra',
  })
  createdAt: Date;
}
