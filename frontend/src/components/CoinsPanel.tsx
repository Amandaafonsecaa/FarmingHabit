import type { Reward } from '../types/world';
import { itemKindFor } from '../lib/shop';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
import { ProgressBar } from './ProgressBar';
import { ItemIcon } from './shop/ItemIcon';

/** Loja da Casa: progresso do desejo ♥ (se houver) e os mimos que já cabem no bolso */
export function CoinsPanel({ coins, rewards, wishId, onBuy, onOpen }: {
  coins: number; rewards: Reward[]; wishId: string | null; onBuy: (id: string, element: Element) => void; onOpen: () => void;
}) {
  const wish = rewards.find(reward => reward.id === wishId) ?? null;
  const affordable = rewards.filter(reward => reward.price <= coins).sort((a, b) => b.price - a.price).slice(0, 3);
  const cheapest = [...rewards].sort((a, b) => a.price - b.price)[0];
  return <GamePanel id="coins" title="Loja" icon="coin" badge={`${coins} moedas`} badgeLabel={`${coins} moedas`} onOpen={onOpen}>
    {wish && <div className="home-wish"><span className="home-wish-icon"><ItemIcon kind={itemKindFor(wish.name)} className="size-full"/></span>
      <div className="min-w-0 flex-1"><p className="home-wish-label">♥ Juntando para</p><p className="item-title">{wish.name}</p>
        <ProgressBar value={Math.min(100, coins / wish.price * 100)} label={`Progresso para ${wish.name}`} className="mt-1 h-2.5"/>
        <p className="home-wish-meta">{coins >= wish.price ? 'Já dá para comprar! 🎉' : `${coins}/${wish.price}`}</p></div></div>}
    {affordable.length
      ? <ul className="home-shop-list">{affordable.map(reward => <li key={reward.id}>
          <span className="home-shop-icon"><ItemIcon kind={itemKindFor(reward.name)} className="size-full"/></span>
          <span className="min-w-0 flex-1 truncate">{reward.name}</span>
          <button type="button" className="pixel-button buy-button" onClick={event=>onBuy(reward.id, event.currentTarget)}><PixelIcon name="coin" className="size-3"/>{reward.price}</button>
        </li>)}</ul>
      : <p className="panel-empty">{cheapest ? `Faltam ${Math.max(0, cheapest.price - coins)} moedas para ${cheapest.name.toLowerCase()}.` : 'A vitrine está vazia.'}</p>}
  </GamePanel>;
}
