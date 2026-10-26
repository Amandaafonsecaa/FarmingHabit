import type { GoalLog, TrackedGoal } from '../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, addDays, harvestsBetween, isDoneOn, startOfWeek, toKey } from './goalLogic';

/** Uma meta comparada: dias feitos nesta semana x no mesmo trecho da semana passada */
export interface GoalCompare { goal: TrackedGoal; now: number; before: number; delta: number; isNew: boolean }

/** Um dia da semana nas duas semanas (now = null para os dias que ainda não chegaram) */
export interface DayCompare { label: string; now: number | null; before: number; isToday: boolean }

export interface WeekCompare {
  now: number; before: number;
  /** Variação em % (null quando a semana passada foi zero) */
  change: number | null;
  /** Dias com pelo menos uma meta feita, de segunda até hoje */
  activeNow: number; activeBefore: number; daysSoFar: number;
  /** Total da semana passada inteira (a marca a superar) */
  lastWeekTotal: number;
  days: DayCompare[];
  goals: GoalCompare[];
}

const countDone = (goal: TrackedGoal, log: GoalLog, from: Date, days: number) =>
  Array.from({ length: days }, (_, index) => addDays(from, index)).filter(day => isDoneOn(goal, log, day)).length;

const activeDays = (goals: TrackedGoal[], log: GoalLog, from: Date, days: number) =>
  Array.from({ length: days }, (_, index) => addDays(from, index)).filter(day => goals.some(goal => isDoneOn(goal, log, day))).length;

/** Compara de segunda até hoje com o mesmo trecho da semana passada (comparação justa no meio da semana) */
export function compareWeeks(goals: TrackedGoal[], log: GoalLog, today: Date): WeekCompare {
  const monday = startOfWeek(today);
  const lastMonday = addDays(monday, -7);
  // Dias de segunda até hoje, contados pelas datas (a hora do dia não interfere)
  const days = WEEK_ORDER.findIndex((_, index) => toKey(addDays(monday, index)) === toKey(today)) + 1;
  const lastSameDay = addDays(lastMonday, days - 1);
  const compared = goals.map(goal => {
    const now = countDone(goal, log, monday, days);
    const before = countDone(goal, log, lastMonday, days);
    return { goal, now, before, delta: now - before, isNew: goal.createdOn > toKey(lastSameDay) };
  });
  const now = harvestsBetween(goals, log, monday, today);
  const before = harvestsBetween(goals, log, lastMonday, lastSameDay);
  const todayKey = toKey(today);
  return {
    now, before,
    change: before ? Math.round((now - before) / before * 100) : null,
    activeNow: activeDays(goals, log, monday, days), activeBefore: activeDays(goals, log, lastMonday, days), daysSoFar: days,
    lastWeekTotal: harvestsBetween(goals, log, lastMonday, addDays(lastMonday, 6)),
    days: WEEK_ORDER.map((weekday, index) => {
      const day = addDays(monday, index), last = addDays(lastMonday, index);
      return { label: WEEKDAY_NAMES[weekday], now: toKey(day) <= todayKey ? harvestsBetween(goals, log, day, day) : null, before: harvestsBetween(goals, log, last, last), isToday: toKey(day) === todayKey };
    }),
    goals: compared,
  };
}

/** Uma análise curta, do tamanho de um post-it: um destaque grande e uma linha */
export interface Insight { big: string; text: string; tone: 'yellow' | 'pink' | 'blue' | 'green' }

/** As análises da semana, uma por post-it */
export function weekInsights(compare: WeekCompare): Insight[] {
  const { now, before, change, activeNow, activeBefore, daysSoFar, lastWeekTotal } = compare;
  if (!now && !before && !lastWeekTotal) return [{ big: '🌱', text: 'Faça a primeira meta da semana', tone: 'green' }];
  const insights: Insight[] = [];
  insights.push(change === null
    ? { big: `${now}`, text: 'check-ins: a semana passada estava zerada', tone: 'yellow' }
    : { big: `${change > 0 ? '+' : ''}${change}%`, text: change > 0 ? 'acima da semana passada' : change < 0 ? 'abaixo da semana passada' : 'mesmo ritmo da semana passada', tone: change >= 0 ? 'green' : 'pink' });
  const toBeat = lastWeekTotal - now + 1;
  insights.push(toBeat > 0
    ? { big: `+${toBeat}`, text: `para superar a semana passada (${lastWeekTotal})`, tone: 'yellow' }
    : { big: '🏆', text: 'semana passada já superada', tone: 'green' });
  insights.push({ big: `${activeNow}/${daysSoFar}`, text: `dias com meta feita (antes: ${activeBefore})`, tone: 'blue' });
  const comparable = compare.goals.filter(item => !item.isNew);
  const up = [...comparable].sort((a, b) => b.delta - a.delta)[0];
  const down = [...comparable].sort((a, b) => a.delta - b.delta)[0];
  if (up && up.delta > 0) insights.push({ big: `+${up.delta}`, text: `subiu em ${up.goal.title}`, tone: 'green' });
  if (down && down.delta < 0) insights.push({ big: `${down.delta}`, text: `caiu em ${down.goal.title}`, tone: 'pink' });
  const best = compare.days.reduce((top, day) => day.before > top.before ? day : top, compare.days[0]);
  if (best.before > 0) insights.push({ big: best.label, text: `seu melhor dia da semana passada (${best.before})`, tone: 'blue' });
  const fresh = compare.goals.filter(item => item.isNew).length;
  if (fresh) insights.push({ big: `${fresh}`, text: fresh === 1 ? 'meta nova nesta semana' : 'metas novas nesta semana', tone: 'yellow' });
  return insights;
}
