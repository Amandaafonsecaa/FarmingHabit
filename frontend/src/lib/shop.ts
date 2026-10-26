import { toKey } from './goalLogic';

/** Compra persistida pelo backend; os helpers locais abaixo são legado e não importam dados automaticamente. */
export interface Purchase { id: string; rewardId: string; title: string; price: number; date: string; used: boolean; usedAt?: string | null }
export const PURCHASES_KEY = 'farminghabit.purchases.v1';
export const WISH_KEY = 'farminghabit.wish.v1';

export function readPurchases(): Purchase[] {
  try { const list = JSON.parse(localStorage.getItem(PURCHASES_KEY) ?? '[]'); return Array.isArray(list) ? list : []; } catch { return []; }
}
export function writePurchases(list: Purchase[]) {
  try { localStorage.setItem(PURCHASES_KEY, JSON.stringify(list)); } catch { /* sem armazenamento: segue só em memória */ }
}
/** Chamado em qualquer resgate (Loja ou Casa) para o item cair no baú */
export function recordPurchase(rewardId: string, title: string, price: number) {
  const purchase: Purchase = { id: crypto.randomUUID(), rewardId, title, price, date: toKey(new Date()), used: false };
  writePurchases([purchase, ...readPurchases()]);
  return purchase;
}

import type { Reward } from '../types/world';

/** Vitrine fixa do armazém: mimos que quase todo mundo gostaria de ganhar. Sempre à venda, ao lado dos personalizados. */
const fixed = (id: string, name: string, price: number, description: string): Reward => ({ id: `fixo-${id}`, name, price, description, icon: 'book', fixed: true });
// Preços pensados para ~30 moedas por dia (metas em dia + missões + baús): mimos pequenos em 2–4 dias, grandes em 2–3 semanas
export const DEFAULT_REWARDS: Reward[] = [
  fixed('episodio', 'Mais um episódio da série', 60, 'Só mais um... e dessa vez está liberado!'),
  fixed('doce', 'Comer um doce sem culpa', 80, 'Aquele brigadeiro, sorvete ou pedaço de bolo que você está namorando.'),
  fixed('cochilo', 'Cochilo da tarde', 90, 'Vinte minutinhos de descanso merecido, sem despertador de culpa.'),
  fixed('musica', 'Banho demorado com playlist', 100, 'A playlist favorita no volume certo e água quentinha.'),
  fixed('jogo', 'Uma hora de jogo', 120, 'Videogame, tabuleiro ou celular: do jeitinho que você quiser.'),
  fixed('cafe', 'Café especial na padaria', 150, 'Um cappuccino caprichado, tomado sem pressa nenhuma.'),
  fixed('planta', 'Plantinha nova', 300, 'Mais uma verdinha para cuidar e dar nome.'),
  fixed('comida', 'Pedir a comida favorita', 400, 'Pizza, sushi, hambúrguer... hoje é dia de pedir.'),
  fixed('livro', 'Livro novo', 500, 'Finalmente comprar aquele livro que mora no carrinho há meses.'),
  fixed('passeio', 'Passeio no fim de semana', 700, 'Cinema, parque ou aquele lugar novo que você quer conhecer.'),
];

export type ItemKind = 'gift' | 'coffee' | 'book' | 'cake' | 'ticket' | 'game' | 'plant' | 'spa' | 'food' | 'music';
const KEYWORDS: [ItemKind, RegExp][] = [
  ['coffee', /caf[eé]|ch[aá]\b|cappuccino/i], ['book', /livro|leitura|revista|hq|mang[aá]/i], ['cake', /doce|bolo|chocolate|sorvete|a[cç]a[ií]|brigadeiro/i],
  ['ticket', /filme|cinema|show|teatro|ingresso|s[eé]rie|passeio|viagem/i], ['game', /jogo|game|videogame|console/i], ['plant', /planta|flor|jardim|muda|vaso/i],
  ['spa', /spa|massagem|banho|descanso|dormir|cochilo|skincare/i], ['food', /pizza|lanche|hamb|sushi|comida|jantar|restaurante/i], ['music', /m[uú]sica|disco|fone|vinil|spotify/i],
];
/** Escolhe o ícone do item pelo nome da recompensa */
export const itemKindFor = (title: string): ItemKind => KEYWORDS.find(([, pattern]) => pattern.test(title))?.[0] ?? 'gift';

/** Lê os desejos salvos; versões antigas guardavam um único id em texto puro */
export function readWishes(): string[] {
  try {
    const raw = localStorage.getItem(WISH_KEY);
    if (!raw) return [];
    if (!raw.startsWith('[')) return [raw];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch { return []; }
}
