export interface Mission { id: string; title: string; description: string; xp: number; coins: number; completed: boolean; rewarded: boolean }
/** fixed: item da vitrine fixa do armazém (não vem do backend e não sai da vitrine) */
export interface Reward { id: string; name: string; price: number; icon: 'coffee' | 'book'; description?: string; fixed?: boolean }
export type ItemKind = 'goal' | 'mission' | 'reward';
export type NewItem =
  | { kind: 'mission'; title: string; description: string; xp: number; coins: number }
  | { kind: 'reward'; title: string; price: number };
