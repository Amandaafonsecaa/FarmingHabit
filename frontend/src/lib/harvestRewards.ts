import type { CheckinResult } from '../services/api';
import { flyCoins } from './coinFlight';
import { toast } from './toast';

/**
 * Quanto as metas pagam, só para os textos da tela (dicas da vendinha, Configurações, plaquinha do card).
 * Quem decide e paga é o servidor, no próprio check-in (módulo goals do backend); mude lá e aqui juntos.
 */
export const HARVEST_REWARD = { coins: 5, xp: 5 };
export const WEEK_BONUS = { coins: 15, xp: 10 };
export const PLAYER_EVENT = 'farminghabit:player';

export const rewardLabel = (result: CheckinResult) => `+${result.coins} moedas e +${result.xp} XP${result.weekBonus ? ' (com bônus da semana!)' : ''}`;

/** Fecha um check-in na tela: moedinhas voando e toast quando pagou, aviso quando ficou esperando a internet */
export function settleCheckin(title: string, pending: Promise<CheckinResult | null>, origin?: Element) {
  pending
    .then(result => {
      if (!result) { toast(`${title}: sem conexão. A marcação sobe quando a internet voltar.`); return; }
      if (!result.coins && !result.xp) return;
      flyCoins(origin, result.coins);
      toast(`${title}: colhida! ${rewardLabel(result)}`);
    })
    .catch(error => toast(`${title}: ${error instanceof Error ? error.message : 'não foi possível falar com o servidor.'}`));
}
