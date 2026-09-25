import { WorldScenery } from './WorldScenery';
import { WorldInfo } from './WorldInfo';
import { farmName, player } from '../data/world';
export function GameWorld({ xp }: { xp: number }) {
  const level = player.level + Math.floor(xp / player.xpPerLevel);
  const levelXp = xp % player.xpPerLevel;
  return <section className="game-world" aria-labelledby="world-heading">
    <div className="world-sun" aria-hidden="true"/><div className="world-cloud left-[30%] top-[14%]" aria-hidden="true"/><div className="world-cloud right-[15%] top-[29%]" aria-hidden="true"/>
    <header className="world-header"><WorldInfo level={level} xp={levelXp} maxXp={player.xpPerLevel} farmName={farmName}/></header>
    <h1 id="world-heading" className="sr-only">Seu mundo</h1>
    <WorldScenery/>
  </section>;
}
