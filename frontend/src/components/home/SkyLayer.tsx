import type { CSSProperties } from 'react';
import type { DayPhase } from '../../lib/timeOfDay';

// Nuvens atravessam o céu em velocidades diferentes; o atraso negativo já as espalha ao carregar.
// `rest` é onde ficam paradas se o sistema pedir menos movimento.
const CLOUDS = [
  { top: '12%', rest: '22%', duration: 70, delay: -10, scale: 1 },
  { top: '24%', rest: '62%', duration: 95, delay: -55, scale: .75 },
  { top: '8%', rest: '80%', duration: 120, delay: -90, scale: 1.25 },
  { top: '31%', rest: '38%', duration: 85, delay: -30, scale: .6 },
];
const STARS = [[8, 10], [16, 24], [27, 8], [35, 30], [44, 14], [58, 9], [66, 26], [74, 12], [86, 20], [92, 8], [52, 32], [21, 36]];

/** Céu vivo: sol (ou lua e estrelas à noite), nuvens passando, passarinhos e o arco-íris do dia perfeito */
export function SkyLayer({ phase = 'day', rainbow = false }: { phase?: DayPhase; rainbow?: boolean }) {
  return <div className="sky-layer" aria-hidden="true">
    {phase === 'night'
      ? <><div className="world-moon"/><div className="sky-stars">{STARS.map(([left, top], index) => <span key={index} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${-index * 0.37}s` }}/>)}</div></>
      : <div className="world-sun is-shining"><span className="sun-rays"/></div>}
    {rainbow && <div className="sky-rainbow"/>}
    <div className="sky-clouds">{CLOUDS.map((cloud, index) => <div key={index} className="world-cloud is-passing"
      style={{ top: cloud.top, left: cloud.rest, '--cloud-duration': `${cloud.duration}s`, '--cloud-delay': `${cloud.delay}s`, '--cloud-scale': cloud.scale } as CSSProperties}/>)}</div>
    {phase !== 'night' && <div className="sky-birds"><span className="sky-bird"/><span className="sky-bird is-second"/><span className="sky-bird is-third"/></div>}
  </div>;
}
