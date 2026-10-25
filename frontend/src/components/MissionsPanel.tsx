import type { Mission } from '../types/world';
import { CHAPTERS, STOPS_PER_CHAPTER, journeyState } from '../lib/journey';
import { CHEST_STOPS } from '../lib/treasure';
import { GamePanel, SeeAll } from './GamePanel';
import { PixelIcon } from './PixelIcon';

/** Mini-mapa do capítulo atual: 5 paradas, baús e a exploradora (no meio do trecho se estiver em jornada) */
function MiniJourney({ completed, traveling }: { completed: number; traveling: boolean }) {
  const { chapter, reached, loop } = journeyState(completed);
  const position = Math.min(STOPS_PER_CHAPTER, reached + (traveling ? 0.5 : 0));
  return <div className="mini-journey">
    <p className="mini-journey-title">{CHAPTERS[chapter].name}{loop > 1 ? ` · jornada ${loop}` : ''}<span>{reached}/{STOPS_PER_CHAPTER}</span></p>
    <div className="mini-journey-track" aria-label={`Capítulo ${chapter + 1}: ${reached} de ${STOPS_PER_CHAPTER} paradas`}>
      <span className="mini-journey-path"><span style={{ width: `${(position / STOPS_PER_CHAPTER) * 100}%` }}/></span>
      {Array.from({ length: STOPS_PER_CHAPTER }, (_, index) => <span key={index} className={`mini-stop ${index < reached ? 'is-reached' : ''} ${CHEST_STOPS[index] ? 'has-chest' : ''}`} style={{ left: `${((index + 1) / STOPS_PER_CHAPTER) * 100}%` }}/>)}
      <span className={`mini-explorer ${traveling ? 'is-traveling' : ''}`} style={{ left: `${(position / STOPS_PER_CHAPTER) * 100}%` }}/>
    </div>
  </div>;
}

/** Missões da Casa: mini-mapa, a missão em jornada em destaque e as outras compactas */
export function MissionsPanel({ missions, accepted, loading, error, pendingId, onComplete, onOpen }: {
  missions: Mission[]; accepted: string[]; loading: boolean; error: string; pendingId: string | null;
  onComplete: (id: string, element: Element) => void; onOpen: () => void;
}) {
  const open = missions.filter(mission => !mission.completed);
  const active = open.find(mission => accepted.includes(mission.id));
  const others = open.filter(mission => mission !== active).slice(0, 3);
  const completed = missions.length - open.length;
  return <GamePanel id="missions" title="Missões" icon="mission" badge={`${open.length} em aberto`} badgeLabel={`${open.length} em aberto`} onOpen={onOpen}>
    <MiniJourney completed={completed} traveling={!!active}/>
    {loading && <p className="panel-empty">Desenrolando o mapa…</p>}
    {error && <p role="alert" className="text-sm font-bold text-[#8c3027]">{error}</p>}
    {active
      ? <article className="active-quest">
          <p className="active-quest-tag"><span className="footsteps" aria-hidden="true"><span/><span/><span/></span>Em jornada</p>
          <h3 className="item-title">{active.title}</h3>
          <p className="active-quest-reward"><strong>+{active.xp} XP</strong><span><PixelIcon name="coin" className="size-3"/>+{active.coins}</span></p>
          <button type="button" className="pixel-button primary-button" disabled={pendingId === active.id} onClick={event=>onComplete(active.id, event.currentTarget)}><PixelIcon name="check" className="size-3"/>Missão cumprida!</button>
        </article>
      : !loading && open.length > 0 && <p className="panel-empty">Nenhuma missão em jornada. <button type="button" className="inline-link" onClick={onOpen}>Escolher no quadro</button></p>}
    {!loading && !error && open.length === 0 && <p className="panel-empty">Nenhuma missão no quadro. Viu algo curioso? Toque na semente <strong>+</strong>.</p>}
    {others.length > 0 && <ul className="compact-quests">{others.map(mission => <li key={mission.id}>
      <span className="min-w-0 flex-1 truncate">{mission.title}</span>
      <span className="compact-reward"><PixelIcon name="coin" className="size-3"/>{mission.coins}</span>
      <button type="button" className="pixel-button compact-check" disabled={pendingId === mission.id} onClick={event=>onComplete(mission.id, event.currentTarget)} aria-label={`Concluir ${mission.title}`}><PixelIcon name="check" className="size-3"/></button>
    </li>)}</ul>}
    {open.length > 0 && <SeeAll label="Ver quadro de missões" onOpen={onOpen}/>}
  </GamePanel>;
}
