import type { CSSProperties } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';
/** atBottom: item fixado no pé da gaveta (como Configurações nos apps de chat) */
interface NavigationItemProps { index: number; label: string; icon: PixelIconName; selected?: boolean; onSelect?: () => void; atBottom?: boolean }
export function NavigationItem({ index, label, icon, selected = false, onSelect, atBottom = false }: NavigationItemProps) {
  const content = <><span className="game-nav-icon"><PixelIcon name={icon} className="size-5"/>{selected && <span className="nav-sparkle" aria-hidden="true"/>}</span><span className="game-nav-label">{label}</span></>;
  // --i escalona a entrada dos itens quando a gaveta abre
  return <li className={atBottom ? 'nav-item-bottom' : undefined} style={{ '--i': index } as CSSProperties}>{selected
    ? <button type="button" className="game-nav-item is-selected" aria-current="page" onClick={()=>document.getElementById('main')?.focus()}>{content}</button>
    : onSelect
      ? <button type="button" className="game-nav-item" onClick={onSelect}>{content}</button>
      : <button type="button" className="game-nav-item is-locked" disabled title={`${label}: em breve`}>{content}</button>}
  </li>;
}
