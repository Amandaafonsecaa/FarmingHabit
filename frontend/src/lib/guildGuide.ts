/** O que o Capitão Bússola (guia da guilda, dentro do navio das Missões) sabe na hora da conversa */
export interface GuideContext { name: string; completed: number; openMissions: number; traveling: number }
export type GuideChoice = 'board' | 'missions' | 'bye';

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export function guideGreeting(context: GuideContext): string[] {
  const first = `Ahoy, ${context.name}! Sou o Capitão Bússola, e este navio é o nosso quartel. 🧭`;
  if (context.completed === 0) return [first, 'Toda grande aventura começa com uma missão. Quer saber como tudo funciona? É só perguntar!'];
  return [first, 'O que deseja saber, marujo?'];
}

export function guideRespond(choice: GuideChoice, context: GuideContext): string[] {
  if (choice === 'board') return [
    context.completed > 0
      ? `Você já cumpriu ${context.completed} ${context.completed === 1 ? 'missão' : 'missões'}. Bela tripulação!`
      : 'Ainda não cumpriu nenhuma missão. O mar está esperando!',
    context.openMissions === 0 ? 'Seu quadro está vazio! Pregue uma nova missão para zarpar.'
      : context.traveling > 0 ? 'Você já está a caminho. Quando terminar, marque a missão como cumprida!'
      : `Tem ${context.openMissions} ${context.openMissions === 1 ? 'missão' : 'missões'} no quadro. Escolha uma e parta em aventura!`,
  ];
  if (choice === 'missions') return [
    'Missões são tarefas que você quer fazer de verdade, tipo arrumar o quarto ou estudar um capítulo.',
    'Use "Nova missão" para pregar um pergaminho no quadro. Passinho rende 15 moedas, Desafio 30 e Conquista 80, além de XP.',
    'Toque em "Partir em aventura" na que vai fazer agora. Terminou? Marque como cumprida e ganhe o carimbo!',
  ];
  return [pick(['Bons ventos! ⛵', 'Até a próxima maré!', 'Que a bússola te guie!'])];
}

export const GUIDE_CHOICES: { id: GuideChoice; label: string }[] = [
  { id: 'board', label: 'Como está o meu quadro?' },
  { id: 'missions', label: 'Como funcionam as missões?' },
  { id: 'bye', label: 'Até mais, Capitão!' },
];
