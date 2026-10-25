import type { Reward } from '../../types/world';
import { itemKindFor } from '../../lib/shop';
import { PixelIcon } from '../PixelIcon';
import { ItemIcon } from '../shop/ItemIcon';
import { GameDialog } from './GameDialog';

/** Confirmação de compra (mesma moldura dos outros modais): item, preço e quanto sobra no bolso */
export function ConfirmPurchaseDialog({ reward, coins, onConfirm, onClose }: { reward: Reward; coins: number; onConfirm: () => Promise<boolean>; onClose: () => void }) {
  return <GameDialog title="Levar este mimo?" icon="coin" intro="Confira antes de passar no caixa do armazém." submitLabel={`Comprar por ${reward.price} moedas`} error="" onSubmit={onConfirm} onClose={onClose}>
    <div className="purchase-preview">
      <span className="purchase-item"><ItemIcon kind={itemKindFor(reward.name)} className="size-full"/></span>
      <div className="min-w-0 flex-1">
        <p className="purchase-name">{reward.name}</p>
        {reward.description && <p className="purchase-description">{reward.description}</p>}
      </div>
    </div>
    <dl className="purchase-math">
      <div><dt>Você tem</dt><dd><PixelIcon name="coin" className="size-3"/>{coins}</dd></div>
      <div><dt>Preço</dt><dd className="is-cost">−{reward.price}</dd></div>
      <div className="is-total"><dt>Fica com</dt><dd><PixelIcon name="coin" className="size-3"/>{coins - reward.price}</dd></div>
    </dl>
  </GameDialog>;
}
