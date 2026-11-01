import { useState, type ReactNode } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';

/** Estado de um card que recolhe: aberto por padrão; a classe vai no <section> do card */
export function useCollapsible() {
  const [open, setOpen] = useState(true);
  return { open, toggle: () => setOpen(value => !value), collapsedClass: open ? '' : 'is-collapsed' };
}

/**
 * Topo de card que recolhe: a faixa inteira é clicável e, recolhido, sobra só o título.
 * Botões, abas e etiquetas passados em children continuam com a própria ação e somem enquanto recolhido.
 */
export function PanelHeading({ id, icon, title, open, onToggle, children }: {
  id: string; icon: PixelIconName; title: ReactNode; open: boolean; onToggle: () => void; children?: ReactNode;
}) {
  return <header className="panel-heading is-collapsible">
    <h2 id={id}><button type="button" className="panel-toggle" aria-expanded={open} onClick={onToggle}><PixelIcon name={icon} className="size-5"/>{title}</button></h2>
    {children}
  </header>;
}
