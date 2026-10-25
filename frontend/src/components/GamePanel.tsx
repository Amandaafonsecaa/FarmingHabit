import type { ReactNode } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';
export function GamePanel({ id, title, icon, badge, action, onAdd, onOpen, children }: {
  id: string; title: string; icon: PixelIconName; badge?: string; action: string; onAdd: () => void; onOpen?: () => void; children: ReactNode;
}) {
  return <section className="world-panel pixel-frame" aria-labelledby={`${id}-heading`}>
    {/* Com onOpen, o cabeçalho inteiro vira atalho para a aba (o botão se estica por cima dele) */}
    <header className={`panel-heading ${onOpen ? 'is-link' : ''}`}><h2 id={`${id}-heading`}>{onOpen
      ? <button type="button" className="panel-link" onClick={onOpen} aria-label={`Abrir ${title}${badge ? ` (${badge})` : ''}`}><PixelIcon name={icon} className="size-5"/>{title}</button>
      : <><PixelIcon name={icon} className="size-5"/>{title}</>}</h2>{badge && <span className="panel-tag">{badge}</span>}{onOpen && <span className="panel-arrow" aria-hidden="true">▶</span>}</header>
    <div className="panel-content">{children}</div>
    <footer className="panel-footer"><button type="button" className="pixel-button add-button" onClick={onAdd}><PixelIcon name="plus" className="size-2.5"/>{action}</button></footer>
  </section>;
}
