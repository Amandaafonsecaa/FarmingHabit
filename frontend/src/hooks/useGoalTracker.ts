import { useEffect, useState } from 'react';
import { useStorageChange } from './useStorageChange';
import { classifyDefaultGoals } from '../lib/goalAreas';
import { toKey } from '../lib/goalLogic';
import { CHECKINS_EVENT, readLog, removeGoalCheckins, sendCheckin, setLocalAmount } from '../lib/checkins';
import type { CheckinResult } from '../services/api';
import type { GoalLog, NewTrackedGoal, TrackedGoal } from '../types/goals';

// Definição das metas: blob sincronizado pelo cloudSync. Histórico de cada dia: servidor (ver lib/checkins).
const STORAGE_KEY = 'farminghabit.goals.v1';

function load(): TrackedGoal[] | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return parsed && Array.isArray(parsed.goals) ? classifyDefaultGoals(parsed.goals) : null;
  } catch { return null; }
}

/** Um exemplo de cada tipo de meta (sem histórico inventado: o histórico agora é dado real da conta) */
function seed(today: Date): TrackedGoal[] {
  const createdOn = toKey(today);
  return [
    { id: 'exemplo-leitura', title: 'Ler 20 páginas', area: 'estudos', icon: 'book', frequency: { kind: 'daily' }, measure: { kind: 'check' }, createdOn },
    { id: 'exemplo-academia', title: 'Ir à academia', area: 'saude', icon: 'flame', frequency: { kind: 'weekly', timesPerWeek: 5 }, measure: { kind: 'check' }, createdOn },
    { id: 'exemplo-estudo', title: 'Estudar inglês', area: 'estudos', icon: 'target', frequency: { kind: 'weekdays', days: [1, 3, 5] }, measure: { kind: 'check' }, createdOn },
    { id: 'exemplo-agua', title: 'Beber 2 litros de água', area: 'saude', icon: 'water', frequency: { kind: 'daily' }, measure: { kind: 'quantity', target: 8, unit: 'copos', step: 1 }, createdOn },
  ];
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
  const [goals, setGoals] = useState<TrackedGoal[]>(() => load() ?? seed(new Date()));
  const [log, setLog] = useState<GoalLog>(readLog);
  useStorageChange(STORAGE_KEY, () => { const next = load(); if (next) setGoals(next); });
  useEffect(() => {
    try {
      // Histórico antigo dentro do blob fica até o syncCheckins subi-lo ao servidor (ele mesmo o tira daqui)
      const legacyLog = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')?.log;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyLog ? { goals, log: legacyLog } : { goals }));
    } catch { /* modo privado: segue só em memória */ }
  }, [goals]);
  // Histórico atualizado por outra tela, pela sincronização ou pela volta da internet
  useEffect(() => {
    const refresh = () => setLog(readLog());
    window.addEventListener(CHECKINS_EVENT, refresh);
    return () => window.removeEventListener(CHECKINS_EVENT, refresh);
  }, []);

  /** Grava o dia: a tela muda na hora e o servidor confere e paga (null = sem conexão, sobe depois) */
  function setAmount(goalId: string, key: string, amount: number): Promise<CheckinResult | null> {
    setLog(setLocalAmount(goalId, key, amount));
    return sendCheckin(goalId, key, amount);
  }

  function addGoal(goal: NewTrackedGoal) {
    const created: TrackedGoal = { ...goal, id: crypto.randomUUID(), createdOn: toKey(new Date()) };
    setGoals(current => [...current, created]);
    return created;
  }

  /** Edita a meta (nome, semente, ritmo, medida e área); id, data de plantio e histórico continuam */
  function updateGoal(goalId: string, changes: NewTrackedGoal) {
    setGoals(current => current.map(goal => goal.id === goalId ? { ...goal, ...changes } : goal));
  }

  /** Recaída numa meta de largar: registra o dia (zera o contador de dias sem) e desmarca o "evitei" desse dia */
  function relapse(goalId: string, key: string) {
    setGoals(current => current.map(goal => goal.id === goalId ? { ...goal, relapses: [...new Set([...(goal.relapses ?? []), key])] } : goal));
    return setAmount(goalId, key, 0);
  }

  function removeGoal(goalId: string) {
    setGoals(current => current.filter(goal => goal.id !== goalId));
    return removeGoalCheckins(goalId);
  }

  return { goals, log, setAmount, addGoal, updateGoal, relapse, removeGoal };
}
