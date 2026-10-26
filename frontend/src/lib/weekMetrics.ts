import type { GoalArea, GoalLog, TrackedGoal } from '../types/goals';
import type { Mission } from '../types/world';
import type { TreasureState } from './treasure';
import { addDays, isDoneOn, startOfWeek, toKey } from './goalLogic';
import { goalWeek } from './coach';
import { areaOf } from './goalAreas';
import { HARVEST_REWARD, WEEK_BONUS } from './harvestRewards';

/** Uma área nesta semana: check-ins feitos e quanto já dava para ter feito (de segunda até hoje) */
export interface AreaWeek { area: GoalArea; done: number; expected: number; pending: number; rate: number }

/** Junta as metas por área com os números da semana (a mesma conta do Coach: hoje só conta se já foi feito) */
export function areasThisWeek(goals: TrackedGoal[], log: GoalLog, today: Date): AreaWeek[] {
  const byArea = new Map<GoalArea, { done: number; expected: number }>();
  for (const goal of goals) {
    const week = goalWeek(goal, log, today);
    const area = areaOf(goal.area);
    const current = byArea.get(area) ?? { done: 0, expected: 0 };
    byArea.set(area, { done: current.done + week.done, expected: current.expected + week.expected });
  }
  return [...byArea].map(([area, { done, expected }]) => ({
    area, done, expected, pending: Math.max(0, expected - done), rate: expected ? Math.min(1, done / expected) : 1,
  }));
}

/** Área com mais atividades concluídas na semana (null quando nada foi feito ainda) */
export function bestArea(areas: AreaWeek[]): AreaWeek | null {
  const best = [...areas].sort((a, b) => b.done - a.done || b.rate - a.rate)[0];
  return best && best.done > 0 ? best : null;
}

/**
 * Área para focar: menor taxa de conclusão entre as que já cobraram algo na semana (empate: mais pendências).
 * null sem dados; 'ok' quando tudo o que dava para fazer foi feito.
 */
export function focusArea(areas: AreaWeek[]): AreaWeek | 'ok' | null {
  const measured = areas.filter(area => area.expected > 0);
  if (!measured.length) return null;
  const focus = [...measured].sort((a, b) => a.rate - b.rate || b.pending - a.pending)[0];
  return focus.pending > 0 ? focus : 'ok';
}

export interface Earnings { coins: number; xp: number; events: number }
const empty = (): Earnings => ({ coins: 0, xp: 0, events: 0 });
const add = (total: Earnings, coins: number, xp: number) => { total.coins += coins; total.xp += xp; total.events += 1; };

/**
 * Moedas e XP ganhos entre duas datas (AAAA-MM-DD, inclusive), somando as três fontes do jogo:
 * colheitas de metas (e bônus de semana), baús abertos e missões cumpridas.
 */
export function earningsBetween(from: string, to: string, claims: string[], treasure: TreasureState, missions: Mission[]): Earnings {
  const total = empty();
  for (const claim of claims) {
    const day = claim.slice(0, 10);
    if (day < from || day > to) continue;
    if (claim.endsWith(':semana')) add(total, WEEK_BONUS.coins, WEEK_BONUS.xp);
    else add(total, HARVEST_REWARD.coins, HARVEST_REWARD.xp);
  }
  for (const chest of treasure.history) {
    if (chest.date < from || chest.date > to) continue;
    add(total,
      chest.loot.reduce((sum, item) => sum + (item.kind === 'coins' ? item.amount : 0), 0),
      chest.loot.reduce((sum, item) => sum + (item.kind === 'xp' ? item.amount : 0), 0));
  }
  for (const mission of missions) {
    if (!mission.completed || !mission.completedAt) continue;
    const day = toKey(new Date(mission.completedAt));
    if (day >= from && day <= to) add(total, mission.coins, mission.xp);
  }
  return total;
}

/** Esta semana (segunda até hoje) e a semana passada inteira */
export function weekEarnings(today: Date, claims: string[], treasure: TreasureState, missions: Mission[]) {
  const monday = startOfWeek(today);
  const lastMonday = addDays(monday, -7);
  return {
    now: earningsBetween(toKey(monday), toKey(today), claims, treasure, missions),
    before: earningsBetween(toKey(lastMonday), toKey(addDays(lastMonday, 6)), claims, treasure, missions),
  };
}


const WEEKDAY_FULL = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

/** Dia desta semana (segunda até hoje) com mais metas cumpridas; null se nada foi feito ainda */
export function bestDayThisWeek(goals: TrackedGoal[], log: GoalLog, today: Date): { name: string; count: number } | null {
  const monday = startOfWeek(today);
  let best: { name: string; count: number } | null = null;
  for (let day = monday; toKey(day) <= toKey(today); day = addDays(day, 1)) {
    const count = goals.filter(goal => isDoneOn(goal, log, day)).length;
    if (count > 0 && (!best || count > best.count)) best = { name: WEEKDAY_FULL[day.getDay()], count };
  }
  return best;
}

/** Área para a dica da semana: a de menor % de conclusão (empate: menos concluídas). 'ok' se tudo está em 100% */
export function tipArea(areas: AreaWeek[]): AreaWeek | 'ok' | null {
  const measured = areas.filter(area => area.expected > 0);
  if (!measured.length) return null;
  const weakest = [...measured].sort((a, b) => a.rate - b.rate || a.done - b.done)[0];
  return weakest.rate < 1 ? weakest : 'ok';
}
