import { useCallback, type CSSProperties } from 'react';
import type { Mission } from '../../types/world';
import { rankOf } from '../../hooks/useMissionBoard';
import { PixelIcon } from '../PixelIcon';
import { HarvestBurst } from '../goals/HarvestBurst';

const TILTS = [-1.6, 1.2, -0.8, 1.8];

interface QuestScrollProps {
  mission: Mission; index: number; completed: boolean; active: boolean; pending: boolean; celebrating: boolean; highlighted: boolean;
  onAccept: () => void; onAbandon: () => void; onComplete: (origin: Element) => void; onRemove: () => void;
}

/** Pergaminho preso no quadro com tachinha: patente, recompensa e o caminho Partir → Cumprir; cumprido, fica com o carimbo */
export function QuestScroll({ mission, index, completed, active, pending, celebrating, highlighted, onAccept, onAbandon, onComplete, onRemove }: QuestScrollProps) {
  const rank = rankOf(mission);
  const noop = useCallback(() => {}, []);
  return <li id={`quest-${mission.id}`} className={`quest-scroll ${active && !completed ? 'is-active' : ''} ${celebrating ? 'is-done' : ''} ${completed ? 'is-completed' : ''} ${highlighted ? 'is-highlighted' : ''}`}
    style={{ '--tilt': `${TILTS[index % TILTS.length]}deg`, animationDelay: `${index * 70}ms` } as CSSProperties}>
    <span className="quest-pin" aria-hidden="true"/>
    <div className="quest-paper">
      <p className="quest-rank"><span aria-hidden="true">{'★'.repeat(rank.stars)}{'☆'.repeat(3 - rank.stars)}</span>{rank.name}</p>
      <h3 className="quest-title">{mission.title}</h3>
      {mission.description && <p className="quest-description">{mission.description}</p>}
      <div className="quest-rewards">
        <span className="quest-xp">+{mission.xp} XP</span>
        <span className="quest-coins"><PixelIcon name="coin" className="size-3"/>+{mission.coins}</span>
      </div>
      {active && !celebrating && !completed && <p className="quest-progress"><span className="footsteps" aria-hidden="true"><span/><span/><span/></span>Em jornada</p>}
      {completed && <div className="quest-actions">
        <button type="button" className="plot-remove" disabled={pending} onClick={onRemove} aria-label={`Rasgar a missão ${mission.title}`}><PixelIcon name="close" className="size-2.5"/></button>
      </div>}
      {!celebrating && !completed && <div className="quest-actions">
        {active
          ? <><button type="button" className="pixel-button primary-button" disabled={pending} onClick={event=>onComplete(event.currentTarget)}><PixelIcon name="check" className="size-3"/>Missão cumprida!</button>
              <button type="button" className="pixel-button" disabled={pending} onClick={onAbandon}>Voltar depois</button></>
          : <button type="button" className="pixel-button quest-go" disabled={pending} onClick={onAccept}><PixelIcon name="target" className="size-3"/>Partir em aventura</button>}
        <button type="button" className="plot-remove" disabled={pending} onClick={onRemove} aria-label={`Rasgar a missão ${mission.title}`}><PixelIcon name="close" className="size-2.5"/></button>
      </div>}
    </div>
    {(celebrating || completed) && <span className="quest-stamp" aria-hidden="true">CUMPRIDA!</span>}
    {celebrating && <HarvestBurst burst={{ id: 1, kind: 'big', label: `+${mission.xp} XP · +${mission.coins} moedas` }} onDone={noop}/>}
  </li>;
}
