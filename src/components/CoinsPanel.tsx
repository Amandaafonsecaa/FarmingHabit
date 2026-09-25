import type { Reward } from '../types/world';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
import { RewardCard } from './RewardCard';
export function CoinsPanel({ coins, rewards, purchasedIds, onBuy, onAdd }: { coins: number; rewards: Reward[]; purchasedIds: string[]; onBuy: (id: string) => void; onAdd: () => void }) {
  return <GamePanel id="coins" title="Coins" icon="coin" badge="Suas recompensas" action="Adicionar compra" onAdd={onAdd}>
    <div className="coin-balance"><PixelIcon name="coin" className="size-7 text-[#a86d1c]"/><div><p className="text-sm">Você tem</p><p className="font-display text-3xl font-bold leading-tight">{coins} <span className="text-sm font-normal">moedas</span></p></div></div>
    <ul className="reward-list">{rewards.map(reward=><RewardCard key={reward.id} reward={reward} balance={coins} purchased={purchasedIds.includes(reward.id)} onBuy={onBuy}/>)}</ul>
  </GamePanel>;
}
