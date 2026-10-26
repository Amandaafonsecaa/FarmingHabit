import { ApiProperty } from '@nestjs/swagger';

export class Reward {
  @ApiProperty({
    example: '8b63e8c2-3e2b-4fa9-83bc-42bfe041f909',
    description: 'Identificador único da recompensa / item (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Skin: Regador Dourado',
    description: 'Título ou nome do item / recompensa',
  })
  title: string;

  @ApiProperty({
    example: 'Um cappuccino caprichado, tomado sem pressa nenhuma.',
    description: 'Descrição curta do item',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: 'fixo-cafe',
    description:
      'Chave estável dos itens fixos da vitrine (nula nos itens criados pelo usuário)',
    required: false,
    nullable: true,
  })
  key?: string | null;

  @ApiProperty({
    example: 100,
    description: 'Preço / custo em moedas do jogador',
    minimum: 0,
  })
  price: number;

  @ApiProperty({
    example: true,
    description: 'Indica se a recompensa está disponível para compra/resgate',
    default: true,
  })
  available: boolean;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do usuário associado à recompensa',
    required: false,
    nullable: true,
  })
  userId?: string | null;

  @ApiProperty({
    example: '2026-10-21T20:00:00.000Z',
    description: 'Data de cadastro da recompensa',
  })
  createdAt: Date;
}
