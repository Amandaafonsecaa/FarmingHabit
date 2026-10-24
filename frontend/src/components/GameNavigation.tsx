import type { CSSProperties, Ref } from 'react';
import { NavigationItem } from './NavigationItem';
import type { AppPage } from '../types/navigation';

// Vaga-lumes: posição (% da gaveta), atraso e duração próprios para não piscarem juntos
const FIREFLIES = [[18, 30, 0, 6], [72, 22, -2, 7.5], [40, 55, -4, 6.5], [80, 64, -1, 8], [25, 78, -3, 7], [60, 42, -5, 9]];

/** Trepadeira pixelada que sobe pela borda direita da gaveta */
function NavVine() {
  const leaves = Array.from({ length: 11 }, (_, index) => index);
  return <svg className="nav-vine" viewBox="0 0 16 220" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
    <path d="M7 0h2v220H7Z" fill="#3f6b35"/><path d="M8 0h1v220H8Z" fill="#53922d"/>
    {leaves.map(index => { const y = 8 + index * 20; const right = index % 2 === 1; return <g key={index} className="vine-leaf-sway" style={{ animationDelay: `${-index * 0.35}s` }}>
      <path d={right ? `M9 ${y}h4v2h2v3h-2v1H9Z` : `M7 ${y}H3v2H1v3h2v1h4Z`} fill={index % 3 === 0 ? '#72ad32' : '#62ae32'}/>
      <path d={right ? `M10 ${y + 1}h2v1h-2Z` : `M4 ${y + 1}h2v1H4Z`} fill="#c0e36b"/>
      {index % 4 === 2 && <path className="vine-flower-blink" d={right ? `M12 ${y - 4}h3v3h-3Z` : `M1 ${y - 4}h3v3H1Z`} fill="#f2c453"/>}
    </g>; })}
  </svg>;
}

/** Gramado com flores e um cogumelo no pé da gaveta */
function NavGrass() {
  return <svg className="nav-grass" viewBox="0 0 124 48" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
    <path d="M0 34h124v14H0Z" fill="#5b3826"/><path d="M0 34h124v3H0Z" fill="#6a3f22"/><path d="M14 41h6v2h-6Zm40 3h8v2h-8Zm44-4h5v2h-5Z" fill="#7d4c2a"/>
    <g className="grass-blades">{Array.from({ length: 21 }, (_, index) => { const x = index * 6; const h = 6 + (index * 7) % 9; return <path key={index} d={`M${x} ${34 - h}h3v${h}h-3Z`} fill={index % 3 ? '#53922d' : '#72ad32'}/>; })}</g>
    <g className="nav-flower" style={{ animationDelay: '-1s' }}><path d="M22 20h2v14h-2Z" fill="#3f6b35"/><path d="M20 15h6v6h-6Z" fill="#ee6996"/><path d="M22 17h2v2h-2Z" fill="#fff2b0"/></g>
    <g className="nav-flower"><path d="M94 22h2v12h-2Z" fill="#3f6b35"/><path d="M92 17h6v6h-6Z" fill="#f2c453"/><path d="M94 19h2v2h-2Z" fill="#bf5837"/></g>
    <g><path d="M60 28h4v6h-4Z" fill="#f6e2b0"/><path d="M56 22h12v6H56Z" fill="#bf5837"/><path d="M58 22h8v2h-8Z" fill="#e8ac59"/><path d="M59 25h2v2h-2Zm4-1h2v2h-2Z" fill="#fff1c7"/></g>
  </svg>;
}

export function GameNavigation({ open, page, onNavigate, navRef }: { open: boolean; page: AppPage; onNavigate: (page: AppPage) => void; navRef?: Ref<HTMLElement> }) {
  return <nav ref={navRef} id="game-navigation" inert={!open} className="game-navigation" aria-label="Navegação principal">
    <span className="nav-nails" aria-hidden="true"/>
    {FIREFLIES.map(([left, top, delay, duration], index) => <span key={index} className="nav-firefly" aria-hidden="true" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s, ${delay / 2}s`, '--firefly-duration': `${duration}s` } as CSSProperties}/>)}
    <NavVine/>
    <ul className="game-nav-list">
      <NavigationItem index={0} label="Casa" icon="home" selected={page === 'home'} onSelect={()=>onNavigate('home')}/>
      <NavigationItem index={1} label="Metas" icon="target" selected={page === 'goals'} onSelect={()=>onNavigate('goals')}/>
      <NavigationItem index={2} label="Missões" icon="mission"/>
      <NavigationItem index={3} label="Diário" icon="book"/>
      <NavigationItem index={4} label="Evolução" icon="growth"/>
      <NavigationItem index={5} label="Configurações" icon="settings"/>
    </ul>
    <NavGrass/>
  </nav>;
}
