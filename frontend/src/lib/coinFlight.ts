/**
 * Moedas voando: quem ganha moedas chama flyCoins(origem, quantidade); a camada de voo leva as moedinhas
 * até o elemento marcado com data-coin-target (o contador da tela) e avisa quando elas chegam.
 */
export const FLY_EVENT = 'farminghabit:fly-coins';
export const LANDED_EVENT = 'farminghabit:coins-landed';
export interface FlyDetail { x: number; y: number; amount: number }

export function flyCoins(from: Element | null | undefined, amount: number) {
  if (!from || amount <= 0) return;
  const rect = from.getBoundingClientRect();
  window.dispatchEvent(new CustomEvent<FlyDetail>(FLY_EVENT, { detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, amount } }));
}
