import type { GoalLog, TrackedGoal } from '../types/goals';
import { amountOn, dailyTarget } from './goalLogic';
import { flushSync } from './cloudSync';
import { harvestGoal, type HarvestResult } from '../services/api';

/**
 * Quanto as metas pagam, só para os textos da tela (dicas da vendinha, Configurações, plaquinha do card).
 * Quem decide e paga é o servidor (módulo progress do backend); mude lá e aqui juntos.
 */
export const HARVEST_REWARD = { coins: 5, xp: 5 };
export const WEEK_BONUS = { coins: 15, xp: 10 };
export const PLAYER_EVENT = 'farminghabit:player';

const GOALS_KEY = 'farminghabit.goals.v1';

/** A nova quantidade cumpre o dia agora? Só então vale pedir a colheita */
export const reachesHarvest = (goal: TrackedGoal, log: GoalLog, day: string, nextAmount: number) =>
  amountOn(goal, log, day) < dailyTarget(goal) && nextAmount >= dailyTarget(goal);

/** Espera o registro do dia chegar ao localStorage (ele é gravado logo depois do render) */
async function waitForSavedAmount(goal: TrackedGoal, day: string) {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const saved = JSON.parse(localStorage.getItem(GOALS_KEY) ?? 'null');
      if ((saved?.log?.[day]?.[goal.id] ?? 0) >= dailyTarget(goal)) return;
    } catch { /* lê de novo */ }
    await new Promise(resolve => window.setTimeout(resolve, 50));
  }
}

/**
 * Pede a colheita ao servidor: garante que as metas já estão na conta (o servidor confere por elas),
 * recebe o que foi pago e avisa as telas abertas (saldo da Loja, barra de XP da Casa).
 */
export async function requestHarvest(goal: TrackedGoal, day: string): Promise<HarvestResult> {
  await waitForSavedAmount(goal, day);
  await flushSync(GOALS_KEY);
  const result = await harvestGoal(goal.id, day);
  if (result.coins || result.xp) window.dispatchEvent(new CustomEvent(PLAYER_EVENT, { detail: result.user }));
  return result;
}

export const rewardLabel = (result: HarvestResult) => `+${result.coins} moedas e +${result.xp} XP${result.weekBonus ? ' (com bônus da semana!)' : ''}`;
