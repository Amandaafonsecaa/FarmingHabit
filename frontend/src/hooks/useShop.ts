import { useEffect, useState } from 'react';
import type { Reward } from '../types/world';
import { claimReward, createReward, hideReward, updateReward, deleteReward, listRewards, listPurchases, setPurchaseUsed, loadPlayer, type Player } from '../services/api';
import { WISH_KEY, readWishes, type Purchase } from '../lib/shop';
import { PLAYER_EVENT } from '../lib/harvestRewards';

/** Vitrine, saldo e compras no backend; somente os itens desejados ficam no navegador. */
export function useShop() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [wishIds, setWishIds] = useState<string[]>(readWishes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      const [list, history] = await Promise.all([listRewards(), listPurchases()]);
      if (!active) return;
      setPlayer(user); setRewards(list); setPurchases(history);
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

  useEffect(() => { try { if (wishIds.length) localStorage.setItem(WISH_KEY, JSON.stringify(wishIds)); else localStorage.removeItem(WISH_KEY); } catch { /* ignora */ } }, [wishIds]);

  const toggleWish = (id: string) => setWishIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const dropWish = (id: string) => setWishIds(current => current.filter(value => value !== id));

  async function buy(reward: Reward) {
    if (!player) throw new Error('Servidor indisponível.');
    if (player.coins < reward.price) throw new Error('Moedas insuficientes.');
    const { remainingCoins, purchase } = await claimReward(reward.id);
    const updatedPlayer = { ...player, coins: remainingCoins };
    setPlayer(updatedPlayer);
    window.dispatchEvent(new CustomEvent<Player>(PLAYER_EVENT, { detail: updatedPlayer }));
    setPurchases(current => [purchase, ...current]);
    dropWish(reward.id);
    return purchase;
  }

  async function create(title: string, price: number) {
    if (!player) throw new Error('Servidor indisponível.');
    const created = await createReward(title, price);
    setRewards(current => [created, ...current]);
  }

  async function hide(id: string) {
    if (!player) throw new Error('Servidor indisponível.');
    await hideReward(id);
    setRewards(current => current.filter(reward => reward.id !== id));
    dropWish(id);
  }

  async function edit(id: string, changes: { title: string; description: string; price: number }) {
    if (!player) throw new Error('Servidor indisponível.');
    const updated = await updateReward(id, changes);
    setRewards(current => current.map(reward => reward.id === id ? updated : reward));
  }
  async function remove(id: string) {
    if (!player) throw new Error('Servidor indisponível.');
    await deleteReward(id);
    setRewards(current => current.filter(reward => reward.id !== id));
    dropWish(id);
  }

  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  async function toggleUsed(id: string) {
    const item = purchases.find(purchase => purchase.id === id);
    if (!player || !item || updatingIds.includes(id)) return;
    setUpdatingIds(current => [...current, id]);
    try {
      const updated = await setPurchaseUsed(id, !item.used);
      setPurchases(current => current.map(purchase => purchase.id === id ? updated : purchase));
    } finally { setUpdatingIds(current => current.filter(value => value !== id)); }
  }

  return { player, rewards, purchases, wishIds, toggleWish, loading, error, updatingIds, edit, remove, buy, create, hide, toggleUsed };
}
