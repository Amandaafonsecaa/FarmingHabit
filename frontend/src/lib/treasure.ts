import { JOURNEY_LENGTH, STOPS_PER_CHAPTER } from './journey';
import type { CardPull } from './cards';

/**
 * Baús da jornada: aparecem na 3ª parada (baú médio) e na 5ª parada (baú grande, fim do capítulo) de cada capítulo.
 * O conteúdo (moedas, às vezes XP e um pacote de cartas do mundo) é sorteado e pago pelo servidor (módulo progress).
 * O álbum de cartas e os baús já abertos ficam em lib/cards.ts.
 */
export const CHEST_STOPS: Record<number, 'mid' | 'big'> = { 2: 'mid', 4: 'big' };

export type Loot = { kind: 'coins'; amount: number } | { kind: 'xp'; amount: number }
  | { kind: 'booster'; set: number; cards: CardPull[] }
  /** Achado da coleção antiga: só aparece em baús abertos antes das cartas */
  | { kind: 'collectible'; id: string };
export interface FoundChest { id: string; loop: number; chapter: number; stop: number; size: 'mid' | 'big' }

/** Todos os baús já encontrados, a partir do total de missões cumpridas (inclui voltas anteriores) */
export function foundChests(completed: number): FoundChest[] {
  const chests: FoundChest[] = [];
  for (let n = 1; n <= completed; n++) {
    const within = (n - 1) % JOURNEY_LENGTH;
    const stop = within % STOPS_PER_CHAPTER;
    const size = CHEST_STOPS[stop];
    if (!size) continue;
    const loop = Math.floor((n - 1) / JOURNEY_LENGTH) + 1;
    const chapter = Math.floor(within / STOPS_PER_CHAPTER);
    chests.push({ id: `${loop}:${chapter}:${stop}`, loop, chapter, stop, size });
  }
  return chests;
}
