import type { ReactNode } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';
export function GamePanel({ id, title, icon, badge, action, onAdd, children }: {
  id: string; title: string; icon: PixelIconName; badge?: string; action: string; onAdd: () => void; children: ReactNode;
}) {
  return <section className="world-panel pixel-frame" aria-labelledby={`${id}-heading`}>
    <header className="panel-heading"><h2 id={`${id}-heading`}><PixelIcon name={icon} className="size-5"/>{title}</h2>{badge && <span className="panel-tag">{badge}</span>}</header>
    <div className="panel-content">{children}</div>
    <footer className="panel-footer"><button type="button" className="pixel-button add-button" onClick={onAdd}><PixelIcon name="plus" className="size-2.5"/>{action}</button></footer>
  </section>;
}
