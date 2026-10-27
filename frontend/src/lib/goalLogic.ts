import type { DayStatus, GoalLog, TrackedGoal, Weekday } from '../types/goals';

// --- Datas (sempre no fuso local, sem horário) ---

export const toKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
/** Semanas começam na segunda-feira */
export const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));
export const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
export const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

// --- Regras de cada meta ---

export const dailyTarget = (goal: TrackedGoal) => goal.measure.kind === 'quantity' ? goal.measure.target : 1;
export const amountOn = (goal: TrackedGoal, log: GoalLog, key: string) => log[key]?.[goal.id] ?? 0;
/** Chaves AAAA-MM-DD podem ser comparadas como texto */
const existsOn = (goal: TrackedGoal, key: string) => key >= goal.createdOn;

/** A meta cobra execução nesta data? Semanais podem ser feitas em qualquer dia */
export function isScheduled(goal: TrackedGoal, date: Date) {
  return goal.frequency.kind !== 'weekdays' || goal.frequency.days.includes(date.getDay() as Weekday);
}

export const isDoneOn = (goal: TrackedGoal, log: GoalLog, date: Date) => amountOn(goal, log, toKey(date)) >= dailyTarget(goal);

/** Quantos dias da semana (seg–dom) que contém a data foram cumpridos */
export function weekChecks(goal: TrackedGoal, log: GoalLog, date: Date) {
  const monday = startOfWeek(date);
  return WEEK_ORDER.filter((_, index) => isDoneOn(goal, log, addDays(monday, index))).length;
}

export function weekTarget(goal: TrackedGoal) {
  if (goal.frequency.kind === 'weekly') return goal.frequency.timesPerWeek;
  if (goal.frequency.kind === 'weekdays') return goal.frequency.days.length;
  return 7;
}

/** Progresso do card (0–100): semanais avançam por check na semana, as demais pelo dia de hoje */
export function progressFor(goal: TrackedGoal, log: GoalLog, today: Date) {
  const ratio = goal.frequency.kind === 'weekly'
    ? weekChecks(goal, log, today) / goal.frequency.timesPerWeek
    : amountOn(goal, log, toKey(today)) / dailyTarget(goal);
  return Math.min(100, Math.round(ratio * 100));
}

/** Progresso da semana inteira (0–100), usado no resumo do topo */
export const weekProgressFor = (goal: TrackedGoal, log: GoalLog, today: Date) =>
  Math.min(100, Math.round(weekChecks(goal, log, today) / Math.max(1, weekTarget(goal)) * 100));

/**
 * Sequência atual. Diárias/dias específicos contam dias agendados seguidos; semanais contam semanas batidas.
 * O dia (ou semana) atual ainda em aberto não quebra a sequência.
 */
export function streakFor(goal: TrackedGoal, log: GoalLog, today: Date) {
  if (goal.frequency.kind === 'weekly') {
    const target = goal.frequency.timesPerWeek;
    let week = startOfWeek(today);
    let count = weekChecks(goal, log, week) >= target ? 1 : 0;
    week = addDays(week, -7);
    while (existsOn(goal, toKey(addDays(week, 6))) && weekChecks(goal, log, week) >= target) { count++; week = addDays(week, -7); }
    return count;
  }
  let day = today;
  if (isScheduled(goal, day) && !isDoneOn(goal, log, day)) day = addDays(day, -1);
  let count = 0;
  while (existsOn(goal, toKey(day))) {
    if (isScheduled(goal, day)) {
      if (!isDoneOn(goal, log, day)) break;
      count++;
    }
    day = addDays(day, -1);
  }
  return count;
}

/** Próximo dia agendado a partir de amanhã, para metas de dias específicos */
export function nextScheduledName(goal: TrackedGoal, today: Date) {
  for (let offset = 1; offset <= 7; offset++) {
    const day = addDays(today, offset);
    if (isScheduled(goal, day)) return offset === 1 ? 'amanhã' : WEEKDAY_NAMES[day.getDay()];
  }
  return '';
}

export const isQuitGoal = (goal: TrackedGoal) => goal.mode === 'quit';

/** Dias sem o hábito, numa meta de largar: desde a última recaída (ou desde que a meta foi criada) até hoje */
export function daysWithout(goal: TrackedGoal, today: Date) {
  const lastRelapse = [...(goal.relapses ?? [])].sort().at(-1);
  const start = lastRelapse ? addDays(fromKey(lastRelapse), 1) : fromKey(goal.createdOn);
  return Math.max(0, Math.round((fromKey(toKey(today)).getTime() - start.getTime()) / 86400000));
}

export function frequencyLabel(goal: TrackedGoal) {
  if (isQuitGoal(goal)) return 'Largar · todo dia';
  if (goal.frequency.kind === 'weekly') return `${goal.frequency.timesPerWeek}x por semana`;
  if (goal.frequency.kind === 'weekdays') {
    const days = goal.frequency.days;
    return WEEK_ORDER.filter(day => days.includes(day)).map(day => WEEKDAY_NAMES[day]).join(' · ');
  }
  return 'Todo dia';
}

// --- Calendário da safra ---

export interface DaySummary {
  status: DayStatus;
  cultivated: { goal: TrackedGoal; amount: number; done: boolean }[];
  missed: TrackedGoal[];
}

/**
 * Resume um dia para o heatmap. Diárias e dias específicos "cobram" o dia;
 * semanais só entram na conta quando foram feitas (não há falta num dia específico).
 */
export function summarizeDay(goals: TrackedGoal[], log: GoalLog, date: Date, todayKey: string): DaySummary {
  const key = toKey(date);
  const alive = goals.filter(goal => existsOn(goal, key));
  const cultivated = alive.filter(goal => amountOn(goal, log, key) > 0)
    .map(goal => ({ goal, amount: amountOn(goal, log, key), done: isDoneOn(goal, log, date) }));
  if (key > todayKey) return { status: 'future', cultivated: [], missed: [] };

  const due = alive.filter(goal => goal.frequency.kind !== 'weekly' && isScheduled(goal, date));
  const weeklyDone = cultivated.filter(entry => entry.goal.frequency.kind === 'weekly');
  const expected = due.length + weeklyDone.length;
  const missed = due.filter(goal => amountOn(goal, log, key) === 0);
  if (expected === 0) return { status: 'rest', cultivated, missed };

  const score = due.reduce((sum, goal) => sum + Math.min(1, amountOn(goal, log, key) / dailyTarget(goal)), 0) + weeklyDone.length;
  const ratio = score / expected;
  const status: DayStatus = ratio >= 1 ? 'harvest' : ratio > 0 ? 'partial' : key === todayKey ? 'pending' : 'dry';
  return { status, cultivated, missed };
}

// --- Ordenação das listas ---

/** Já colhida no período atual: o dia de hoje feito ou a semana batida */
export const isHarvested = (goal: TrackedGoal, log: GoalLog, today: Date) => isDoneOn(goal, log, today) || progressFor(goal, log, today) >= 100;

/** Pendentes de hoje em cima, depois as de descanso, colhidas por último (ordem estável dentro de cada grupo) */
export function sortByPending(goals: TrackedGoal[], log: GoalLog, today: Date) {
  const rank = (goal: TrackedGoal) => isHarvested(goal, log, today) ? 2 : isScheduled(goal, today) ? 0 : 1;
  return [...goals].sort((a, b) => rank(a) - rank(b));
}

/** Metas que cobram hoje e quantas já foram colhidas (semanais já batidas não cobram) */
export function todayStats(goals: TrackedGoal[], log: GoalLog, today: Date) {
  const due = goals.filter(goal => goal.frequency.kind === 'weekly'
    ? weekChecks(goal, log, today) < goal.frequency.timesPerWeek || isDoneOn(goal, log, today)
    : isScheduled(goal, today));
  return { due: due.length, done: due.filter(goal => isDoneOn(goal, log, today)).length };
}

// --- Histórico (aba Evolução) ---

export const fromKey = (key: string) => { const [year, month, day] = key.split('-').map(Number); return new Date(year, month - 1, day); };

/** Maior sequência já feita: dias agendados seguidos (ou semanas batidas, nas semanais) */
export function longestStreak(goal: TrackedGoal, log: GoalLog, today: Date) {
  let best = 0, run = 0;
  if (goal.frequency.kind === 'weekly') {
    const target = goal.frequency.timesPerWeek;
    for (let week = startOfWeek(fromKey(goal.createdOn)); week <= today; week = addDays(week, 7)) {
      if (weekChecks(goal, log, week) >= target) best = Math.max(best, ++run);
      else if (addDays(week, 6) < today) run = 0;
    }
    return best;
  }
  const todayKey = toKey(today);
  for (let day = fromKey(goal.createdOn); toKey(day) <= todayKey; day = addDays(day, 1)) {
    if (!isScheduled(goal, day)) continue;
    if (isDoneOn(goal, log, day)) best = Math.max(best, ++run);
    else if (toKey(day) !== todayKey) run = 0;
  }
  return best;
}

/** Quantas "colheitas" (meta cumprida num dia) aconteceram entre duas datas, inclusive */
export function harvestsBetween(goals: TrackedGoal[], log: GoalLog, from: Date, to: Date) {
  let total = 0;
  for (let day = from; day <= to; day = addDays(day, 1)) total += goals.filter(goal => isDoneOn(goal, log, day)).length;
  return total;
}

/** Metas que cobram hoje (horta da Casa e vendinha das Metas): semanais já batidas na semana saem, a não ser que tenham sido feitas hoje */
export const goalsDueToday = (goals: TrackedGoal[], log: GoalLog, today: Date) => goals.filter(goal => goal.frequency.kind === 'weekly'
  ? weekChecks(goal, log, today) < goal.frequency.timesPerWeek || isDoneOn(goal, log, today)
  : isScheduled(goal, today));
