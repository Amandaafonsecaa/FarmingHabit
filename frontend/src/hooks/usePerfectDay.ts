import { useEffect, useRef, useState } from 'react';
import type { GoalLog, TrackedGoal } from '../types/goals';
import { goalsDueToday, isDoneOn, toKey } from '../lib/goalLogic';
import { toast } from '../lib/toast';
import { useStorageChange } from './useStorageChange';

const PERFECT_KEY = 'farminghabit.perfect-day';
const CELEBRATION_MS = 9000;
const readPerfectDate = () => { try { return localStorage.getItem(PERFECT_KEY); } catch { return null; } };

/**
 * Dia perfeito (Casa e Metas): no momento em que todas as metas de hoje ficam completas, chovem pétalas,
 * o arco-íris aparece por alguns segundos e um toast comemora. Não repete ao recarregar nem ao trocar de aba;
 * some na hora se alguma meta deixar de estar completa.
 */
export function usePerfectDay(goals: TrackedGoal[], log: GoalLog, today: Date) {
  const todayKey = toKey(today);
  const due = goalsDueToday(goals, log, today);
  const perfectNow = due.length > 0 && due.every(goal => isDoneOn(goal, log, today));
  const [perfectDate, setPerfectDate] = useState(readPerfectDate);
  useStorageChange(PERFECT_KEY, () => setPerfectDate(readPerfectDate()));
  const [celebrating, setCelebrating] = useState(false);

  const wasPerfect = useRef(perfectNow);
  useEffect(() => {
    const before = wasPerfect.current;
    wasPerfect.current = perfectNow;
    if (!perfectNow) { setCelebrating(false); return; }
    if (before) return;
    try { localStorage.setItem(PERFECT_KEY, todayKey); } catch { /* ignora */ }
    setPerfectDate(todayKey);
    setCelebrating(true);
    toast('🌈 Dia perfeito! Todas as metas de hoje foram colhidas.', 'success');
    const timer = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    return () => window.clearTimeout(timer);
  }, [perfectNow, todayKey]);

  return { celebrating, perfectDay: perfectDate === todayKey };
}
