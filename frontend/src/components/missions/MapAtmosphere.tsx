import type { CSSProperties } from 'react';

/** Corvo em pixel art, de perfil voando para a direita; as asas alternam entre dois quadros */
function Crow() {
  return <svg className="map-crow-art" viewBox="0 0 16 10" width="32" height="20" shapeRendering="crispEdges" aria-hidden="true">
    <g fill="#3b2418">
      <path d="M3 5h8v2H3Zm8-1h2v2h-2ZM1 5h2v1H1ZM0 4h1v1H0Z"/>
      <path className="crow-wing-up" d="M5 1h2v1h1v1h1v2H5Zm-1 1h1v2H4Z"/>
      <path className="crow-wing-down" d="M5 7h4v1H8v1H6v1H5Zm-1 0h1v1H4Z"/>
    </g>
    <path d="M13 5h2v1h-2Z" fill="#765337"/>
  </svg>;
}

// Voos espaçados: cada corvo cruza o céu em parte do ciclo e some no resto; no máximo dois no ar ao mesmo tempo
const CROWS: { top: string; duration: number; delay: number; scale: number }[] = [
  { top: '14%', duration: 28, delay: 4, scale: 1 },
  { top: '24%', duration: 41, delay: 17, scale: .8 },
];

/**
 * Atmosfera do mapa das Missões: névoa em faixas nas bordas de cima e dos lados (disfarça o chão vazio
 * fora do mapa) e corvos cruzando o céu de vez em quando. Fica por cima do mapa e não recebe cliques.
 */
export function MapAtmosphere() {
  return <div className="map-atmosphere" aria-hidden="true">
    <div className="map-fog"/>
    {CROWS.map((crow, i) => <div key={i} className="map-crow" style={{ top: crow.top, '--fly': `${crow.duration}s`, '--fly-delay': `${crow.delay}s`, '--crow-scale': crow.scale } as CSSProperties}>
      <div className="map-crow-bob"><Crow/></div>
    </div>)}
  </div>;
}
