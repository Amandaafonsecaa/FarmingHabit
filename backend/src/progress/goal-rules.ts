/**
 * Leitura das metas que o jogador guarda na conta ("farminghabit.goals.v1" em user_data),
 * com as mesmas regras do front para dizer se o dia foi cumprido e se a semana foi batida.
 */
export const GOALS_KEY = 'farminghabit.goals.v1';

export interface StoredGoal {
  id: string;
  frequency?: { kind?: string; timesPerWeek?: number };
  measure?: { kind?: string; target?: number };
}
export interface GoalBook {
  goals: StoredGoal[];
  log: Record<string, Record<string, number>>;
}

export function parseGoalBook(
  value: string | null | undefined,
): GoalBook | null {
  try {
    const parsed: unknown = JSON.parse(value ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const { goals, log } = parsed as Partial<GoalBook>;
    return Array.isArray(goals) && log && typeof log === 'object'
      ? { goals, log }
      : null;
  } catch {
    return null;
  }
}

/** Check único vale 1; meta de quantidade vale o alvo do dia */
export function dailyTarget(goal: StoredGoal): number {
  const target = Number(goal.measure?.target);
  return goal.measure?.kind === 'quantity' &&
    Number.isFinite(target) &&
    target > 0
    ? target
    : 1;
}

export const amountOn = (goal: StoredGoal, book: GoalBook, day: string) =>
  Number(book.log[day]?.[goal.id] ?? 0) || 0;

const fromDay = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (date: Date) => date.toISOString().slice(0, 10);

/** Segunda-feira (AAAA-MM-DD) da semana que contém o dia */
export function mondayOf(day: string): string {
  const date = fromDay(day);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return toDay(date);
}

/** Quantos dias da semana (seg–dom) que contém o dia foram cumpridos */
export function weekChecks(
  goal: StoredGoal,
  book: GoalBook,
  day: string,
): number {
  const monday = fromDay(mondayOf(day));
  let done = 0;
  for (let index = 0; index < 7; index++) {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    if (amountOn(goal, book, toDay(date)) >= dailyTarget(goal)) done++;
  }
  return done;
}

export function isWeeklyGoalMet(
  goal: StoredGoal,
  book: GoalBook,
  day: string,
): boolean {
  const times = Number(goal.frequency?.timesPerWeek);
  return (
    goal.frequency?.kind === 'weekly' &&
    Number.isFinite(times) &&
    times > 0 &&
    weekChecks(goal, book, day) >= times
  );
}
