import type { ReactNode } from 'react';
import { GameNavigation } from '../components/GameNavigation';
export function MainLayout({ world, children }: { world: ReactNode; children: ReactNode }) {
  return <><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:p-3">Pular para o conteúdo</a><main id="main" tabIndex={-1} className="application-content min-h-screen bg-cream"><div className="world-row"><GameNavigation/>{world}</div>{children}</main></>;
}
