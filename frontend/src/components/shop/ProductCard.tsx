import { useCallback, type CSSProperties } from 'react';
import type { Reward } from '../../types/world';
import { itemKindFor } from '../../lib/shop';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { HarvestBurst } from '../goals/HarvestBurst';
import { ItemIcon } from './ItemIcon';

interface ProductCardProps {
  reward: Reward; coins: number; index: number; wished: boolean; buying: boolean; pending: boolean;
  onBuy: () => void; onWish: () => void; onHide?: () => void;
}

/** Produto na prateleira: etiqueta de preço balançando, item no pedestal e animação de "vai pra sacolinha" ao comprar */
export function ProductCard({ reward, coins, index, wished, buying, pending, onBuy, onWish, onHide }: ProductCardProps) {
  const affordable = coins >= reward.price;
  const noop = useCallback(() => {}, []);
  return <li className={`product-card ${affordable ? 'is-affordable' : ''} ${buying ? 'is-buying' : ''}`} style={{ animationDelay: `${index * 60}ms` } as CSSProperties}>
    <div className="product-display">
      <span className="price-tag" style={{ animationDelay: `${-index * 0.4}s` }}><PixelIcon name="coin" className="size-3"/>{reward.price}</span>
      {reward.mock && <span className="product-badge">Exemplo</span>}
      <span className="product-item"><ItemIcon kind={itemKindFor(reward.name)} className="size-full"/></span>
      {affordable && <span className="product-sparkle" aria-hidden="true"/>}
      <span className="product-pedestal" aria-hidden="true"/>
      {buying && <><span className="paper-bag" aria-hidden="true"/><HarvestBurst burst={{ id: 1, kind: 'big', label: `-${reward.price} moedas` }} onDone={noop}/></>}
    </div>
    <div className="product-info">
      <h3 className="product-name">{reward.name}</h3>
      {affordable
        ? <p className="product-status is-ready">✓ Dá para levar!</p>
        : <><p className="product-status">Faltam {reward.price - coins} moedas</p><ProgressBar value={coins / reward.price * 100} label={`Moedas para ${reward.name}`} className="h-2"/></>}
      <div className="product-actions">
        <button type="button" className="pixel-button primary-button" disabled={!affordable || pending || buying} onClick={onBuy}>{buying ? 'Comprado!' : 'Comprar'}</button>
        <button type="button" className={`wish-button ${wished ? 'is-wished' : ''}`} aria-pressed={wished} onClick={onWish} aria-label={wished ? `Deixar de desejar ${reward.name}` : `Juntar moedas para ${reward.name}`} title="Juntar moedas para este">♥</button>
        {onHide && <button type="button" className="plot-remove" disabled={pending} onClick={onHide} aria-label={`Tirar ${reward.name} da vitrine`}><PixelIcon name="close" className="size-2.5"/></button>}
      </div>
    </div>
  </li>;
}
