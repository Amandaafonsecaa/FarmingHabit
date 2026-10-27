import type { GoalLog, TrackedGoal } from '../types/goals';
import { amountOn, dailyTarget, daysWithout, frequencyLabel, isHarvested, isQuitGoal, isScheduled, progressFor, toKey } from '../lib/goalLogic';
import { useFlipList } from '../hooks/useFlipList';
import { GamePanel } from './GamePanel';
import { PixelIcon } from './PixelIcon';
import { ProgressBar } from './ProgressBar';

/** Metas da Casa: todas as pendentes de hoje, com rolagem na lista */
export function GoalsPanel({ goals, log, today, onCheck, onOpen, onEdit }: { goals: TrackedGoal[]; log: GoalLog; today: Date; onCheck: (goal: TrackedGoal, element: Element) => void; onOpen: () => void; onEdit: (goal: TrackedGoal) => void }) {
  const pending = goals.filter(goal => isScheduled(goal, today) && !isHarvested(goal, log, today));
  const listRef = useFlipList<HTMLUListElement>(pending.map(goal => goal.id).join());
  return <GamePanel id="goals" title="Metas" icon="leaf" onOpen={onOpen}>
    {goals.length === 0 && <p className="panel-empty">Nenhuma meta plantada ainda. Toque na semente <strong>+</strong> para plantar.</p>}
    {goals.length > 0 && pending.length === 0 && <p className="panel-empty is-happy">🌻 Tudo colhido por hoje!</p>}
    <ul ref={listRef} className="panel-list home-goal-list">{pending.map(goal => {
      const progress = progressFor(goal, log, today);
      const quantity = goal.measure.kind === 'quantity' ? goal.measure : null;
      return <li key={goal.id} data-flip-id={goal.id} className="goal-row home-goal-row"><div className="flex items-start gap-2.5">
        <span className="item-icon"><PixelIcon name={goal.icon}/></span>
        <div className="min-w-0 flex-1">
          <h3 className="item-title"><button type="button" className="goal-edit-trigger" onClick={()=>onEdit(goal)} aria-haspopup="dialog" aria-label={`Editar meta: ${goal.title}`}>{goal.title}</button></h3>
          <p className="item-description">{isQuitGoal(goal) ? `${daysWithout(goal, today)} ${daysWithout(goal, today) === 1 ? 'dia sem' : 'dias sem'}` : frequencyLabel(goal)}{quantity && ` · ${amountOn(goal, log, toKey(today))}/${dailyTarget(goal)} ${quantity.unit}`}</p>
          <ProgressBar value={progress} label={`Progresso: ${goal.title}`} className="mt-2 h-2.5"/>
        </div>
        <button type="button" className="pixel-button mt-1 shrink-0" onClick={event=>onCheck(goal, event.currentTarget)} aria-label={`${quantity ? `Somar ${quantity.step} ${quantity.unit}` : isQuitGoal(goal) ? 'Evitei hoje' : 'Colher'}: ${goal.title}`}>{quantity ? `+${quantity.step}` : isQuitGoal(goal) ? 'Evitei' : 'Colher'}</button>
      </div></li>;
    })}</ul>
  </GamePanel>;
}
