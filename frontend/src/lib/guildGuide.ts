import { CHAPTERS, STOPS_PER_CHAPTER, journeyState } from './journey';
import { CHEST_STOPS, COLLECTIBLES } from './treasure';

/** O que o Capitão Bússola (guia da guilda, no mapa das Missões) sabe na hora da conversa */
export interface GuideContext { name: string; completed: number; openMissions: number; traveling: number; unopened: number; found: number }
export type GuideChoice = 'where' | 'missions' | 'map' | 'chests' | 'bye';

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export function guideGreeting(context: GuideContext): string[] {
  const first = `Ahoy, ${context.name}! Sou o Capitão Bússola, guardião deste mapa. 🧭`;
  if (context.completed === 0) return [first, 'Toda grande jornada começa com uma missão. Quer saber como tudo funciona? É só perguntar!'];
  if (context.unopened > 0) return [first, `Psiu... tem ${context.unopened === 1 ? 'um baú esperando' : `${context.unopened} baús esperando`} por você no mapa!`];
  return [first, 'O que deseja saber sobre a jornada?'];
}

export function guideRespond(choice: GuideChoice, context: GuideContext): string[] {
  const { loop, chapter, reached } = journeyState(context.completed);
  if (choice === 'where') {
    const left = STOPS_PER_CHAPTER - reached;
    const nextChest = Object.keys(CHEST_STOPS).map(Number).find(stop => stop >= reached);
    return [
      `Você está em ${CHAPTERS[chapter].name}${loop > 1 ? `, na jornada ${loop}` : ''}: ${reached} de ${STOPS_PER_CHAPTER} paradas.`,
      nextChest !== undefined
        ? `Faltam ${nextChest - reached + 1} ${nextChest - reached + 1 === 1 ? 'missão' : 'missões'} até o próximo baú${CHEST_STOPS[nextChest] === 'big' ? ' grande' : ''}, e ${left} até a próxima região.`
        : `Faltam ${left} ${left === 1 ? 'missão' : 'missões'} até a próxima região.`,
      context.openMissions === 0 ? 'Seu quadro está vazio! Pregue uma nova missão para seguir viagem.'
        : context.traveling > 0 ? 'Você já está a caminho. Quando terminar, marque a missão como cumprida!'
        : `Tem ${context.openMissions} ${context.openMissions === 1 ? 'missão' : 'missões'} no quadro. Escolha uma e parta em aventura!`,
    ];
  }
  if (choice === 'missions') return [
    'Missões são tarefas que você quer fazer de verdade, tipo arrumar o quarto ou estudar um capítulo.',
    'Use "Nova missão" para pregar um pergaminho no quadro. Passinho rende 15 moedas, Desafio 30 e Conquista 80, além de XP.',
    'Toque em "Partir em aventura" na que vai fazer agora. Terminou? Marque como cumprida e ganhe o carimbo!',
  ];
  if (choice === 'map') return [
    'Cada missão cumprida faz você andar uma parada no mapa. Cada região tem 5 paradas.',
    'Cada região é um mundo com o seu próprio mapa. Ao passar da última parada, o mapa do próximo mundo começa a ser desenhado.',
    `São ${CHAPTERS.length} mundos ao todo. O que espera no fim? Só indo até lá para descobrir...`,
  ];
  if (choice === 'chests') return [
    'Na 3ª e na 5ª parada de cada região tem um baú. O da 5ª é um baú grande, com mais prêmios!',
    'Para abrir, bata três vezes nele. Lá dentro tem moedas, XP e achados raros de cada região.',
    `Os achados vão para a sua coleção: são ${COLLECTIBLES.length} ao todo, e você já tem ${context.found}. Os lendários são raríssimos!`,
  ];
  return [pick(['Bons ventos! ⛵', 'Até a próxima parada!', 'Que a bússola te guie!'])];
}

export const GUIDE_CHOICES: { id: GuideChoice; label: string }[] = [
  { id: 'where', label: 'Onde estou na jornada?' },
  { id: 'missions', label: 'Como funcionam as missões?' },
  { id: 'map', label: 'E o mapa?' },
  { id: 'chests', label: 'Me fala dos baús!' },
  { id: 'bye', label: 'Até mais, Capitão!' },
];
