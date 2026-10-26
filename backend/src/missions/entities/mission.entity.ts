import { ApiProperty } from '@nestjs/swagger';

export class Mission {
  @ApiProperty({
    example: '7c86a11e-2ff7-44bc-b530-9b3ec7095493',
    description: 'Identificador único da missão (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Primeira Colheita',
    description: 'Título da missão ou desafio',
  })
  title: string;

  @ApiProperty({
    example: 'Complete seu primeiro hábito diário para aprender a cultivar.',
    description: 'Descrição detalhada com os objetivos da missão',
  })
  description: string;

  @ApiProperty({
    example: 100,
    description: 'Quantidade de XP concedida ao cumprir a missão',
  })
  xpReward: number;

  @ApiProperty({
    example: 25,
    description: 'Quantidade de moedas concedidas ao cumprir a missão',
  })
  coinsReward: number;

  @ApiProperty({
    example: false,
    description: 'Indica se a missão foi completada',
    default: false,
  })
  completed: boolean;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do usuário associado à missão',
    required: false,
    nullable: true,
  })
  userId?: string | null;

  @ApiProperty({
    example: '2026-10-21T20:00:00.000Z',
    description: 'Data de criação da missão',
  })
  createdAt: Date;
}
