import { toKey } from './goalLogic';
import type { Loot } from './treasure';

/**
 * Cartas colecionáveis: cada mundo da jornada é uma expansão de 6 cartas (3 comuns, 2 raras e 1 lendária).
 * Os baús trazem pacotes sorteados no servidor (módulo progress, card-rules.ts); aqui ficam nomes, textos e o álbum.
 * As raras têm brilho holográfico, as lendárias são "arte cheia" e qualquer carta pode sair brilhante (★).
 */
export type CardRarity = 'comum' | 'raro' | 'lendário';
export interface CardInfo { id: string; set: number; number: number; name: string; rarity: CardRarity; flavor: string }
export interface CardPull { id: string; shiny: boolean }

const card = (id: string, set: number, number: number, name: string, rarity: CardRarity, flavor: string): CardInfo => ({ id, set, number, name, rarity, flavor });

export const CARDS: CardInfo[] = [
  // Vale do Sítio
  card('hasty-hen', 0, 1, 'Galinha Apressada', 'comum', 'Botou o ovo e saiu correndo antes do café.'),
  card('watering-time', 0, 2, 'Hora da Rega', 'comum', 'Um pouquinho de água todo dia faz milagre.'),
  card('curious-cow', 0, 3, 'Vaca Curiosa', 'comum', 'Quer saber de tudo que acontece no sítio.'),
  card('sheep-nap', 0, 4, 'Soneca da Ovelha', 'raro', 'Contou carneirinhos e dormiu no primeiro.'),
  card('barn-workout', 0, 5, 'Treino no Celeiro', 'raro', 'Hoje é dia de perna. E de braço. E de feno.'),
  card('golden-harvest', 0, 6, 'Colheita Dourada', 'lendário', 'A abóbora gigante que todo sítio sonha em ter.'),
  // Floresta Sussurrante
  card('owl-watch', 1, 1, 'Coruja Vigia', 'comum', 'De olho na floresta a noite inteira.'),
  card('thief-squirrel', 1, 2, 'Esquilo Ladrão', 'comum', 'Essa bolota? Nunca vi na vida.'),
  card('gossip-mushrooms', 1, 3, 'Cogumelos Fofoqueiros', 'comum', 'Sabem todos os segredos debaixo da terra.'),
  card('glade-picnic', 1, 4, 'Piquenique na Clareira', 'raro', 'Sanduíche, suco e um sapo de penetra.'),
  card('firefly-ball', 1, 5, 'Baile dos Vaga-lumes', 'raro', 'Quando escurece, a floresta acende.'),
  card('forest-fairy', 1, 6, 'Fada da Floresta', 'lendário', 'Dizem que ela rega as flores com luar.'),
  // Montanhas Nevadas
  card('snowman', 2, 1, 'Boneco de Neve', 'comum', 'Nariz de cenoura, cachecol emprestado.'),
  card('snowball-fight', 2, 2, 'Guerra de Neve', 'comum', 'Quem acertar o Capitão ganha chocolate.'),
  card('skating-penguin', 2, 3, 'Pinguim Patinador', 'comum', 'Treina piruetas desde que era ovinho.'),
  card('shy-yeti', 2, 4, 'Yeti Tímido', 'raro', 'Grandão, peludo e morre de vergonha.'),
  card('hot-cocoa', 2, 5, 'Chocolate Quente', 'raro', 'O melhor jeito de terminar um dia frio.'),
  card('peak-aurora', 2, 6, 'Aurora no Pico', 'lendário', 'No alto da montanha, o céu dança.'),
  // Castelo do Dragão Sonolento
  card('yawning-guard', 3, 1, 'Guarda Bocejando', 'comum', 'O turno da noite é sempre o mais longo.'),
  card('pantry-mouse', 3, 2, 'Rato da Despensa', 'comum', 'O queijo do rei sumiu de novo.'),
  card('runaway-barrel', 3, 3, 'Barril Fujão', 'comum', 'Rolou ladeira abaixo e ninguém alcançou.'),
  card('courtyard-duel', 3, 4, 'Duelo no Pátio', 'raro', 'Espadas de treino, rivalidade de verdade.'),
  card('royal-feast', 3, 5, 'Banquete Real', 'raro', 'Teve até torta de sobremesa para o dragão.'),
  card('sleepy-dragon', 3, 6, 'Dragão Sonolento', 'lendário', 'Não acorde. Sério. Não acorde.'),
];

export const CARDS_PER_SET = 6;
export const cardById = (id: string) => CARDS.find(item => item.id === id);
export const RARITY_LABEL: Record<CardRarity, string> = { comum: 'Comum', raro: 'Raro', 'lendário': 'Lendário' };

/** Pacotes de cartas que vieram num baú (os baús antigos não têm) */
export const boostersOf = (loot: Loot[]) => loot.flatMap(item => item.kind === 'booster' ? [item] : []);

// --- Álbum do jogador: baús abertos e quantas cópias de cada carta (sincronizado com a conta) ---
export const CARDS_KEY = 'farminghabit.cards.v1';
/** Coleção antiga de achados: só é lida para levar os baús abertos e os achados para o álbum novo */
export const LEGACY_TREASURE_KEY = 'farminghabit.treasure.v1';
export interface OwnedCard { count: number; shiny: number }
export interface CardsState { opened: string[]; cards: Record<string, OwnedCard>; history: { chestId: string; date: string; loot: Loot[] }[] }

// Cada achado antigo vira a carta da mesma região e raridade
const LEGACY_CARD: Record<string, string> = {
  shell: 'hasty-hen', corn: 'watering-time', clover: 'sheep-nap', 'golden-egg': 'golden-harvest',
  acorn: 'thief-squirrel', 'owl-feather': 'owl-watch', 'glow-mushroom': 'firefly-ball', 'fairy-tear': 'forest-fairy',
  'blue-crystal': 'skating-penguin', 'yeti-fur': 'snowball-fight', 'eternal-flake': 'shy-yeti', moonstone: 'peak-aurora',
  'old-coin': 'pantry-mouse', 'castle-key': 'yawning-guard', 'dragon-scale': 'courtyard-duel', 'princess-crown': 'sleepy-dragon',
};

function fromLegacy(): CardsState {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_TREASURE_KEY) ?? '{}');
    const cards: Record<string, OwnedCard> = {};
    for (const [id, count] of Object.entries<number>(saved.collection ?? {})) {
      const cardId = LEGACY_CARD[id];
      if (cardId && count > 0) cards[cardId] = { count: (cards[cardId]?.count ?? 0) + count, shiny: 0 };
    }
    return { opened: saved.opened ?? [], cards, history: saved.history ?? [] };
  } catch { return { opened: [], cards: {}, history: [] }; }
}

/** Lê o álbum; sem álbum ainda, parte da coleção antiga (ela só é gravada no formato novo no próximo baú) */
export function readCards(): CardsState {
  const raw = localStorage.getItem(CARDS_KEY);
  if (raw === null) return fromLegacy();
  try {
    const saved = JSON.parse(raw);
    return { opened: saved.opened ?? [], cards: saved.cards ?? {}, history: saved.history ?? [] };
  } catch { return { opened: [], cards: {}, history: [] }; }
}

/** Guarda um baú aberto: marca como aberto e põe as cartas dos pacotes no álbum (repetidas somam cópias) */
export function saveOpenedChest(state: CardsState, chestId: string, loot: Loot[]): CardsState {
  const cards = { ...state.cards };
  for (const pull of boostersOf(loot).flatMap(booster => booster.cards)) {
    const owned = cards[pull.id] ?? { count: 0, shiny: 0 };
    cards[pull.id] = { count: owned.count + 1, shiny: owned.shiny + (pull.shiny ? 1 : 0) };
  }
  const next = { opened: [...state.opened, chestId], cards, history: [{ chestId, date: toKey(new Date()), loot }, ...state.history] };
  try { localStorage.setItem(CARDS_KEY, JSON.stringify(next)); } catch { /* sem armazenamento: vale só nesta sessão */ }
  return next;
}

export const foundCount = (state: Pick<CardsState, 'cards'>) => CARDS.filter(item => state.cards[item.id]?.count).length;
