import type { ReactNode } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';
export function GamePanel({ id, title, icon, badge, badgeLabel, onOpen, children }: {
  id: string; title: string; icon: PixelIconName; badge?: ReactNode; badgeLabel?: string; onOpen?: () => void; children: ReactNode;
}) {
  return <section className="world-panel pixel-frame" aria-labelledby={`${id}-heading`}>
    {/* Com onOpen, o cabeçalho inteiro vira atalho para a aba (o botão se estica por cima dele) */}
    <header className={`panel-heading ${onOpen ? 'is-link' : ''}`}><h2 id={`${id}-heading`}>{onOpen
      ? <button type="button" className="panel-link" onClick={onOpen} aria-label={`Abrir ${title}${badgeLabel ? ` (${badgeLabel})` : ''}`}><PixelIcon name={icon} className="size-5"/>{title}</button>
      : <><PixelIcon name={icon} className="size-5"/>{title}</>}</h2>{badge && <span className="panel-tag">{badge}</span>}{onOpen && <span className="panel-arrow" aria-hidden="true">▶</span>}</header>
    <div className="panel-content">{children}</div>
  </section>;
}

/** Link "ver todas" no fim dos painéis da Casa */
export function SeeAll({ label, onOpen }: { label: string; onOpen: () => void }) {
  return <button type="button" className="see-all" onClick={onOpen}>{label}<span aria-hidden="true">▶</span></button>;
}
