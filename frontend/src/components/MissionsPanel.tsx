import type { Mission } from '../types/world';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';

/** Recompensa da missão no estilo "cartaz de recompensa": baúzinho, moedas douradas e XP */
function Bounty({ coins, xp }: { coins: number; xp: number }) {
  return <span className="bounty" aria-label={`Recompensa: ${coins} moedas e ${xp} XP`}>
    <span className="bounty-chest" aria-hidden="true"/>
    <span className="bounty-coins"><PixelIcon name="coin" className="size-3"/>+{coins}</span>
    <span className="bounty-xp">✦ {xp} XP</span>
  </span>;
}

/** Missões da Casa: mesmo formato das metas (até 3, as em jornada primeiro), com a recompensa em destaque */
export function MissionsPanel({ missions, accepted, loading, error, pendingId, onComplete, onOpen }: {
  missions: Mission[]; accepted: string[]; loading: boolean; error: string; pendingId: string | null;
  onComplete: (id: string, element: Element) => void; onOpen: () => void;
}) {
  const open = missions.filter(mission => !mission.completed)
    .sort((a, b) => Number(accepted.includes(b.id)) - Number(accepted.includes(a.id)));
  const shown = open.slice(0, 3);
  return <GamePanel id="missions" title="Missões" icon="mission" onOpen={onOpen}>
    {loading && <p className="panel-empty">Desenrolando os pergaminhos…</p>}
    {error && <p role="alert" className="text-sm font-bold text-[#8c3027]">{error}</p>}
    {!loading && !error && open.length === 0 && <p className="panel-empty">Nenhuma missão no quadro. Viu algo curioso? Toque na semente <strong>+</strong>.</p>}
    <ul className="panel-list home-goal-list">{shown.map(mission => {
      const traveling = accepted.includes(mission.id);
      return <li key={mission.id} className={`goal-row home-goal-row ${traveling ? 'is-traveling' : ''}`}><div className="flex items-start gap-2.5">
        <span className="item-icon"><PixelIcon name={traveling ? 'target' : 'mission'}/></span>
        <div className="min-w-0 flex-1">
          <h3 className="item-title">{mission.title}</h3>
          {traveling && <p className="traveling-tag"><span className="footsteps" aria-hidden="true"><span/><span/><span/></span>Em jornada</p>}
          {mission.description && <p className="item-description">{mission.description}</p>}
        </div>
        <button type="button" className="pixel-button mt-1 shrink-0" disabled={pendingId === mission.id} onClick={event=>onComplete(mission.id, event.currentTarget)} aria-label={`Cumprir: ${mission.title}`}>Cumprir</button>
      </div>
      {/* Recompensa numa 2ª linha, começando na borda esquerda do ícone */}
      <div className="mission-reward-row"><Bounty coins={mission.coins} xp={mission.xp}/></div></li>;
    })}</ul>
  </GamePanel>;
}
