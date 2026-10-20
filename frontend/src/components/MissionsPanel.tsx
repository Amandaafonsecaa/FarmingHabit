import type { Mission } from '../types/world';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
export function MissionsPanel({ missions, onToggle, onAdd }: { missions: Mission[]; onToggle: (id: string) => void; onAdd: () => void }) {
  return <GamePanel id="missions" title="Missões" icon="mission" badge={`${missions.filter(item=>item.completed).length}/${missions.length} concluídas`} action="Adicionar missão" onAdd={onAdd}>
    <ul className="panel-list">{missions.map(mission=><li key={mission.id} className={`mission-row ${mission.completed ? 'is-complete' : ''}`}><div className="flex items-start gap-2.5"><span className="item-icon"><PixelIcon name="mission"/></span><div className="min-w-0 flex-1"><h3 className="item-title">{mission.title}</h3><p className="item-description">{mission.description}</p><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"><strong className="xp-label">+{mission.xp} XP</strong><span className="flex items-center gap-1 text-sm font-bold"><PixelIcon name="coin" className="size-3"/>+{mission.coins} moedas</span></div></div><button type="button" className="pixel-button mt-1 shrink-0 aria-pressed:border-olive aria-pressed:bg-[#d3dda0] aria-pressed:text-olive" aria-pressed={mission.completed} onClick={()=>onToggle(mission.id)} aria-label={`Concluído — missão: ${mission.title}`}>Concluído</button></div></li>)}</ul>
  </GamePanel>;
}
