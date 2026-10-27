import { useEffect, useState } from 'react';
import { useStorageChange } from './useStorageChange';
import { addDays, toKey } from '../lib/goalLogic';
import type { GoalLog, NewTrackedGoal, TrackedGoal } from '../types/goals';

// O backend ainda não tem frequência nem histórico diário: por ora tudo fica no navegador.
// Para integrar, basta trocar load/persist por chamadas à API mantendo esta mesma interface.
const STORAGE_KEY = 'farminghabit.goals.v1';
interface TrackerState { goals: TrackedGoal[]; log: GoalLog }

function load(): TrackerState | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return parsed && Array.isArray(parsed.goals) && typeof parsed.log === 'object' ? parsed : null;
  } catch { return null; }
}

/** Um exemplo de cada tipo de meta, com algumas semanas de histórico para o calendário não nascer vazio */
function seed(today: Date): TrackerState {
  const createdOn = toKey(addDays(today, -40));
  const goals: TrackedGoal[] = [
    { id: 'exemplo-leitura', title: 'Ler 20 páginas', icon: 'book', frequency: { kind: 'daily' }, measure: { kind: 'check' }, createdOn },
    { id: 'exemplo-academia', title: 'Ir à academia', icon: 'flame', frequency: { kind: 'weekly', timesPerWeek: 5 }, measure: { kind: 'check' }, createdOn },
    { id: 'exemplo-estudo', title: 'Estudar inglês', icon: 'target', frequency: { kind: 'weekdays', days: [1, 3, 5] }, measure: { kind: 'check' }, createdOn },
    { id: 'exemplo-agua', title: 'Beber 2 litros de água', icon: 'water', frequency: { kind: 'daily' }, measure: { kind: 'quantity', target: 8, unit: 'copos', step: 1 }, createdOn },
  ];
  const log: GoalLog = {};
  for (let daysAgo = 40; daysAgo >= 1; daysAgo--) {
    const date = addDays(today, -daysAgo);
    // Pseudoaleatório determinístico: o mesmo histórico a cada carregamento
    const random = (salt: number) => { const x = Math.sin(daysAgo * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); };
    const day: Record<string, number> = { 'exemplo-agua': Math.min(8, 2 + Math.floor(random(4) * 8)) };
    if (random(1) < 0.78) day['exemplo-leitura'] = 1;
    if (random(2) < 0.62) day['exemplo-academia'] = 1;
    if ([1, 3, 5].includes(date.getDay()) && random(3) < 0.8) day['exemplo-estudo'] = 1;
    log[toKey(date)] = day;
  }
  return { goals, log };
}

/** "Hoje" que vira sozinho à meia-noite, para metas diárias e semanais reiniciarem sem recarregar */
export function useToday() {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setToday(current => toKey(current) === toKey(new Date()) ? current : new Date());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return today;
}

export function useGoalTracker() {
  const [state, setState] = useState<TrackerState>(() => load() ?? seed(new Date()));
  useStorageChange(STORAGE_KEY, () => { const next = load(); if (next) setState(next); });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* modo privado: segue só em memória */ }
  }, [state]);

  function setAmount(goalId: string, key: string, amount: number) {
    setState(current => {
      const day = { ...current.log[key] };
      if (amount > 0) day[goalId] = amount; else delete day[goalId];
      return { ...current, log: { ...current.log, [key]: day } };
    });
  }

  function addGoal(goal: NewTrackedGoal) {
    const created: TrackedGoal = { ...goal, id: crypto.randomUUID(), createdOn: toKey(new Date()) };
    setState(current => ({ ...current, goals: [...current.goals, created] }));
    return created;
  }

  /** Edita a meta (nome, semente, ritmo, medida e área); id, data de plantio e histórico continuam */
  function updateGoal(goalId: string, changes: NewTrackedGoal) {
    setState(current => ({ ...current, goals: current.goals.map(goal => goal.id === goalId ? { ...goal, ...changes } : goal) }));
  }

  /** Recaída numa meta de largar: registra o dia (zera o contador de dias sem) e desmarca o "evitei" desse dia */
  function relapse(goalId: string, key: string) {
    setState(current => {
      const day = { ...current.log[key] };
      delete day[goalId];
      return {
        log: { ...current.log, [key]: day },
        goals: current.goals.map(goal => goal.id === goalId ? { ...goal, relapses: [...new Set([...(goal.relapses ?? []), key])] } : goal),
      };
    });
  }

  function removeGoal(goalId: string) {
    setState(current => ({
      goals: current.goals.filter(goal => goal.id !== goalId),
      log: Object.fromEntries(Object.entries(current.log).map(([key, day]) => {
        const { [goalId]: _removed, ...rest } = day;
        return [key, rest];
      })),
    }));
  }

  return { goals: state.goals, log: state.log, setAmount, addGoal, updateGoal, relapse, removeGoal };
}
