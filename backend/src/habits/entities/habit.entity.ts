import { ApiProperty } from '@nestjs/swagger';

export class Habit {
  @ApiProperty({
    example: 'd9b2d63d-a233-4123-8566-f00e395b263b',
    description: 'Identificador único do hábito (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Regar os canteiros pela manhã',
    description: 'Título do hábito',
  })
  title: string;

  @ApiProperty({
    example: 65,
    description: 'Progresso percentual do hábito (0 a 100%)',
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  progress: number;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do usuário proprietário deste hábito',
  })
  userId: string;

  @ApiProperty({
    example: '2026-10-21T20:00:00.000Z',
    description: 'Data de criação do hábito',
  })
  createdAt: Date;
}
