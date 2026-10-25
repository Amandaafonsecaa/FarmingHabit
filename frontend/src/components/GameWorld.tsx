import { WorldScenery } from './WorldScenery';
import { WorldInfo } from './WorldInfo';
import { SkyLayer } from './home/SkyLayer';
import { useSettings } from '../hooks/useSettings';
// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;

/** A fazenda da Casa: céu vivo, nível/XP e horta que cresce com o dia */
export function GameWorld({ player, today, goalsDone, goalsDue }: {
  player: { name: string; level: number; xp: number } | null; today: Date; goalsDone: number; goalsDue: number;
}) {
  const [{ farmName }] = useSettings();
  const dailyProgress = goalsDue ? goalsDone / goalsDue : 0;
  return <section className="game-world" aria-labelledby="world-heading">
    <SkyLayer/>
    <h1 id="world-heading" className="sr-only">{farmName}</h1>
    <header className="world-header"><WorldInfo level={player?.level ?? null} totalXp={player?.xp ?? null} xpPerLevel={XP_PER_LEVEL} farmName={farmName} today={today}/></header>
    <WorldScenery dailyProgress={dailyProgress} level={player?.level ?? 1}/>
  </section>;
}
