import { PixelIcon, type PixelIconName } from './PixelIcon';
interface NavigationItemProps { label: string; icon: PixelIconName; selected?: boolean; onSelect?: () => void }
export function NavigationItem({ label, icon, selected = false, onSelect }: NavigationItemProps) {
  const content = <><span className="game-nav-icon"><PixelIcon name={icon} className="size-5"/></span><span className="game-nav-label">{label}</span></>;
  return <li>{selected
    ? <button type="button" className="game-nav-item is-selected" aria-current="page" onClick={()=>document.getElementById('main')?.focus()}>{content}</button>
    : onSelect
      ? <button type="button" className="game-nav-item" onClick={onSelect}>{content}</button>
      : <button type="button" className="game-nav-item" disabled title={`${label}: indisponível nesta versão`}>{content}</button>}
  </li>;
}
