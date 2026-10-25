import type { GoalLog, TrackedGoal } from '../types/goals';
import { amountOn, dailyTarget, startOfWeek, toKey, weekChecks } from './goalLogic';
import { grantRewards, loadPlayer, type Player } from '../services/api';

/** Metas pagam pouco e sempre; missões pagam bem (ver presets do MissionDialog) */
export const HARVEST_REWARD = { coins: 5, xp: 5 };
export const WEEK_BONUS = { coins: 15, xp: 10 };
export const PLAYER_EVENT = 'farminghabit:player';

const KEY = 'farminghabit.harvest-rewards.v1';
const readClaims = (): string[] => { try { const list = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(list) ? list : []; } catch { return []; } };
const writeClaims = (list: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-2000))); } catch { /* ignora */ } };

export interface HarvestReward { coins: number; xp: number; weekBonus: boolean; claims: string[] }

/**
 * Decide se a nova quantidade de hoje rende recompensa: só na primeira vez que a meta fica cumprida no dia
 * (e um bônus na primeira vez que a semana de uma meta semanal é batida). Já marca como pago.
 */
export function claimHarvest(goal: TrackedGoal, log: GoalLog, today: Date, nextAmount: number): HarvestReward | null {
  const todayKey = toKey(today);
  const target = dailyTarget(goal);
  if (amountOn(goal, log, todayKey) >= target || nextAmount < target) return null;
  const claims = readClaims();
  const dayClaim = `${todayKey}:${goal.id}`;
  if (claims.includes(dayClaim)) return null;
  const reward: HarvestReward = { ...HARVEST_REWARD, weekBonus: false, claims: [dayClaim] };
  if (goal.frequency.kind === 'weekly') {
    const nextLog = { ...log, [todayKey]: { ...log[todayKey], [goal.id]: nextAmount } };
    const weekClaim = `${toKey(startOfWeek(today))}:${goal.id}:semana`;
    if (weekChecks(goal, nextLog, today) >= goal.frequency.timesPerWeek && !claims.includes(weekClaim)) {
      reward.coins += WEEK_BONUS.coins; reward.xp += WEEK_BONUS.xp; reward.weekBonus = true; reward.claims.push(weekClaim);
    }
  }
  writeClaims([...claims, ...reward.claims]);
  return reward;
}

/** Se o crédito no servidor falhar, devolve o direito à recompensa para tentar de novo */
export const releaseHarvest = (reward: HarvestReward) => writeClaims(readClaims().filter(claim => !reward.claims.includes(claim)));

/** Credita no servidor e avisa as telas abertas (saldo da Loja, barra de XP da Casa) */
export async function creditPlayer(coins: number, xp: number): Promise<Player> {
  const player = await grantRewards(await loadPlayer(), coins, xp);
  window.dispatchEvent(new CustomEvent<Player>(PLAYER_EVENT, { detail: player }));
  return player;
}

export const rewardLabel = (reward: HarvestReward) => `+${reward.coins} moedas e +${reward.xp} XP${reward.weekBonus ? ' (com bônus da semana!)' : ''}`;
