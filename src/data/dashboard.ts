import type { Habit, Mission, User } from '../types/dashboard';
export const user: User = { name: 'Amanda', level: 7, xp: 340, xpPerLevel: 500, coins: 125, mood: 'Bem, no meu ritmo', energy: 4 };
export const habits: Habit[] = [
  { id: 'water', title: 'Começar o dia com água', description: 'Um copo de água, um carinho no corpo.', category: 'Saúde', icon: 'water', xp: 15, coins: 3, completed: true },
  { id: 'read', title: 'Ler por 15 minutos', description: 'Cultive uma ideia nova hoje.', category: 'Aprendizado', icon: 'book', xp: 25, coins: 5, completed: false },
  { id: 'move', title: 'Movimentar o corpo', description: 'Uma caminhada ou um alongamento leve.', category: 'Movimento', icon: 'leaf', xp: 30, coins: 5, completed: false },
  { id: 'pause', title: 'Fazer uma pausa de verdade', description: 'Cinco minutos para respirar e estar presente.', category: 'Bem-estar', icon: 'sun', xp: 20, coins: 3, completed: false },
  { id: 'sleep', title: 'Desacelerar antes de dormir', description: 'Menos telas, mais tranquilidade.', category: 'Descanso', icon: 'moon', xp: 20, coins: 4, completed: false },
];
export const mission: Mission = { title: 'Dê espaço para florescer', description: 'Complete 3 hábitos hoje. Pequenos cuidados também são grandes conquistas.', target: 3 };
