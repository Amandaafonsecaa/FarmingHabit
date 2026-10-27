import { useNow } from './useNow';
import { phaseFor } from '../lib/timeOfDay';

/** Horário local, atualizado a cada minuto e ao voltar para a aba. */
export function useDayPhase() {
  return phaseFor(useNow());
}
