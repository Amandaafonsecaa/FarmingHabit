import { useEffect, useState } from 'react';
import type { Reward } from '../types/world';
import { claimReward, createReward, hideReward, listRewards, loadPlayer, type Player } from '../services/api';
import { WISH_KEY, readPurchases, recordPurchase, writePurchases, type Purchase } from '../lib/shop';
import { PLAYER_EVENT } from '../lib/harvestRewards';

/** Vitrine (backend), saldo do jogador, baú de compras e item desejado (navegador) */
export function useShop() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>(readPurchases);
  const [wishId, setWishId] = useState<string | null>(() => { try { return localStorage.getItem(WISH_KEY); } catch { return null; } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      const list = await listRewards(user.id);
      if (!active) return;
      setPlayer(user); setRewards(list);
    })()
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível falar com o servidor.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onPlayer = (event: Event) => setPlayer((event as CustomEvent<Player>).detail);
    window.addEventListener(PLAYER_EVENT, onPlayer);
    return () => window.removeEventListener(PLAYER_EVENT, onPlayer);
  }, []);

  useEffect(() => { try { if (wishId) localStorage.setItem(WISH_KEY, wishId); else localStorage.removeItem(WISH_KEY); } catch { /* ignora */ } }, [wishId]);

  async function buy(reward: Reward) {
    if (!player) throw new Error('Servidor indisponível.');
    const { remainingCoins } = await claimReward(reward.id, player.id);
    setPlayer(current => current && { ...current, coins: remainingCoins });
    const purchase = recordPurchase(reward.id, reward.name, reward.price);
    setPurchases(readPurchases());
    if (wishId === reward.id) setWishId(null);
    return purchase;
  }

  async function create(title: string, price: number) {
    if (!player) throw new Error('Servidor indisponível.');
    const created = await createReward(player.id, title, price);
    setRewards(current => [created, ...current]);
  }

  async function hide(id: string) {
    await hideReward(id);
    setRewards(current => current.filter(reward => reward.id !== id));
    if (wishId === id) setWishId(null);
  }

  function toggleUsed(id: string) {
    const next = purchases.map(item => item.id === id ? { ...item, used: !item.used } : item);
    writePurchases(next);
    setPurchases(next);
  }

  return { player, rewards, purchases, wishId, setWishId, loading, error, buy, create, hide, toggleUsed };
}
