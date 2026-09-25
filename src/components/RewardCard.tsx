import type { Reward } from '../types/world';
import { PixelIcon } from './PixelIcon';
export function RewardCard({ reward, balance, purchased, onBuy }: { reward: Reward; balance: number; purchased: boolean; onBuy: (id: string) => void }) {
  const affordable = balance >= reward.price;
  return <li className="reward-row"><span className="item-icon reward-icon"><PixelIcon name={reward.icon} className="size-5"/></span><div className="min-w-0 flex-1"><h3 className="item-title">{reward.name}</h3><p className="mt-1 flex items-center gap-1 text-sm"><PixelIcon name="coin" className="size-3 text-[#996516]"/>{reward.price} moedas</p></div><button type="button" className="pixel-button buy-button" disabled={purchased || !affordable} aria-label={`${purchased ? 'Resgatado' : affordable ? 'Comprar' : 'Saldo insuficiente para'}: ${reward.name}`} onClick={()=>onBuy(reward.id)}>{purchased ? 'Resgatado' : affordable ? 'Comprar' : 'Sem saldo'}</button></li>;
}
