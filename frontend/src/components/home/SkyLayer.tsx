import type { CSSProperties } from 'react';

// Nuvens atravessam o céu em velocidades diferentes; o atraso negativo já as espalha ao carregar.
// `rest` é onde ficam paradas se o sistema pedir menos movimento.
const CLOUDS = [
  { top: '12%', rest: '22%', duration: 70, delay: -10, scale: 1 },
  { top: '24%', rest: '62%', duration: 95, delay: -55, scale: .75 },
  { top: '8%', rest: '80%', duration: 120, delay: -90, scale: 1.25 },
  { top: '31%', rest: '38%', duration: 85, delay: -30, scale: .6 },
];

/** Céu vivo: sol pulsando, nuvens passando e um bando de passarinhos de vez em quando */
export function SkyLayer() {
  return <div className="sky-layer" aria-hidden="true">
    <div className="world-sun is-shining"><span className="sun-rays"/></div>
    {CLOUDS.map((cloud, index) => <div key={index} className="world-cloud is-passing"
      style={{ top: cloud.top, left: cloud.rest, '--cloud-duration': `${cloud.duration}s`, '--cloud-delay': `${cloud.delay}s`, '--cloud-scale': cloud.scale } as CSSProperties}/>)}
    <div className="sky-birds"><span className="sky-bird"/><span className="sky-bird is-second"/><span className="sky-bird is-third"/></div>
  </div>;
}
