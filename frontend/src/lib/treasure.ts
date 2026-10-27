import { JOURNEY_LENGTH, STOPS_PER_CHAPTER } from './journey';
import { toKey } from './goalLogic';

/**
 * Baús da jornada: aparecem na 3ª parada (baú médio) e na 5ª parada (baú grande, fim do capítulo) de cada capítulo.
 * O conteúdo (moedas, às vezes XP e colecionáveis do capítulo) é sorteado e pago pelo servidor (módulo progress).
 */
export const CHEST_STOPS: Record<number, 'mid' | 'big'> = { 2: 'mid', 4: 'big' };

export type Rarity = 'comum' | 'raro' | 'lendário';
export interface Collectible { id: string; name: string; chapter: number; rarity: Rarity; art: [string, string][] }

export const COLLECTIBLES: Collectible[] = [
  // Vale do Sítio
  { id: 'shell', name: 'Concha do riacho', chapter: 0, rarity: 'comum', art: [['M3 6h10v2h1v4H2V8h1Z', '#f6d3b3'], ['M5 6h1v6H5Zm3 0h1v6H8Zm3 0h1v6h-1Z', '#e8a882'], ['M6 4h4v2H6Z', '#f6d3b3']] },
  { id: 'corn', name: 'Espiga de milho', chapter: 0, rarity: 'comum', art: [['M6 2h4v11H6Z', '#f2c453'], ['M7 3h1v1H7Zm1 2h1v1H8ZM7 7h1v1H7Zm1 2h1v1H8Z', '#e7a92f'], ['M3 8h3v6H5v1H3Zm7 0h3v7h-2v-1h-1Z', '#72ad32']] },
  { id: 'clover', name: 'Trevo de quatro folhas', chapter: 0, rarity: 'raro', art: [['M3 3h4v4H3Zm6 0h4v4H9ZM3 8h4v4H3Zm6 0h4v4H9Z', '#53922d'], ['M4 4h2v2H4Zm6 0h2v2h-2Z', '#8cc65e'], ['M7 11h2v4H7Z', '#3f6b35']] },
  { id: 'golden-egg', name: 'Ovo dourado', chapter: 0, rarity: 'lendário', art: [['M6 2h4v2h2v3h1v5h-1v2h-2v1H6v-1H4v-2H3V7h1V4h2Z', '#f2c453'], ['M6 4h2v3H6Z', '#fff6c2'], ['M10 10h2v2h-2Z', '#e7a92f']] },
  // Floresta Sussurrante
  { id: 'acorn', name: 'Bolota anciã', chapter: 1, rarity: 'comum', art: [['M3 4h10v3H3Z', '#7a4a26'], ['M7 2h2v2H7Z', '#5b3826'], ['M4 7h8v4h-1v2H9v1H7v-1H5v-2H4Z', '#c48a4a'], ['M6 8h2v2H6Z', '#e3b07a']] },
  { id: 'owl-feather', name: 'Pena de coruja', chapter: 1, rarity: 'comum', art: [['M9 1h3v3h-1v4h-1v3H9v2H8v2H7v-2h1v-2h1V8h1V4h-1Z', '#b08850'], ['M10 3h1v2h-1Zm-1 4h1v2H9Z', '#e8d2a8'], ['M5 9h3v1H5Zm1 2h2v1H6Z', '#8a6136']] },
  { id: 'glow-mushroom', name: 'Cogumelo brilhante', chapter: 1, rarity: 'raro', art: [['M6 9h4v6H6Z', '#e9f7ff'], ['M2 5h2V3h2V2h4v1h2v2h2v4H2Z', '#5fc6d8'], ['M5 4h2v2H5Zm5 1h2v2h-2Z', '#d8fbff']] },
  { id: 'fairy-tear', name: 'Lágrima de fada', chapter: 1, rarity: 'lendário', art: [['M7 1h2v3h2v3h1v4h-1v2H9v1H7v-1H5v-2H4V7h1V4h2Z', '#c9a4f2'], ['M6 6h2v3H6Z', '#f4ecff'], ['M12 2h1v1h-1ZM2 4h1v1H2Zm11 7h1v1h-1Z', '#fff6c2']] },
  // Montanhas Nevadas
  { id: 'blue-crystal', name: 'Cristal azul', chapter: 2, rarity: 'comum', art: [['M6 2h4v2h2v8h-2v2H6v-2H4V4h2Z', '#5fa8d3'], ['M6 4h2v6H6Z', '#bfe6f3'], ['M10 6h1v4h-1Z', '#3d7fa8']] },
  { id: 'yeti-fur', name: 'Tufinho de Yeti', chapter: 2, rarity: 'comum', art: [['M4 5h8v2h2v5h-2v2H4v-2H2V7h2Z', '#f4f7ff'], ['M5 3h2v2H5Zm4-1h2v3H9Z', '#f4f7ff'], ['M6 8h1v1H6Zm3 1h1v1H9Z', '#bcd0ea']] },
  { id: 'eternal-flake', name: 'Floco de neve eterno', chapter: 2, rarity: 'raro', art: [['M7 1h2v14H7ZM1 7h14v2H1Z', '#bfe6f3'], ['M3 3h2v2H3Zm8 0h2v2h-2ZM3 11h2v2H3Zm8 0h2v2h-2Z', '#9fd8f0'], ['M6 6h4v4H6Z', '#ffffff']] },
  { id: 'moonstone', name: 'Pedra-da-lua', chapter: 2, rarity: 'lendário', art: [['M5 2h6v2h2v8h-2v2H5v-2H3V4h2Z', '#e3dbd0'], ['M5 4h3v3H5Z', '#ffffff'], ['M9 8h2v2H9Zm-3 2h2v1H6Z', '#b9aec2']] },
  // Castelo do Dragão Sonolento
  { id: 'old-coin', name: 'Moeda antiga', chapter: 3, rarity: 'comum', art: [['M5 2h6v2h2v8h-2v2H5v-2H3V4h2Z', '#c9a24a'], ['M5 4h6v8H5Z', '#e0bd63'], ['M7 5h2v6H7Z', '#a8822f']] },
  { id: 'castle-key', name: 'Chave do castelo', chapter: 3, rarity: 'comum', art: [['M2 3h5v5H2Z', '#c6ccd6'], ['M3 4h3v3H3Z', '#57311f'], ['M7 5h7v2h-1v3h-2V8h-1v2H8V7H7Z', '#c6ccd6']] },
  { id: 'dragon-scale', name: 'Escama de dragão', chapter: 3, rarity: 'raro', art: [['M4 2h8v3h2v5h-2v3h-2v2H6v-2H4v-3H2V5h2Z', '#6aa84f'], ['M6 4h4v2H6Zm-2 3h3v2H4Zm6 0h2v2h-2Z', '#9fd27a'], ['M7 9h2v4H7Z', '#3f7a2e']] },
  { id: 'princess-crown', name: 'Coroa da princesa', chapter: 3, rarity: 'lendário', art: [['M1 5h2v3h2V4h2v4h2V4h2v4h2V5h2v8H1Z', '#f2c453'], ['M1 11h14v2H1Z', '#e7a92f'], ['M4 9h2v2H4Zm6 0h2v2h-2Z', '#e8576f'], ['M7 9h2v2H7Z', '#5fa8d3']] },
];

export type Loot = { kind: 'coins'; amount: number } | { kind: 'xp'; amount: number } | { kind: 'collectible'; id: string };
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

// --- O que já foi aberto e a coleção ficam neste navegador ---
export const TREASURE_KEY = 'farminghabit.treasure.v1';
export interface TreasureState { opened: string[]; collection: Record<string, number>; history: { chestId: string; date: string; loot: Loot[] }[] }

export function readTreasure(): TreasureState {
  try {
    const saved = JSON.parse(localStorage.getItem(TREASURE_KEY) ?? '{}');
    return { opened: saved.opened ?? [], collection: saved.collection ?? {}, history: saved.history ?? [] };
  } catch { return { opened: [], collection: {}, history: [] }; }
}

export function saveOpenedChest(state: TreasureState, chestId: string, loot: Loot[]): TreasureState {
  const collection = { ...state.collection };
  loot.forEach(item => { if (item.kind === 'collectible') collection[item.id] = (collection[item.id] ?? 0) + 1; });
  const next = { opened: [...state.opened, chestId], collection, history: [{ chestId, date: toKey(new Date()), loot }, ...state.history] };
  try { localStorage.setItem(TREASURE_KEY, JSON.stringify(next)); } catch { /* sem armazenamento: vale só nesta sessão */ }
  return next;
}
