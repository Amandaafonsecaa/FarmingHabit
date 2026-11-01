import { useEffect, useMemo, useState } from 'react';
import { useStorageChange } from './useStorageChange';
import { classifyDefaultGoals } from '../lib/goalAreas';
import { toKey } from '../lib/goalLogic';
import { CHECKINS_EVENT, readLog, removeGoalCheckins, sendCheckin, setLocalAmount } from '../lib/checkins';
import { GOALS_EVENT, isDiaryOn, withDiary } from '../lib/diaryGoal';
import type { CheckinResult } from '../services/api';
import type { GoalLog, NewTrackedGoal, TrackedGoal } from '../types/goals';

// Definição das metas: blob sincronizado pelo cloudSync. Histórico de cada dia: servidor (ver lib/checkins).
const STORAGE_KEY = 'farminghabit.goals.v1';

/** Todas as metas do blob, inclusive as pausadas (a adoção do Diário em contas antigas é feita no boot, ver adoptWrittenDiary) */
function load(): TrackedGoal[] | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!parsed || !Array.isArray(parsed.goals)) return null;
    return classifyDefaultGoals(parsed.goals);
  } catch { return null; }
}

const sameGoals = (a: TrackedGoal[], b: TrackedGoal[]) => JSON.stringify(a) === JSON.stringify(b);

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
  // Estado com todas as metas (pausadas inclusive); as telas só recebem as ativas, filtradas aqui num ponto só
  const [allGoals, setGoals] = useState<TrackedGoal[]>(() => load() ?? seed(new Date()));
  const goals = useMemo(() => allGoals.filter(goal => !goal.paused), [allGoals]);
  const [log, setLog] = useState<GoalLog>(readLog);
  // Outra instância desta aba, outra aba ou o pull da conta mudaram as metas:
  // recarrega, mas só troca o estado se mudou de verdade (evita laço entre instâncias)
  const reload = () => { const next = load(); if (next) setGoals(current => sameGoals(current, next) ? current : next); };
  useStorageChange(STORAGE_KEY, reload);
  useEffect(() => {
    window.addEventListener(GOALS_EVENT, reload);
    // Confere de novo ao se inscrever: um aviso disparado entre o desenho e este efeito não se perde
    reload();
    return () => window.removeEventListener(GOALS_EVENT, reload);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      // Histórico antigo dentro do blob fica até o syncCheckins subi-lo ao servidor (ele mesmo o tira daqui)
      const stored = localStorage.getItem(STORAGE_KEY);
      const legacyLog = JSON.parse(stored ?? 'null')?.log;
      const next = JSON.stringify(legacyLog ? { goals: allGoals, log: legacyLog } : { goals: allGoals });
      // Só grava (e avisa as outras instâncias) quando o blob muda
      if (next === stored) return;
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(GOALS_EVENT));
    } catch { /* modo privado: segue só em memória */ }
  }, [allGoals]);
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

  /** Liga o Diário (planta ou tira a pausa da meta "diario") ou desliga (pausa, guardando o histórico) */
  function setDiaryEnabled(on: boolean) {
    setGoals(current => withDiary(current, on, new Date()));
  }

  return { goals, log, setAmount, addGoal, updateGoal, relapse, removeGoal, diaryOn: isDiaryOn(allGoals), setDiaryEnabled };
}
