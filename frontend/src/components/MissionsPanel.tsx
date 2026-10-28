import type { Mission } from '../types/world';
import { GamePanel } from './GamePanel';
import { PixelSpinner } from './PixelSpinner';
import { GuideWarrior } from './missions/GuideWarrior';
import { PixelIcon } from './PixelIcon';

/** Recompensa da missão no estilo "cartaz de recompensa": baúzinho, moedas douradas e XP */
function Bounty({ coins, xp }: { coins: number; xp: number }) {
  return <span className="bounty" aria-label={`Recompensa: ${coins} moedas e ${xp} XP`}>
    <span className="bounty-chest" aria-hidden="true"/>
    <span className="bounty-coins"><PixelIcon name="coin" className="size-3"/>+{coins}</span>
    <span className="bounty-xp">✦ {xp} XP</span>
  </span>;
}

/** Quadro vazio: o Capitão Bússola, guia das Missões, chama para ir atrás de algo para fazer */
function EmptyQuestBoard() {
  return <div className="panel-guide-empty">
    <div className="guide-speech">
      <p>Quadro vazio! Bora atrás de algo para fazer?</p>
      {/* Rabicho em degraus apontando para o capitão */}
      <svg className="guide-speech-tail" viewBox="0 0 7 4" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M0 0h1v1H0Zm6 0h1v1H6ZM1 1h1v1H1Zm4 0h1v1H5ZM2 2h1v1H2Zm2 0h1v1H4ZM3 3h1v1H3Z" fill="#3b2418"/>
        <path d="M1 0h5v1H1ZM2 1h3v1H2ZM3 2h1v1H3Z" fill="#fff1c7"/>
      </svg>
    </div>
    <span className="panel-guide-warrior"><GuideWarrior className="size-full"/></span>
  </div>;
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
    {loading && <PixelSpinner label="Carregando missões"/>}
    {error && <p role="alert" className="text-sm font-bold text-[#8c3027]">{error}</p>}
    {!loading && !error && open.length === 0 && <EmptyQuestBoard/>}
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
