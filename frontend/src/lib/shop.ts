import { toKey } from './goalLogic';

/** Compras ficam registradas neste navegador (o backend só desconta as moedas) */
export interface Purchase { id: string; rewardId: string; title: string; price: number; date: string; used: boolean }
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
export const DEFAULT_REWARDS: Reward[] = [
  fixed('doce', 'Comer um doce sem culpa', 40, 'Aquele brigadeiro, sorvete ou pedaço de bolo que você está namorando.'),
  fixed('episodio', 'Mais um episódio da série', 50, 'Só mais um... e dessa vez está liberado!'),
  fixed('cafe', 'Café especial na padaria', 60, 'Um cappuccino caprichado, tomado sem pressa nenhuma.'),
  fixed('cochilo', 'Cochilo da tarde', 70, 'Vinte minutinhos de descanso merecido, sem despertador de culpa.'),
  fixed('jogo', 'Uma hora de jogo', 80, 'Videogame, tabuleiro ou celular: do jeitinho que você quiser.'),
  fixed('musica', 'Banho demorado com playlist', 90, 'A playlist favorita no volume certo e água quentinha.'),
  fixed('planta', 'Plantinha nova', 120, 'Mais uma verdinha para cuidar e dar nome.'),
  fixed('comida', 'Pedir a comida favorita', 150, 'Pizza, sushi, hambúrguer... hoje é dia de pedir.'),
  fixed('livro', 'Livro novo', 200, 'Finalmente comprar aquele livro que mora no carrinho há meses.'),
  fixed('passeio', 'Passeio no fim de semana', 250, 'Cinema, parque ou aquele lugar novo que você quer conhecer.'),
];

export type ItemKind = 'gift' | 'coffee' | 'book' | 'cake' | 'ticket' | 'game' | 'plant' | 'spa' | 'food' | 'music';
const KEYWORDS: [ItemKind, RegExp][] = [
  ['coffee', /caf[eé]|ch[aá]\b|cappuccino/i], ['book', /livro|leitura|revista|hq|mang[aá]/i], ['cake', /doce|bolo|chocolate|sorvete|a[cç]a[ií]|brigadeiro/i],
  ['ticket', /filme|cinema|show|teatro|ingresso|s[eé]rie|passeio|viagem/i], ['game', /jogo|game|videogame|console/i], ['plant', /planta|flor|jardim|muda|vaso/i],
  ['spa', /spa|massagem|banho|descanso|dormir|cochilo|skincare/i], ['food', /pizza|lanche|hamb|sushi|comida|jantar|restaurante/i], ['music', /m[uú]sica|disco|fone|vinil|spotify/i],
];
/** Escolhe o ícone do item pelo nome da recompensa */
export const itemKindFor = (title: string): ItemKind => KEYWORDS.find(([, pattern]) => pattern.test(title))?.[0] ?? 'gift';
