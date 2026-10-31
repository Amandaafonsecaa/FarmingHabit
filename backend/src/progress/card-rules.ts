/**
 * Cartas colecionáveis dos baús: cada mundo da jornada é uma expansão com 6 cartas
 * (3 comuns, 2 raras e 1 lendária). O desenho e os nomes ficam no front; aqui só o que o sorteio precisa.
 */
export type CardRarity = 'comum' | 'raro' | 'lendário';
export interface CardPull {
  id: string;
  /** Variante brilhante: sai de vez em quando em qualquer raridade */ shiny: boolean;
}

export const CARDS: { id: string; set: number; rarity: CardRarity }[] = [
  // Vale do Sítio
  { id: 'hasty-hen', set: 0, rarity: 'comum' },
  { id: 'watering-time', set: 0, rarity: 'comum' },
  { id: 'curious-cow', set: 0, rarity: 'comum' },
  { id: 'sheep-nap', set: 0, rarity: 'raro' },
  { id: 'barn-workout', set: 0, rarity: 'raro' },
  { id: 'golden-harvest', set: 0, rarity: 'lendário' },
  // Floresta Sussurrante
  { id: 'owl-watch', set: 1, rarity: 'comum' },
  { id: 'thief-squirrel', set: 1, rarity: 'comum' },
  { id: 'gossip-mushrooms', set: 1, rarity: 'comum' },
  { id: 'glade-picnic', set: 1, rarity: 'raro' },
  { id: 'firefly-ball', set: 1, rarity: 'raro' },
  { id: 'forest-fairy', set: 1, rarity: 'lendário' },
  // Montanhas Nevadas
  { id: 'snowman', set: 2, rarity: 'comum' },
  { id: 'snowball-fight', set: 2, rarity: 'comum' },
  { id: 'skating-penguin', set: 2, rarity: 'comum' },
  { id: 'shy-yeti', set: 2, rarity: 'raro' },
  { id: 'hot-cocoa', set: 2, rarity: 'raro' },
  { id: 'peak-aurora', set: 2, rarity: 'lendário' },
  // Castelo do Dragão Sonolento
  { id: 'yawning-guard', set: 3, rarity: 'comum' },
  { id: 'pantry-mouse', set: 3, rarity: 'comum' },
  { id: 'runaway-barrel', set: 3, rarity: 'comum' },
  { id: 'courtyard-duel', set: 3, rarity: 'raro' },
  { id: 'royal-feast', set: 3, rarity: 'raro' },
  { id: 'sleepy-dragon', set: 3, rarity: 'lendário' },
];

/** Cartas por pacote: o baú grande traz um pacote maior, com a última carta rara ou melhor */
export const BOOSTER_SIZE = { mid: 3, big: 5 } as const;
const SLOT_WEIGHTS: [CardRarity, number][] = [
  ['comum', 72],
  ['raro', 23],
  ['lendário', 5],
];
const GUARANTEED_WEIGHTS: [CardRarity, number][] = [
  ['raro', 80],
  ['lendário', 20],
];
export const SHINY_CHANCE = 1 / 12;

/** Monta um pacote da expansão do mundo; evita repetir carta no mesmo pacote enquanto houver outra da raridade */
export function rollBooster(
  set: number,
  size: 'mid' | 'big',
  random: () => number = Math.random,
): CardPull[] {
  const pulls: CardPull[] = [];
  const count = BOOSTER_SIZE[size];
  for (let slot = 0; slot < count; slot++) {
    const weights =
      size === 'big' && slot === count - 1 ? GUARANTEED_WEIGHTS : SLOT_WEIGHTS;
    const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
    let ticket = random() * total;
    const rarity =
      weights.find(([, weight]) => (ticket -= weight) < 0)?.[0] ??
      weights[0][0];
    const pool = CARDS.filter(
      (card) => card.set === set && card.rarity === rarity,
    );
    const fresh = pool.filter((card) => !pulls.some((p) => p.id === card.id));
    const from = fresh.length ? fresh : pool;
    pulls.push({
      id: from[Math.floor(random() * from.length)].id,
      shiny: random() < SHINY_CHANCE,
    });
  }
  return pulls;
}
