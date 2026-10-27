/**
 * Baús da jornada (mesmo mapa do front): 4 capítulos de 5 paradas; baú médio na 3ª parada e grande na 5ª.
 * Cada missão cumprida anda uma parada. O sorteio do conteúdo acontece só aqui.
 */
export const STOPS_PER_CHAPTER = 5;
export const CHAPTER_COUNT = 4;
export const JOURNEY_LENGTH = CHAPTER_COUNT * STOPS_PER_CHAPTER;
const CHEST_STOPS: Record<number, 'mid' | 'big'> = { 2: 'mid', 4: 'big' };

type Rarity = 'comum' | 'raro' | 'lendário';
/** Colecionáveis de cada capítulo (o desenho fica no front) */
const COLLECTIBLES: { id: string; chapter: number; rarity: Rarity }[] = [
  { id: 'shell', chapter: 0, rarity: 'comum' },
  { id: 'corn', chapter: 0, rarity: 'comum' },
  { id: 'clover', chapter: 0, rarity: 'raro' },
  { id: 'golden-egg', chapter: 0, rarity: 'lendário' },
  { id: 'acorn', chapter: 1, rarity: 'comum' },
  { id: 'owl-feather', chapter: 1, rarity: 'comum' },
  { id: 'glow-mushroom', chapter: 1, rarity: 'raro' },
  { id: 'fairy-tear', chapter: 1, rarity: 'lendário' },
  { id: 'blue-crystal', chapter: 2, rarity: 'comum' },
  { id: 'yeti-fur', chapter: 2, rarity: 'comum' },
  { id: 'eternal-flake', chapter: 2, rarity: 'raro' },
  { id: 'moonstone', chapter: 2, rarity: 'lendário' },
  { id: 'old-coin', chapter: 3, rarity: 'comum' },
  { id: 'castle-key', chapter: 3, rarity: 'comum' },
  { id: 'dragon-scale', chapter: 3, rarity: 'raro' },
  { id: 'princess-crown', chapter: 3, rarity: 'lendário' },
];

export type Loot =
  | { kind: 'coins'; amount: number }
  | { kind: 'xp'; amount: number }
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

/** Sorteia o conteúdo: sempre moedas, mais 1 (médio) ou 2 (grande) prêmios extras */
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
  const weights: [Rarity, number][] = big
    ? [
        ['comum', 55],
        ['raro', 33],
        ['lendário', 12],
      ]
    : [
        ['comum', 70],
        ['raro', 25],
        ['lendário', 5],
      ];
  for (let roll = 0; roll < (big ? 2 : 1); roll++) {
    if (random() < 0.3) {
      loot.push({ kind: 'xp', amount: big ? 30 : 15 });
      continue;
    }
    let ticket = random() * 100;
    const rarity =
      weights.find(([, weight]) => (ticket -= weight) < 0)?.[0] ?? 'comum';
    const pool = COLLECTIBLES.filter(
      (item) => item.chapter === chest.chapter && item.rarity === rarity,
    );
    loot.push({
      kind: 'collectible',
      id: pool[Math.floor(random() * pool.length)].id,
    });
  }
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
