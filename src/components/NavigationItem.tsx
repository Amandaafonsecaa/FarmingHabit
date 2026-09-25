import { PixelIcon, type PixelIconName } from './PixelIcon';
interface NavigationItemProps { label: string; icon: PixelIconName; selected?: boolean }
export function NavigationItem({ label, icon, selected = false }: NavigationItemProps) {
  const content = <><span className="game-nav-icon"><PixelIcon name={icon} className="size-5"/></span><span className="game-nav-label">{label}</span></>;
  return <li>{selected
    ? <a className="game-nav-item is-selected" href="#main" aria-current="page">{content}</a>
    : <button type="button" className="game-nav-item" disabled title={`${label}: indisponível nesta versão`}>{content}</button>}
  </li>;
}
