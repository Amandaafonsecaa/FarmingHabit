import type { Goal, Mission, Reward, WorldState } from '../types/world';
export const farmName = 'Sítio Girassol';
export const player = { name: 'Amanda', level: 7, xp: 340, xpPerLevel: 500, coins: 120 };
export const goals: Goal[] = [
  { id: 'routine', title: 'Organizar minha rotina', description: 'Mais leveza, um dia de cada vez.', progress: 65, completed: false, detail: 'Reservar um momento para planejar a semana e criar espaço para o que importa.' },
  { id: 'reading', title: 'Criar o hábito da leitura', description: 'Um capítulo, muitas descobertas.', progress: 40, completed: false, detail: 'Ler por 15 minutos em um momento tranquilo do dia, respeitando o meu ritmo.' },
];
export const missions: Mission[] = [
  { id: 'project', title: 'Concluir meu primeiro projeto', description: 'Tire uma ideia do papel e compartilhe o resultado.', xp: 100, coins: 50, completed: false, rewarded: false },
  { id: 'hike', title: 'Fazer uma trilha nova', description: 'Conheça um caminho e reserve um tempo para a natureza.', xp: 60, coins: 30, completed: false, rewarded: false },
];
export const rewards: Reward[] = [
  { id: 'coffee', name: 'Café especial', price: 80, icon: 'coffee' },
  { id: 'book', name: 'Um livro novo', price: 150, icon: 'book' },
];
export const initialWorldState: WorldState = { goals, rewards, coins: player.coins, missions, purchasedRewardIds: [] };
