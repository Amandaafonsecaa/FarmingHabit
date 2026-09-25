import { NavigationItem } from './NavigationItem';
export function GameNavigation() {
  return <nav className="game-navigation" aria-label="Navegação principal"><ul className="game-nav-list">
    <NavigationItem label="Casa" icon="home" selected/>
    <NavigationItem label="Metas" icon="target"/>
    <NavigationItem label="Missões" icon="mission"/>
    <NavigationItem label="Diário" icon="book"/>
    <NavigationItem label="Evolução" icon="growth"/>
    <NavigationItem label="Configurações" icon="settings"/>
  </ul></nav>;
}
