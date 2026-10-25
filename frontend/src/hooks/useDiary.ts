import { useEffect, useState } from 'react';
import { DIARY_KEY, hasContent, readAdventures, readDiary, type DiaryEntry } from '../lib/diary';
import { addDays, toKey } from '../lib/goalLogic';

const EMPTY: DiaryEntry = { gratitude: '', note: '' };

/** Páginas do diário guardadas neste navegador (o backend ainda não tem diário) */
export function useDiary() {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>(readDiary);
  const [adventures] = useState(readAdventures);
  useEffect(() => {
    try { localStorage.setItem(DIARY_KEY, JSON.stringify(entries)); } catch { /* modo privado: segue só em memória */ }
  }, [entries]);

  const entryFor = (key: string) => entries[key] ?? EMPTY;
  const update = (key: string, patch: Partial<DiaryEntry>) => setEntries(current => ({ ...current, [key]: { ...EMPTY, ...current[key], ...patch } }));
  const written = Object.keys(entries).filter(key => hasContent(entries[key]));

  /** Dias seguidos escrevendo, terminando hoje (ou ontem, se hoje ainda está em branco) */
  function streak(today: Date) {
    let day = hasContent(entries[toKey(today)]) ? today : addDays(today, -1);
    let count = 0;
    while (hasContent(entries[toKey(day)])) { count++; day = addDays(day, -1); }
    return count;
  }

  return { entries, adventures, entryFor, update, written, streak };
}
