import type { GoalLog, TrackedGoal } from '../types/goals';
import { amountOn, dailyTarget, toKey } from './goalLogic';
import { hasContent, readDiary } from './diary';
import { readSettings, saveSettings } from './settings';

/**
 * Diário em duas partes independentes:
 * - a aba (página do diário virtual) é uma preferência, `diaryPage` nas configurações;
 * - a meta de id fixo "diario" é uma meta comum, com histórico próprio e que pode ser apagada. Escrever no
 *   diário de hoje a cumpre sozinho (o check-in é o de sempre, quem paga é o servidor); desmarcar na mão vale.
 * Ligar a aba planta a meta (ou tira a pausa dela); desligar a aba não mexe na meta (quem escreve no papel a mantém).
 */
export const DIARY_GOAL_ID = 'diario';
/** Disparado sempre que o blob de metas muda nesta aba (o evento "storage" só chega das outras abas) */
export const GOALS_EVENT = 'farminghabit:goals';
const GOALS_KEY = 'farminghabit.goals.v1';

export const isDiaryGoal = (goal: TrackedGoal) => goal.id === DIARY_GOAL_ID;

export function createDiaryGoal(today: Date): TrackedGoal {
  return { id: DIARY_GOAL_ID, title: 'Escrever no diário', icon: 'book', frequency: { kind: 'daily' }, measure: { kind: 'check' }, area: 'pessoal', createdOn: toKey(today) };
}

/**
 * Meta do Diário que escrever no diário de hoje cumpre: existe, está ativa, já foi plantada e o dia ainda não
 * tem o check dela. Sem nada pendente (ou sem meta), devolve undefined e a escrita não marca nada.
 */
export function diaryGoalToHarvest(goals: TrackedGoal[], log: GoalLog, day: string): TrackedGoal | undefined {
  const goal = goals.find(goal => isDiaryGoal(goal) && !goal.paused);
  if (!goal || goal.createdOn > day || amountOn(goal, log, day) >= dailyTarget(goal)) return undefined;
  return goal;
}

/** Contas de antes da separação: a aba seguia a meta (ligada e sem pausa) ou páginas já escritas sem meta nenhuma */
function legacyDiaryPage(goals: TrackedGoal[]) {
  return goals.some(goal => isDiaryGoal(goal) && !goal.paused) || (!goals.some(isDiaryGoal) && Object.values(readDiary()).some(hasContent));
}

function readGoals(): TrackedGoal[] {
  try {
    const goals: unknown = JSON.parse(localStorage.getItem(GOALS_KEY) ?? 'null')?.goals;
    return Array.isArray(goals) ? goals as TrackedGoal[] : [];
  } catch { return []; }
}

/** A aba do Diário está ligada? Sem escolha gravada ainda, deduz do jeito antigo */
export function readDiaryPage() {
  return readSettings().diaryPage ?? legacyDiaryPage(readGoals());
}

/** Planta a meta do Diário ou tira a pausa dela; se já está ativa devolve o mesmo array */
export function withDiaryGoal(goals: TrackedGoal[], today: Date): TrackedGoal[] {
  const current = goals.find(isDiaryGoal);
  if (!current) return [...goals, createDiaryGoal(today)];
  if (!current.paused) return goals;
  return goals.map(goal => {
    if (!isDiaryGoal(goal)) return goal;
    const { paused: _paused, ...active } = goal;
    return active;
  });
}

/** Grava a escolha da aba (a meta, quem planta é o useGoalTracker) */
export function saveDiaryPage(on: boolean) {
  saveSettings({ ...readSettings(), diaryPage: on });
}

/**
 * Grava a escolha deduzida das contas antigas, para a aba não sumir quando a meta for apagada.
 * No boot roda só depois de o pull da conta dar certo (antes disso a dedução usaria a cópia velha deste navegador).
 */
export function settleDiaryPage() {
  if (readSettings().diaryPage !== undefined) return;
  saveSettings({ ...readSettings(), diaryPage: legacyDiaryPage(readGoals()) });
}
