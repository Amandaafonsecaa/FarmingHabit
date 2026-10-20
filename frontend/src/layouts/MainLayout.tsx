import { useState, type ReactNode } from 'react';
import { GameNavigation } from '../components/GameNavigation';
export function MainLayout({ world, children }: { world: ReactNode; children: ReactNode }) {
  const [navigationOpen, setNavigationOpen] = useState(true);
  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:p-3">Pular para o conteúdo</a>
    <main id="main" tabIndex={-1} className={`application-content min-h-screen bg-cream ${navigationOpen ? 'navigation-open' : 'navigation-closed'}`}>
      <div className="world-row">
        <button type="button" className="navigation-toggle pixel-button" aria-label={navigationOpen ? 'Esconder navegação' : 'Mostrar navegação'} aria-expanded={navigationOpen} aria-controls="game-navigation" onClick={()=>setNavigationOpen(open=>!open)}>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="24" height="24" fill="currentColor" shapeRendering="crispEdges"><path d="M2 3h16v3H2Zm0 6h16v3H2Zm0 6h16v3H2Z"/></svg>
        </button>
        <GameNavigation hidden={!navigationOpen}/>
        {world}
      </div>
      {children}
    </main>
  </>;
}
