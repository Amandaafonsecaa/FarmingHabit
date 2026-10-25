import { useEffect, useState } from 'react';
import { loadPlayer, type Player } from '../services/api';
import { PLAYER_EVENT } from '../lib/harvestRewards';

/** Saldo do jogador para o contador de moedas das abas (atualiza quando metas pagam) */
export function usePlayerCoins() {
  const [coins, setCoins] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    loadPlayer().then(player => { if (active) setCoins(player.coins); }).catch(() => {});
    const onPlayer = (event: Event) => setCoins((event as CustomEvent<Player>).detail.coins);
    window.addEventListener(PLAYER_EVENT, onPlayer);
    return () => { active = false; window.removeEventListener(PLAYER_EVENT, onPlayer); };
  }, []);
  return coins;
}
