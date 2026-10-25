import { useEffect, useRef, useState } from 'react';
import type { Reward } from '../../types/world';
import { itemKindFor } from '../../lib/shop';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { ItemIcon } from './ItemIcon';

/** Número que rola até o valor novo (as moedas "descem" ao comprar) */
function useRollingNumber(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const calm = document.documentElement.classList.contains('calm-mode') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) { setShown(value); from.current = value; return; }
    const start = performance.now(), initial = from.current;
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / 700);
      setShown(Math.round(initial + (value - initial) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step); else from.current = value;
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return shown;
}

/** Cofrinho: saldo, porquinho que chacoalha ao gastar e o item que você está juntando moedas para comprar */
export function PiggyPanel({ coins, wish, shakeKey, onEarn }: { coins: number; wish: Reward | null; shakeKey: number; onEarn: () => void }) {
  const shown = useRollingNumber(coins);
  return <section className="world-panel pixel-frame piggy-panel" aria-labelledby="piggy-heading">
    <header className="panel-heading"><h2 id="piggy-heading"><PixelIcon name="coin" className="size-5"/>Cofrinho</h2></header>
    <div className="piggy-body">
      <div className="piggy-row">
        <svg key={shakeKey} className="piggy" viewBox="0 0 32 26" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M6 6h18v2h3v4h3v6h-3v3h-3v3h-3v-3H11v3H8v-3H6v-3H3v-8h3Z" fill="#f29ac0"/><path d="M8 8h6v2H8Z" fill="#f7c2d8"/><path d="M12 4h8v3h-8Z" fill="#3b2418"/><path d="M14 5h4v1h-4Z" fill="#f2c453"/>
          <path d="M22 11h2v2h-2Z" fill="#3b2418"/><path d="M27 13h3v3h-3Z" fill="#e8789f"/><path d="M5 6h3v3H5Z" fill="#e8789f"/>
        </svg>
        <div><p className="piggy-label">Você tem</p><p className="piggy-coins" aria-live="polite">{shown}<small> moedas</small></p></div>
      </div>
      {wish
        ? <div className="wish-box">
            <p className="piggy-label">♥ Juntando para</p>
            <div className="wish-item"><span className="wish-icon"><ItemIcon kind={itemKindFor(wish.name)} className="size-full"/></span><strong>{wish.name}</strong></div>
            <ProgressBar value={Math.min(100, coins / wish.price * 100)} label={`Progresso para ${wish.name}`} className="mt-2 h-3"/>
            <p className="wish-meta">{coins >= wish.price ? 'Já dá para comprar! 🎉' : `${coins}/${wish.price} · faltam ${wish.price - coins}`}</p>
          </div>
        : <p className="wish-empty">Toque no ♥ de um produto para juntar moedas para ele.</p>}
      <button type="button" className="pixel-button earn-button" onClick={onEarn}><PixelIcon name="mission" className="size-3"/>Ganhar moedas em missões</button>
    </div>
  </section>;
}
