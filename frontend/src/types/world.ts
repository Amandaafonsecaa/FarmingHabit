export interface Goal { id: string; title: string; description: string; progress: number; detail: string; completed: boolean }
export interface Mission { id: string; title: string; description: string; xp: number; coins: number; completed: boolean; rewarded: boolean }
export interface Reward { id: string; name: string; price: number; icon: 'coffee' | 'book' }
export interface WorldState { goals: Goal[]; rewards: Reward[]; coins: number; missions: Mission[]; purchasedRewardIds: string[] }
export type ItemKind = 'goal' | 'mission' | 'reward';
export type NewItem =
  | { kind: 'goal'; title: string; description: string }
  | { kind: 'mission'; title: string; description: string; xp: number; coins: number }
  | { kind: 'reward'; title: string; price: number };
