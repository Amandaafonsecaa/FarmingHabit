import type { Goal } from '../types/world';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
import { ProgressBar } from './ProgressBar';
export function GoalsPanel({ goals, onAdd, onToggle }: { goals: Goal[]; onAdd: () => void; onToggle: (id: string) => void }) {
  return <GamePanel id="goals" title="Metas" icon="leaf" badge={`${goals.length} em cultivo`} action="Adicionar meta" onAdd={onAdd}>
    <ul className="panel-list">{goals.map((goal, index)=><li key={goal.id} className="goal-row"><div className="flex items-start gap-2.5"><span className="item-icon"><PixelIcon name={index % 2 === 0 ? 'leaf' : 'book'}/></span><div className="min-w-0 flex-1"><h3 className="item-title">{goal.title}</h3><div className="mb-1 mt-2 flex justify-between text-sm"><span>Progresso</span><strong>{goal.completed ? 100 : goal.progress}%</strong></div><ProgressBar value={goal.completed ? 100 : goal.progress} label={`Progresso: ${goal.title}`} className="h-2.5"/></div><button type="button" className="pixel-button mt-1 shrink-0 aria-pressed:border-olive aria-pressed:bg-[#d3dda0] aria-pressed:text-olive" aria-pressed={goal.completed} onClick={()=>onToggle(goal.id)} aria-label={`Concluído — meta: ${goal.title}`}>Concluído</button></div></li>)}</ul>
  </GamePanel>;
}
