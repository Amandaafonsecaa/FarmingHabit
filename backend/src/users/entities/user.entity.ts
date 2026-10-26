import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Identificador único do usuário (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Aventureiro da Silva',
    description: 'Nome completo ou nickname do jogador',
  })
  name: string;

  @ApiProperty({
    example: 'hero@farmhabit.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    example: 1,
    description: 'Nível atual do jogador',
    default: 1,
  })
  level: number;

  @ApiProperty({
    example: 0,
    description: 'Pontos de Experiência (XP) acumulados',
    default: 0,
  })
  xp: number;

  @ApiProperty({
    example: 0,
    description: 'Saldo de moedas do jogador',
    default: 0,
  })
  coins: number;

  @ApiProperty({
    example: '2026-10-21T20:00:00.000Z',
    description: 'Data de criação da conta',
  })
  createdAt: Date;
}
