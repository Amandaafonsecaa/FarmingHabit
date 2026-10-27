import type { Reward } from '../types/world';
import { itemKindFor } from '../lib/shop';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
import { ItemIcon } from './shop/ItemIcon';

/** Vitrine da Casa: favoritos primeiro, depois personalizados, independentemente do saldo. */
export function CoinsPanel({ coins, rewards, wishIds, buyingId, onBuy, onOpen }: {
  coins: number; rewards: Reward[]; wishIds: string[]; buyingId: string | null; onBuy: (id: string) => void; onOpen: () => void;
}) {
  const favorites = new Set(wishIds);
  const priority = (reward: Reward) => favorites.has(reward.id) ? 0 : !reward.fixed ? 1 : 2;
  const showcase = [...rewards].sort((a, b) => priority(a) - priority(b)).slice(0, 3);
  return <GamePanel id="coins" title="Loja" icon="coin" onOpen={onOpen}>
    {showcase.length ? <ul className="home-shop-list">{showcase.map(reward => {
      const favorite = favorites.has(reward.id);
      const affordable = coins >= reward.price;
      return <li key={reward.id}>
        <span className="home-shop-icon"><ItemIcon kind={itemKindFor(reward.name)} className="size-full"/></span>
        <div className="min-w-0 flex-1">
          <p className="home-shop-name"><span className="truncate" title={reward.name}>{reward.name}</span>{favorite && <span className="home-shop-heart" role="img" aria-label="Favoritado" title="Favoritado">♥</span>}</p>
          {!affordable && <p className="home-shop-missing">Faltam {reward.price - coins} moedas</p>}
        </div>
        <button type="button" className="pixel-button buy-button" disabled={!affordable || buyingId !== null} aria-busy={buyingId === reward.id} aria-label={`Comprar ${reward.name} por ${reward.price} moedas`}
          onClick={()=>onBuy(reward.id)}>{buyingId === reward.id ? <span className="text-[10px]">Comprando…</span> : <><PixelIcon name="coin" className="size-3"/>{reward.price}</>}</button>
      </li>;
    })}</ul> : <p className="panel-empty">A vitrine está vazia. Crie uma recompensa na Loja.</p>}
  </GamePanel>;
}
