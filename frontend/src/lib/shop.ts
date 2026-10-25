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

export type ItemKind = 'gift' | 'coffee' | 'book' | 'cake' | 'ticket' | 'game' | 'plant' | 'spa' | 'food' | 'music';
const KEYWORDS: [ItemKind, RegExp][] = [
  ['coffee', /caf[eé]|ch[aá]\b|cappuccino/i], ['book', /livro|leitura|revista|hq|mang[aá]/i], ['cake', /doce|bolo|chocolate|sorvete|a[cç]a[ií]|brigadeiro/i],
  ['ticket', /filme|cinema|show|teatro|ingresso|s[eé]rie|passeio|viagem/i], ['game', /jogo|game|videogame|console/i], ['plant', /planta|flor|jardim|muda|vaso/i],
  ['spa', /spa|massagem|banho|descanso|dormir|cochilo|skincare/i], ['food', /pizza|lanche|hamb|sushi|comida|jantar|restaurante/i], ['music', /m[uú]sica|disco|fone|vinil|spotify/i],
];
/** Escolhe o ícone do item pelo nome da recompensa */
export const itemKindFor = (title: string): ItemKind => KEYWORDS.find(([, pattern]) => pattern.test(title))?.[0] ?? 'gift';
