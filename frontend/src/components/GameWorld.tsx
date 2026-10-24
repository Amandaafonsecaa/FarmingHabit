import { WorldScenery } from './WorldScenery';
import { WorldInfo } from './WorldInfo';
import { SkyLayer } from './home/SkyLayer';
import { QuickActions, type QuickAction } from './home/QuickActions';
import { farmName } from '../data/world';
// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;

const greetingFor = (date: Date) => date.getHours() < 12 ? 'Bom dia' : date.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

/** A fazenda da Casa: céu vivo, placa de boas-vindas, nível/XP, horta que cresce com o dia e atalhos */
export function GameWorld({ player, today, goalsDone, goalsDue, onAction }: {
  player: { name: string; level: number; xp: number } | null; today: Date; goalsDone: number; goalsDue: number; onAction: (action: QuickAction) => void;
}) {
  const dailyProgress = goalsDue ? goalsDone / goalsDue : 0;
  return <section className="game-world" aria-labelledby="world-heading">
    <SkyLayer/>
    <div className="farm-welcome">
      <p>{greetingFor(today).toUpperCase()}</p>
      <h1 id="world-heading">Olá, {player?.name ?? 'fazendeira'}!</h1>
      <span>{goalsDue === 0 ? 'Nenhuma meta para hoje: dia de descanso.' : goalsDone === goalsDue ? 'Todas as metas de hoje colhidas! 🌻' : `Hoje: ${goalsDone} de ${goalsDue} metas colhidas`}</span>
    </div>
    <header className="world-header"><WorldInfo level={player?.level ?? null} totalXp={player?.xp ?? null} xpPerLevel={XP_PER_LEVEL} farmName={farmName} today={today}/></header>
    <WorldScenery dailyProgress={dailyProgress} level={player?.level ?? 1}/>
    <QuickActions onAction={onAction}/>
  </section>;
}
