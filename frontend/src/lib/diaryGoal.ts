import type { TrackedGoal } from '../types/goals';
import { toKey } from './goalLogic';

/**
 * Diário opcional: ele existe enquanto houver a meta de id fixo "diario" sem pausa.
 * A ligação é sempre pelo id (o título é livre); desligar pausa a meta e guarda o histórico.
 */
export const DIARY_GOAL_ID = 'diario';
/** Disparado sempre que o blob de metas muda nesta aba (o evento "storage" só chega das outras abas) */
export const GOALS_EVENT = 'farminghabit:goals';

export const isDiaryGoal = (goal: TrackedGoal) => goal.id === DIARY_GOAL_ID;

export function createDiaryGoal(today: Date): TrackedGoal {
  return { id: DIARY_GOAL_ID, title: 'Escrever no diário', icon: 'book', frequency: { kind: 'daily' }, measure: { kind: 'check' }, area: 'pessoal', createdOn: toKey(today) };
}

export const isDiaryOn = (goals: TrackedGoal[]) => goals.some(goal => isDiaryGoal(goal) && !goal.paused);

/** Liga (tira a pausa ou planta a meta) ou desliga (pausa); sem mudança devolve o mesmo array */
export function withDiary(goals: TrackedGoal[], on: boolean, today: Date): TrackedGoal[] {
  const current = goals.find(isDiaryGoal);
  if (on) {
    if (!current) return [...goals, createDiaryGoal(today)];
    if (!current.paused) return goals;
    return goals.map(goal => {
      if (!isDiaryGoal(goal)) return goal;
      const { paused: _paused, ...active } = goal;
      return active;
    });
  }
  if (!current || current.paused) return goals;
  return goals.map(goal => isDiaryGoal(goal) ? { ...goal, paused: true } : goal);
}

/** Contas antigas com páginas escritas e sem a meta (nem pausada) ganham o Diário ligado; nas demais nada muda */
export function adoptDiaryIfWritten(goals: TrackedGoal[], hasPages: boolean, today: Date): TrackedGoal[] {
  return hasPages && !goals.some(isDiaryGoal) ? [...goals, createDiaryGoal(today)] : goals;
}
