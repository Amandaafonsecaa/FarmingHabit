import type { GoalLog, TrackedGoal } from '../types/goals';
import { amountOn, dailyTarget, frequencyLabel, isHarvested, isScheduled, progressFor, sortByPending, toKey } from '../lib/goalLogic';
import { useFlipList } from '../hooks/useFlipList';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
import { ProgressBar } from './ProgressBar';

/** Versão compacta da aba Metas: mesmas metas e regras, pendentes em cima e colhidas embaixo */
export function GoalsPanel({ goals, log, today, onCheck, onAdd, onOpen }: { goals: TrackedGoal[]; log: GoalLog; today: Date; onCheck: (goal: TrackedGoal) => void; onAdd: () => void; onOpen: () => void }) {
  const ordered = sortByPending(goals, log, today);
  const listRef = useFlipList<HTMLUListElement>(ordered.map(goal => goal.id).join());
  const harvested = goals.filter(goal => isHarvested(goal, log, today)).length;
  return <GamePanel id="goals" title="Metas" icon="leaf" badge={`${harvested}/${goals.length} colhidas`} action="Adicionar meta" onAdd={onAdd} onOpen={onOpen}>
    {goals.length === 0 && <p className="item-description">Nenhuma meta plantada ainda.</p>}
    <ul ref={listRef} className="panel-list home-goal-list">{ordered.map(goal => {
      const progress = progressFor(goal, log, today);
      const done = isHarvested(goal, log, today);
      const scheduled = isScheduled(goal, today);
      const quantity = goal.measure.kind === 'quantity' ? goal.measure : null;
      return <li key={goal.id} data-flip-id={goal.id} className={`goal-row home-goal-row ${done ? 'is-harvested' : ''}`}><div className="flex items-start gap-2.5">
        <span className="item-icon"><PixelIcon name={goal.icon}/></span>
        <div className="min-w-0 flex-1">
          <h3 className="item-title">{goal.title}</h3>
          <p className="item-description">{frequencyLabel(goal)}{quantity && ` · ${amountOn(goal, log, toKey(today))}/${dailyTarget(goal)} ${quantity.unit}`}</p>
          <div className="mb-1 mt-2 flex justify-between text-sm"><span>Progresso</span><strong>{progress}%</strong></div>
          <ProgressBar value={progress} label={`Progresso: ${goal.title}`} className="h-2.5"/>
        </div>
        {quantity
          ? <button type="button" className="pixel-button mt-1 shrink-0" disabled={!scheduled} onClick={()=>onCheck(goal)} aria-label={`Somar ${quantity.step} ${quantity.unit} — meta: ${goal.title}`}>+{quantity.step}</button>
          : <button type="button" className="pixel-button mt-1 shrink-0 aria-pressed:border-olive aria-pressed:bg-[#d3dda0] aria-pressed:text-olive" aria-pressed={amountOn(goal, log, toKey(today)) >= 1} disabled={!scheduled} onClick={()=>onCheck(goal)} aria-label={`Concluído — meta: ${goal.title}`}>{scheduled ? 'Concluído' : 'Descanso'}</button>}
      </div></li>;
    })}</ul>
  </GamePanel>;
}
