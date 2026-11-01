import type { TrackedGoal } from '../types/goals';
import { toKey } from './goalLogic';
import { hasContent, readDiary } from './diary';

/**
 * Diário opcional: ele existe enquanto houver a meta de id fixo "diario" sem pausa.
 * A ligação é sempre pelo id (o título é livre); desligar pausa a meta e guarda o histórico.
 */
export const DIARY_GOAL_ID = 'diario';
/** Disparado sempre que o blob de metas muda nesta aba (o evento "storage" só chega das outras abas) */
export const GOALS_EVENT = 'farminghabit:goals';
const GOALS_KEY = 'farminghabit.goals.v1';

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

/**
 * Roda uma vez por abertura, só depois de o pull da conta dar certo: antes disso, gravar o blob marcaria a cópia
 * deste navegador como a mais nova e ela venceria as metas da conta. Grava (e avisa as telas) só se mudou.
 */
export function adoptWrittenDiary() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GOALS_KEY) ?? 'null');
    if (!parsed || !Array.isArray(parsed.goals)) return;
    const goals = adoptDiaryIfWritten(parsed.goals, Object.values(readDiary()).some(hasContent), new Date());
    if (goals === parsed.goals) return;
    localStorage.setItem(GOALS_KEY, JSON.stringify({ ...parsed, goals }));
    window.dispatchEvent(new Event(GOALS_EVENT));
  } catch { /* modo privado: fica para a próxima abertura */ }
}
