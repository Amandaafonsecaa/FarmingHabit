import { useEffect, type CSSProperties } from 'react';
import { PixelIcon } from '../PixelIcon';

export interface Burst { id: number; kind: 'small' | 'big'; label: string }
const COLORS = ['#72ad32', '#f2c453', '#c0e36b', '#e8ac59'];

/** Partículas pixeladas + moedas subindo + plaquinha de texto. Some sozinha depois da animação. */
export function HarvestBurst({ burst, onDone }: { burst: Burst; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1200);
    return () => window.clearTimeout(timer);
  }, [burst.id, onDone]);

  const count = burst.kind === 'big' ? 14 : 7;
  const particles = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + (index % 2) * 0.35;
    const distance = 30 + (index % 3) * 14;
    return {
      coin: burst.kind === 'big' ? index % 3 === 0 : index % 4 === 0,
      style: {
        '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
        '--dy': `${Math.round(Math.sin(angle) * distance - 18)}px`,
        '--delay': `${(index % 4) * 40}ms`,
        background: COLORS[index % COLORS.length],
      } as CSSProperties,
    };
  });

  return <div className="harvest-burst" aria-hidden="true">
    {particles.map((particle, index) => particle.coin
      ? <span key={index} className="burst-coin" style={{ ...particle.style, background: 'none' }}><PixelIcon name="coin" className="size-full"/></span>
      : <span key={index} className="burst-pixel" style={particle.style}/>)}
    <span className={`burst-label is-${burst.kind}`}>{burst.label}</span>
  </div>;
}
