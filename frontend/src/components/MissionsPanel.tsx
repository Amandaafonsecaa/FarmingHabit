import type { Mission } from '../types/world';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
export function MissionsPanel({ missions, loading, error, pendingId, onToggle, onDelete, onAdd, onOpen }: { missions: Mission[]; loading: boolean; error: string; pendingId: string | null; onToggle: (id: string) => void; onDelete: (id: string) => void; onAdd: () => void; onOpen: () => void }) {
  return <GamePanel id="missions" title="Missões" icon="mission" badge={`${missions.filter(item=>item.completed).length}/${missions.length} concluídas`} action="Adicionar missão" onAdd={onAdd} onOpen={onOpen}>
    {loading && <p className="item-description">Carregando missões...</p>}
    {error && <p role="alert" className="text-sm font-bold text-[#8c3027]">{error}</p>}
    {!loading && !error && missions.length === 0 && <p className="item-description">Nenhuma missão por aqui ainda.</p>}
    <ul className="panel-list">{missions.map(mission=><li key={mission.id} className={`mission-row ${mission.completed ? 'is-complete' : ''}`}><div className="flex items-start gap-2.5"><span className="item-icon"><PixelIcon name="mission"/></span><div className="min-w-0 flex-1"><h3 className="item-title">{mission.title}</h3><p className="item-description">{mission.description}</p><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"><strong className="xp-label">+{mission.xp} XP</strong><span className="flex items-center gap-1 text-sm font-bold"><PixelIcon name="coin" className="size-3"/>+{mission.coins} moedas</span></div></div><div className="mt-1 flex shrink-0 gap-1.5"><button type="button" className="pixel-button aria-pressed:border-olive aria-pressed:bg-[#d3dda0] aria-pressed:text-olive" aria-pressed={mission.completed} disabled={pendingId === mission.id} onClick={()=>onToggle(mission.id)} aria-label={`Concluído — missão: ${mission.title}`}>Concluído</button><button type="button" className="pixel-button" disabled={pendingId === mission.id} onClick={()=>onDelete(mission.id)} aria-label={`Apagar missão: ${mission.title}`}><PixelIcon name="close" className="size-3"/></button></div></div></li>)}</ul>
  </GamePanel>;
}
