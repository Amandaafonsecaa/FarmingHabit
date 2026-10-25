import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GameNavigation } from '../components/GameNavigation';
import { CoinFlightLayer } from '../components/CoinFlightLayer';
import type { AppPage } from '../types/navigation';
export function MainLayout({ page, onNavigate, world, children }: { page: AppPage; onNavigate: (page: AppPage) => void; world: ReactNode; children: ReactNode }) {
  // A gaveta desliza por cima do cenário (não empurra a fazenda) e começa fechada para manter a imersão
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Fecha com Esc ou clicando fora da gaveta
  useEffect(() => {
    if (!navigationOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setNavigationOpen(false); toggleRef.current?.focus(); } };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!navigationRef.current?.contains(target) && !toggleRef.current?.contains(target)) setNavigationOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [navigationOpen]);

  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:p-3">Pular para o conteúdo</a>
    <main id="main" tabIndex={-1} className={`application-content min-h-screen bg-cream ${navigationOpen ? 'navigation-open' : 'navigation-closed'}`}>
      <div className="world-row">
        <button ref={toggleRef} type="button" className="navigation-toggle pixel-button" aria-label={navigationOpen ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={navigationOpen} aria-controls="game-navigation" onClick={()=>setNavigationOpen(open=>!open)}>
          <span className="toggle-bars" aria-hidden="true"><span/><span/><span/></span>
        </button>
        <GameNavigation navRef={navigationRef} open={navigationOpen} page={page} onNavigate={onNavigate}/>
        {world}
      </div>
      {children}
    </main>
    <CoinFlightLayer/>
  </>;
}
