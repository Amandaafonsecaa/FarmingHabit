import { useEffect, useRef } from 'react';
import { FLY_EVENT, LANDED_EVENT, type FlyDetail } from '../lib/coinFlight';
import { prefersCalm } from '../hooks/useRollingNumber';

const COIN_SVG = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" width="18" height="18"><path d="M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2Z" fill="#a86d1c"/><path d="M4 2h8v2h1v8h-1v2H4v-2H3V4h1Z" fill="#f2c453"/><path d="M7 4h2v8H7Z" fill="#a86d1c"/><path d="M5 4h1v3H5Z" fill="#fff6c2"/></svg>';

/** Camada fixa por cima de tudo: desenha as moedinhas em arco da origem até o contador */
export function CoinFlightLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onFly(event: Event) {
      const { x, y, amount } = (event as CustomEvent<FlyDetail>).detail;
      const target = Array.from(document.querySelectorAll<HTMLElement>('[data-coin-target]')).find(element => element.offsetParent !== null);
      const layer = layerRef.current;
      if (!target || !layer) return;
      const end = target.getBoundingClientRect();
      const ex = end.left + end.width / 2, ey = end.top + end.height / 2;
      const land = () => window.dispatchEvent(new Event(LANDED_EVENT));
      if (prefersCalm()) { land(); return; }
      const count = Math.max(3, Math.min(9, Math.round(amount / 4)));
      for (let index = 0; index < count; index++) {
        const coin = document.createElement('span');
        coin.className = 'flying-coin';
        coin.innerHTML = COIN_SVG;
        layer.appendChild(coin);
        const spread = (index - count / 2) * 10;
        const mx = (x + ex) / 2 + spread, my = Math.min(y, ey) - 90 - (index % 3) * 18;
        const animation = coin.animate([
          { transform: `translate(${x - 9}px, ${y - 9}px) scale(.4)`, opacity: 0 },
          { transform: `translate(${x - 9 + spread}px, ${y - 30}px) scale(1.1)`, opacity: 1, offset: .2 },
          { transform: `translate(${mx - 9}px, ${my}px) scale(1)`, opacity: 1, offset: .55 },
          { transform: `translate(${ex - 9}px, ${ey - 9}px) scale(.55)`, opacity: .9 },
        ], { duration: 900 + index * 60, delay: index * 55, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
        animation.onfinish = () => { coin.remove(); if (index === count - 1) land(); };
      }
    }
    window.addEventListener(FLY_EVENT, onFly);
    return () => window.removeEventListener(FLY_EVENT, onFly);
  }, []);
  return <div ref={layerRef} className="coin-flight-layer" aria-hidden="true"/>;
}
