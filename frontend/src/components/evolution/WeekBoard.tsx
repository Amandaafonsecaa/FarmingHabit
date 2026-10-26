import type { CSSProperties } from 'react';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, addDays, amountOn, dailyTarget, isDoneOn, isScheduled, startOfWeek, toKey, weekChecks, weekTarget } from '../../lib/goalLogic';
import { goalColor } from '../../lib/goalColors';
import { PixelIcon } from '../PixelIcon';

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

type Cell = 'done' | 'partial' | 'missed' | 'today' | 'open' | 'rest' | 'future';
const CELL_LABEL: Record<Cell, string> = {
  done: 'feita', partial: 'começada', missed: 'não feita', today: 'falta hoje', open: 'livre', rest: 'sem cobrança', future: 'ainda não chegou',
};

/** Estado de uma meta num dia da semana */
function cellFor(goal: TrackedGoal, log: GoalLog, day: Date, todayKey: string): Cell {
  const key = toKey(day);
  if (key < goal.createdOn) return 'rest';
  if (isDoneOn(goal, log, day)) return 'done';
  if (key > todayKey) return isScheduled(goal, day) && goal.frequency.kind !== 'weekly' ? 'future' : 'rest';
  if (amountOn(goal, log, key) > 0) return 'partial';
  // Semanais podem ser feitas em qualquer dia: dia sem check não é falta
  if (goal.frequency.kind === 'weekly') return 'open';
  if (!isScheduled(goal, day)) return 'rest';
  return key === todayKey ? 'today' : 'missed';
}

/** A semana de relance: cada meta numa linha e uma bolinha da cor dela em cada dia em que foi feita */
export function WeekBoard({ goals, log, today }: { goals: TrackedGoal[]; log: GoalLog; today: Date }) {
  const monday = startOfWeek(today);
  const todayKey = toKey(today);
  const days = WEEK_ORDER.map((_, index) => addDays(monday, index));
  const done = goals.reduce((sum, goal) => sum + weekChecks(goal, log, today), 0);
  const target = goals.reduce((sum, goal) => sum + weekTarget(goal), 0);

  return <section className="world-panel pixel-frame week-board" aria-labelledby="week-heading">
    <header className="panel-heading"><h2 id="week-heading"><PixelIcon name="sun" className="size-5"/>Sua semana</h2>
      <span className="panel-tag">{shortDate.format(days[0])} a {shortDate.format(days[6])} · {done}/{target}</span></header>
    <div className="week-board-body">
      {goals.length === 0 ? <p className="panel-empty">Nenhuma meta ainda. Plante uma nas Metas para ver a semana aqui.</p> : <table className="week-table">
        <thead><tr><th scope="col"><span className="sr-only">Meta</span></th>
          {days.map(day => <th key={toKey(day)} scope="col" className={toKey(day) === todayKey ? 'is-today' : ''}>{WEEKDAY_NAMES[day.getDay()][0]}</th>)}
          <th scope="col" className="week-total-head"><span className="sr-only">Feitas na semana</span></th></tr></thead>
        <tbody>{goals.map(goal => {
          const [color, light] = goalColor(goal);
          const count = weekChecks(goal, log, today), goalTarget = weekTarget(goal);
          return <tr key={goal.id} style={{ '--goal': color, '--goal-light': light } as CSSProperties}>
            <th scope="row"><span className="week-goal"><span className="week-swatch" aria-hidden="true"/>{goal.title}</span></th>
            {days.map(day => {
              const cell = cellFor(goal, log, day, todayKey);
              return <td key={toKey(day)} className={toKey(day) === todayKey ? 'is-today' : ''}>
                <span className={`week-dot is-${cell}`} title={`${WEEKDAY_NAMES[day.getDay()]}: ${CELL_LABEL[cell]}`} aria-label={`${goal.title}, ${WEEKDAY_NAMES[day.getDay()]}: ${CELL_LABEL[cell]}${cell === 'partial' ? ` (${amountOn(goal, log, toKey(day))}/${dailyTarget(goal)})` : ''}`}/>
              </td>;
            })}
            <td className={`week-total ${count >= goalTarget ? 'is-complete' : ''}`}>{count}<small>/{goalTarget}</small></td>
          </tr>;
        })}</tbody>
      </table>}
      {goals.length > 0 && <ul className="week-legend" aria-hidden="true">
        <li><span className="week-dot is-done" style={{ '--goal': '#72ad32' } as CSSProperties}/>feita</li>
        <li><span className="week-dot is-partial" style={{ '--goal': '#72ad32', '--goal-light': '#c0e36b' } as CSSProperties}/>começada</li>
        <li><span className="week-dot is-missed"/>não feita</li>
        <li><span className="week-dot is-rest"/>sem cobrança</li>
      </ul>}
    </div>
  </section>;
}
