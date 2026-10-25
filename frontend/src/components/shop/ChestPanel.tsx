import type { Purchase } from '../../lib/shop';
import { fromKey } from '../../lib/goalLogic';
import { itemKindFor } from '../../lib/shop';
import { PixelIcon } from '../PixelIcon';
import { ItemIcon } from './ItemIcon';

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

/** Minhas compras: histórico do que foi comprado na loja, cada item pode ser marcado como aproveitado */
export function ChestPanel({ purchases, freshId, onToggle }: { purchases: Purchase[]; freshId: string | null; onToggle: (id: string) => void }) {
  const pending = purchases.filter(item => !item.used).length;
  return <section className="world-panel pixel-frame chest-panel" aria-labelledby="chest-heading">
    <header className="panel-heading"><h2 id="chest-heading"><PixelIcon name="coin" className="size-5"/>Minhas compras</h2><span className="panel-tag">{pending} para aproveitar</span></header>
    <div className="chest-body">
      <svg className="shopping-bag" viewBox="0 0 32 34" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M11 4h10v2h2v6h-2V6H11v6H9V6h2Z" fill="#8a5838"/><path d="M4 10h24v22H4Z" fill="#d9b47a"/><path d="M4 10h24v3H4Z" fill="#c49a62"/>
        <path d="M8 14h2v16H8Zm7 0h2v16h-2Zm7 0h2v16h-2Z" fill="#c9a46a"/><path d="M12 18h8v6h-8Z" fill="#bf5837"/><path d="M14 20h4v2h-4Z" fill="#fff1c7"/>
      </svg>
      {purchases.length === 0 ? <p className="chest-empty">Nenhuma compra ainda. Que tal um mimo da vitrine?</p>
        : <ol className="chest-list">{purchases.map(item => <li key={item.id} className={`chest-item ${item.used ? 'is-used' : ''} ${item.id === freshId ? 'is-fresh' : ''}`}>
            <span className="chest-icon"><ItemIcon kind={itemKindFor(item.title)} className="size-full"/></span>
            <div className="min-w-0 flex-1"><p className="chest-title">{item.title}</p><p className="chest-meta">{shortDate.format(fromKey(item.date))} · {item.price} moedas</p></div>
            <button type="button" className={`pixel-button enjoy-button ${item.used ? 'is-used' : ''}`} aria-pressed={item.used} onClick={()=>onToggle(item.id)}>{item.used ? '✓ Aproveitado' : 'Aproveitar'}</button>
          </li>)}</ol>}
    </div>
  </section>;
}
