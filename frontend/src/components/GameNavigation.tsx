import { NavigationItem } from './NavigationItem';
import type { AppPage } from '../types/navigation';
export function GameNavigation({ hidden = false, page, onNavigate }: { hidden?: boolean; page: AppPage; onNavigate: (page: AppPage) => void }) {
  return <nav id="game-navigation" hidden={hidden} className="game-navigation" aria-label="Navegação principal"><ul className="game-nav-list">
    <NavigationItem label="Casa" icon="home" selected={page === 'home'} onSelect={()=>onNavigate('home')}/>
    <NavigationItem label="Metas" icon="target" selected={page === 'goals'} onSelect={()=>onNavigate('goals')}/>
    <NavigationItem label="Missões" icon="mission"/>
    <NavigationItem label="Diário" icon="book"/>
    <NavigationItem label="Evolução" icon="growth"/>
    <NavigationItem label="Configurações" icon="settings"/>
  </ul></nav>;
}
