import type { PixelIconName } from '../components/PixelIcon';

// --- Melhorias do sítio por nível (como as reformas da casa no Stardew) ---
export const FARM_STAGES = [
  { level: 1, name: 'Barraca de acampamento', hint: 'Todo sítio começa com uma fogueira e um sonho.' },
  { level: 3, name: 'Cabana de madeira', hint: 'Paredes de tronco e uma janelinha acesa.' },
  { level: 5, name: 'Casinha do sítio', hint: 'Telhado vermelho e fumaça na chaminé.' },
  { level: 8, name: 'Sítio com celeiro', hint: 'Chegaram as galinhas!' },
  { level: 12, name: 'Fazenda dos sonhos', hint: 'Moinho, estufa e até uma vaquinha.' },
];
export const stageForLevel = (level: number) => FARM_STAGES.reduce((stage, item, index) => level >= item.level ? index : stage, 0);

// --- Habilidades: 10 níveis cada, com marcos (como as profissões) nos níveis 5 e 10 ---
export interface Skill { id: string; name: string; icon: PixelIconName; unit: string; thresholds: number[]; perks: [string, string]; value: number }
export function buildSkills(stats: EvolutionStats): Skill[] {
  return [
    { id: 'farming', name: 'Cultivo', icon: 'leaf', unit: 'colheitas', thresholds: [1, 5, 10, 20, 35, 50, 75, 100, 150, 200], perks: ['Mão verde', 'Mestre do canteiro'], value: stats.harvests },
    { id: 'exploring', name: 'Exploração', icon: 'mission', unit: 'missões', thresholds: [1, 2, 3, 5, 8, 12, 16, 20, 30, 40], perks: ['Pé na estrada', 'Lenda viva'], value: stats.missions },
    { id: 'writing', name: 'Reflexão', icon: 'book', unit: 'páginas', thresholds: [1, 3, 5, 7, 10, 15, 20, 30, 45, 60], perks: ['Pena afiada', 'Alma de poeta'], value: stats.pages },
    { id: 'steady', name: 'Constância', icon: 'flame', unit: 'dias seguidos', thresholds: [2, 3, 5, 7, 10, 14, 21, 30, 45, 60], perks: ['Raízes firmes', 'Carvalho centenário'], value: stats.bestStreak },
  ];
}
export const skillLevel = (skill: Skill) => skill.thresholds.filter(threshold => skill.value >= threshold).length;

// --- Conquistas ---
export interface EvolutionStats { level: number; coins: number; goals: number; harvests: number; bestStreak: number; missions: number; pages: number; quantity: number }
export interface Achievement { id: string; title: string; text: string; icon: PixelIconName; current: number; goal: number }
export function buildAchievements(stats: EvolutionStats): Achievement[] {
  return [
    { id: 'seed', title: 'Primeira semente', text: 'Plante uma meta.', icon: 'leaf', current: stats.goals, goal: 1 },
    { id: 'harvest', title: 'Primeira colheita', text: 'Cumpra uma meta no dia.', icon: 'check', current: stats.harvests, goal: 1 },
    { id: 'week', title: 'Semana verdinha', text: '7 dias seguidos numa meta.', icon: 'flame', current: stats.bestStreak, goal: 7 },
    { id: 'month', title: 'Raiz de um mês', text: '30 dias seguidos numa meta.', icon: 'growth', current: stats.bestStreak, goal: 30 },
    { id: 'bounty', title: 'Colheita farta', text: 'Some 100 colheitas.', icon: 'sun', current: stats.harvests, goal: 100 },
    { id: 'drop', title: 'Gota a gota', text: 'Some 100 unidades em metas de quantidade.', icon: 'water', current: stats.quantity, goal: 100 },
    { id: 'adventure', title: 'Primeira aventura', text: 'Cumpra uma missão.', icon: 'mission', current: stats.missions, goal: 1 },
    { id: 'valley', title: 'Desbravou o vale', text: 'Termine o capítulo 1 da jornada.', icon: 'target', current: stats.missions, goal: 5 },
    { id: 'princess', title: 'Salvou a princesa', text: 'Complete uma jornada inteira.', icon: 'home', current: stats.missions, goal: 20 },
    { id: 'diary', title: 'Querido diário', text: 'Escreva a primeira página.', icon: 'book', current: stats.pages, goal: 1 },
    { id: 'seasons', title: 'Escritora de estações', text: 'Escreva 30 páginas.', icon: 'book', current: stats.pages, goal: 30 },
    { id: 'level5', title: 'Casinha própria', text: 'Chegue ao nível 5.', icon: 'home', current: stats.level, goal: 5 },
    { id: 'coins', title: 'Pé-de-meia', text: 'Junte 500 moedas.', icon: 'coin', current: stats.coins, goal: 500 },
  ];
}
