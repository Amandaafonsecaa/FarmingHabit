export interface Mission { id: string; title: string; description: string; xp: number; coins: number; completed: boolean; rewarded: boolean }
export interface Reward { id: string; name: string; price: number; icon: 'coffee' | 'book'; mock?: boolean }
export type ItemKind = 'goal' | 'mission' | 'reward';
export type NewItem =
  | { kind: 'mission'; title: string; description: string; xp: number; coins: number }
  | { kind: 'reward'; title: string; price: number };
