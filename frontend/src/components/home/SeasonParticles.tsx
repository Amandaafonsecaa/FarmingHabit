import type { CSSProperties } from 'react';
import type { Season } from '../../lib/timeOfDay';

// Posição horizontal (%), atraso e duração de cada partícula
const FLAKES = Array.from({ length: 18 }, (_, index) => ({ left: (index * 37 + 11) % 100, delay: -((index * 1.7) % 12), duration: 9 + (index % 5) * 1.6 }));
const COLORS: Record<Exclude<Season, 'summer'>, string[]> = { spring: ['#f7a8c4', '#fff1f6', '#f29ac0'], autumn: ['#e8954a', '#bf5837', '#e7b84b'], winter: ['#ffffff', '#eef6ff'] };

/** Pétalas na primavera, folhas no outono, neve no inverno (no verão o céu fica limpo) */
export function SeasonParticles({ season }: { season: Season }) {
  if (season === 'summer') return null;
  return <div className={`season-particles is-${season}`} aria-hidden="true">
    {FLAKES.map((flake, index) => <span key={index} style={{ left: `${flake.left}%`, background: COLORS[season][index % COLORS[season].length], animationDelay: `${flake.delay}s`, animationDuration: `${flake.duration}s` } as CSSProperties}/>)}
  </div>;
}

/** Chuva de pétalas do dia perfeito (todas as metas de hoje colhidas) */
export function PetalRain() {
  return <div className="petal-rain" aria-hidden="true">
    {Array.from({ length: 40 }, (_, index) => <span key={index} style={{ left: `${(index * 23 + 7) % 100}%`, background: ['#f7a8c4', '#f2c453', '#fff1f6', '#ee6996', '#c0e36b'][index % 5], animationDelay: `${(index % 10) * 0.18}s`, animationDuration: `${2.6 + (index % 4) * 0.5}s` } as CSSProperties}/>)}
  </div>;
}
