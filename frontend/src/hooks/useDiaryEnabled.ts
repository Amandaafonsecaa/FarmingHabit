import { useEffect, useState } from 'react';
import { useStorageChange } from './useStorageChange';
import { GOALS_EVENT, isDiaryOn } from '../lib/diaryGoal';
import type { TrackedGoal } from '../types/goals';

const GOALS_KEY = 'farminghabit.goals.v1';

function read() {
  try {
    const goals: unknown = JSON.parse(localStorage.getItem(GOALS_KEY) ?? 'null')?.goals;
    return Array.isArray(goals) && isDiaryOn(goals as TrackedGoal[]);
  } catch { return false; }
}

/** Só a pergunta "o Diário está ligado?", para quem não precisa das metas (navegação, rotas) */
export function useDiaryEnabled() {
  const [on, setOn] = useState(read);
  useStorageChange(GOALS_KEY, () => setOn(read()));
  useEffect(() => {
    const refresh = () => setOn(read());
    window.addEventListener(GOALS_EVENT, refresh);
    // Confere de novo ao se inscrever: um aviso disparado entre o desenho e este efeito não se perde
    refresh();
    return () => window.removeEventListener(GOALS_EVENT, refresh);
  }, []);
  return on;
}
