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

/** Lê só a definição das metas; o histórico de check-ins mora na tabela goal_checkins */
export function parseGoals(
  value: string | null | undefined,
): StoredGoal[] | null {
  try {
    const parsed: unknown = JSON.parse(value ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const { goals } = parsed as { goals?: unknown };
    return Array.isArray(goals) ? (goals as StoredGoal[]) : null;
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

const fromDay = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (date: Date) => date.toISOString().slice(0, 10);

/** Segunda-feira (AAAA-MM-DD) da semana que contém o dia */
export function mondayOf(day: string): string {
  const date = fromDay(day);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return toDay(date);
}

/** Os sete dias (seg–dom) da semana que contém o dia */
export function weekDays(day: string): string[] {
  const monday = fromDay(mondayOf(day));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return toDay(date);
  });
}

/** Quantos dias da semana que contém o dia bateram o alvo; amounts é dia → quantidade da meta */
export function weekChecks(
  goal: StoredGoal,
  amounts: Record<string, number>,
  day: string,
): number {
  const target = dailyTarget(goal);
  return weekDays(day).filter((date) => (Number(amounts[date]) || 0) >= target)
    .length;
}

export function isWeeklyGoalMet(
  goal: StoredGoal,
  amounts: Record<string, number>,
  day: string,
): boolean {
  const times = Number(goal.frequency?.timesPerWeek);
  return (
    goal.frequency?.kind === 'weekly' &&
    Number.isFinite(times) &&
    times > 0 &&
    weekChecks(goal, amounts, day) >= times
  );
}
