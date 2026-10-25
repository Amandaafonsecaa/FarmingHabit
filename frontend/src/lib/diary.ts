import { toKey } from './goalLogic';

export type Mood = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'rainbow';
export type Sticker = 'flower' | 'cat' | 'star' | 'heart' | 'mushroom' | 'chicken';
export interface DiaryEntry { mood?: Mood; sticker?: Sticker; gratitude: string; note: string }
export interface Adventure { date: string; title: string }

export const MOODS: { id: Mood; label: string }[] = [
  { id: 'sunny', label: 'Ensolarado' }, { id: 'cloudy', label: 'Nublado' }, { id: 'rainy', label: 'Chuvoso' },
  { id: 'stormy', label: 'Tempestade' }, { id: 'rainbow', label: 'Arco-íris' },
];
export const STICKERS: { id: Sticker; label: string }[] = [
  { id: 'flower', label: 'Florzinha' }, { id: 'cat', label: 'Gatinho' }, { id: 'star', label: 'Estrela' },
  { id: 'heart', label: 'Coração' }, { id: 'mushroom', label: 'Cogumelo' }, { id: 'chicken', label: 'Galinha' },
];

export const DIARY_KEY = 'farminghabit.diary.v1';
export const ADVENTURES_KEY = 'farminghabit.adventures.v1';

export const hasContent = (entry?: DiaryEntry) => !!entry && (!!entry.mood || !!entry.sticker || !!entry.gratitude.trim() || !!entry.note.trim());

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}
export const readDiary = () => read<Record<string, DiaryEntry>>(DIARY_KEY, {});
export const readAdventures = () => { const list = read<Adventure[]>(ADVENTURES_KEY, []); return Array.isArray(list) ? list : []; };

/** Chamado ao cumprir uma missão: a aventura aparece no diário daquele dia */
export function recordAdventure(title: string) {
  try { localStorage.setItem(ADVENTURES_KEY, JSON.stringify([...readAdventures(), { date: toKey(new Date()), title }])); } catch { /* sem armazenamento: segue sem registro */ }
}
