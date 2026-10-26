import type { Mood } from './diary';

/** Pipoca, a gatinha do diário: só conversa depois de acordada 3 vezes em 1 minuto (fica liberado neste navegador) */
export const CAT_KEY = 'farminghabit.diary-cat.v1';
export const WAKES_TO_UNLOCK = 3;
export const WAKE_WINDOW_MS = 60_000;

export function readCatUnlocked() { try { return localStorage.getItem(CAT_KEY) === '1'; } catch { return false; } }
export function saveCatUnlocked() { try { localStorage.setItem(CAT_KEY, '1'); } catch { /* sem armazenamento: só não lembra */ } }

export interface CatContext { written: number; streak: number; todayMood?: Mood }
export type CatChoice = 'diary' | 'mood' | 'pet' | 'nap';

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const MOOD_LINES: Record<Mood, string> = {
  sunny: 'Dia de sol! Perfeito pra tirar um cochilo na janela... digo, pra escrever. 🌞',
  cloudy: 'Nublado, né? Tudo bem. Até as nuvens passam.',
  rainy: 'Chuvinha lá fora. Quer ficar aqui comigo um pouco? Eu esquento seu pé.',
  stormy: 'Dia de tempestade... Eu me escondo embaixo da cama... Mas tempestade passa. Respira fundo, tô aqui.',
  rainbow: 'Arco-íris! Hoje você brilhou, dá pra ver daqui. ✨',
};

export function catGreeting(context: CatContext): string[] {
  const first = 'Mrrr... tá bom, tá bom, acordei. Eu sou a Pipoca. 🐾';
  if (context.written === 0) return [first, 'Esse caderno ainda tá em branco. Escreve alguma coisa, eu adoro dormir em cima de papel.'];
  return [first, `Você já escreveu em ${context.written} ${context.written === 1 ? 'dia' : 'dias'}. Eu li tudo. Gatos leem, sabia?`];
}

export function catRespond(choice: CatChoice, context: CatContext): string[] {
  if (choice === 'diary') return [
    'Toda página é um dia. Escolhe como foi o tempo dentro de você: sol, nuvem, chuva, tempestade ou arco-íris.',
    'O humor muda o clima da janela aqui do quarto. E vai pintando o calendário de "Estações do humor".',
    'Escreve uma gratidão e uma notinha. As metas colhidas e as missões cumpridas aparecem sozinhas na página.',
  ];
  if (choice === 'mood') {
    if (!context.todayMood) return ['Você ainda não escolheu o humor de hoje. Como tá o tempo aí dentro?'];
    return [MOOD_LINES[context.todayMood], ...(context.streak > 1 ? [`E já são ${context.streak} dias seguidos escrevendo. Ronrono de orgulho.`] : [])];
  }
  if (choice === 'pet') return [pick(['Prrrrrr... prrrrr... 💛', 'Atrás da orelha! Isso! Bem aí!', 'Tá, pode parar... não, continua.', '*amassa pãozinho no tapete*'])];
  return [pick(['Zzz... me acorda só se tiver sachê. 💤', 'Vou voltar pro meu tapete. Boa escrita!', 'Mrrr... boa noite... ou bom dia... sei lá. 💤'])];
}

export const CAT_CHOICES: { id: CatChoice; label: string }[] = [
  { id: 'diary', label: 'Como funciona o diário?' },
  { id: 'mood', label: 'Como estou hoje?' },
  { id: 'pet', label: 'Fazer carinho' },
  { id: 'nap', label: 'Pode voltar a dormir' },
];
