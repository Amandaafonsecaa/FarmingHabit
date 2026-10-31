import { rollBooster, type CardPull } from './card-rules';

/**
 * Baús da jornada (mesmo mapa do front): 4 capítulos de 5 paradas; baú médio na 3ª parada e grande na 5ª.
 * Cada missão cumprida anda uma parada. O sorteio do conteúdo (moedas, XP e o pacote de cartas) acontece só aqui.
 */
export const STOPS_PER_CHAPTER = 5;
export const CHAPTER_COUNT = 4;
export const JOURNEY_LENGTH = CHAPTER_COUNT * STOPS_PER_CHAPTER;
const CHEST_STOPS: Record<number, 'mid' | 'big'> = { 2: 'mid', 4: 'big' };

export type Loot =
  | { kind: 'coins'; amount: number }
  | { kind: 'xp'; amount: number }
  | { kind: 'booster'; set: number; cards: CardPull[] }
  /** Achados da coleção antiga: só aparecem em baús abertos antes das cartas */
  | { kind: 'collectible'; id: string };
export interface Chest {
  id: string;
  chapter: number;
  size: 'mid' | 'big';
  /** Quantas missões cumpridas são precisas para chegar nele */ requires: number;
}

/** Lê o id "volta:capítulo:parada" e diz se ali existe um baú */
export function chestFromId(id: string): Chest | null {
  const match = /^(\d{1,4}):(\d):(\d)$/.exec(id);
  if (!match) return null;
  const [loop, chapter, stop] = match.slice(1).map(Number);
  const size = CHEST_STOPS[stop];
  if (
    loop < 1 ||
    chapter >= CHAPTER_COUNT ||
    stop >= STOPS_PER_CHAPTER ||
    !size
  )
    return null;
  return {
    id,
    chapter,
    size,
    requires:
      (loop - 1) * JOURNEY_LENGTH + chapter * STOPS_PER_CHAPTER + stop + 1,
  };
}

/**
 * Sorteia o conteúdo: sempre moedas, às vezes uma poção de XP (uma chance no médio, duas no grande)
 * e um pacote de cartas da expansão do mundo
 */
export function rollLoot(
  chest: Chest,
  random: () => number = Math.random,
): Loot[] {
  const between = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));
  const big = chest.size === 'big';
  const loot: Loot[] = [
    { kind: 'coins', amount: big ? between(30, 70) : between(10, 30) },
  ];
  for (let roll = 0; roll < (big ? 2 : 1); roll++)
    if (random() < 0.3) loot.push({ kind: 'xp', amount: big ? 30 : 15 });
  loot.push({
    kind: 'booster',
    set: chest.chapter,
    cards: rollBooster(chest.chapter, chest.size, random),
  });
  return loot;
}

export const lootTotals = (loot: Loot[]) => ({
  coins: loot.reduce(
    (sum, item) => sum + (item.kind === 'coins' ? item.amount : 0),
    0,
  ),
  xp: loot.reduce(
    (sum, item) => sum + (item.kind === 'xp' ? item.amount : 0),
    0,
  ),
});
