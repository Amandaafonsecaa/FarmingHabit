import type { GoalLog, TrackedGoal } from '../../types/goals';
import { addDays, progressFor, startOfWeek, streakFor, todayStats, weekProgressFor } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { PlantGrowth } from './PlantGrowth';

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/** Topo da aba: placa de madeira, quadros de resumo e um canteiro com uma muda por meta */
export function GoalsHero({ goals, log, today, onPlant }: { goals: TrackedGoal[]; log: GoalLog; today: Date; onPlant: () => void }) {
  const { due: dueToday, done: doneToday } = todayStats(goals, log, today);
  const weekPercent = goals.length ? Math.round(goals.reduce((sum, goal) => sum + weekProgressFor(goal, log, today), 0) / goals.length) : 0;
  const bestStreak = goals.reduce((best, goal) => Math.max(best, goal.frequency.kind === 'weekly' ? 0 : streakFor(goal, log, today)), 0);
  const monday = startOfWeek(today);

  return <section className="goals-hero" aria-labelledby="goals-title">
    <div className="world-cloud left-[38%] top-[18%]" aria-hidden="true"/><div className="world-cloud right-[12%] top-[34%]" aria-hidden="true"/>
    <div className="goals-hero-top">
      <div className="goals-sign pixel-frame">
        <p className="eyebrow">Semana de {shortDate.format(monday)} a {shortDate.format(addDays(monday, 6))}</p>
        <h1 id="goals-title">Canteiro de Metas</h1>
        <button type="button" className="pixel-button primary-button plant-button" onClick={onPlant}><PixelIcon name="plus" className="size-2.5"/>Plantar meta</button>
      </div>
      <dl className="goals-stats">
        <div className="hero-stat pixel-frame"><dt>Colhidas hoje</dt><dd>{doneToday}<small>/{dueToday}</small></dd></div>
        <div className="hero-stat pixel-frame"><dt>Semana</dt><dd>{weekPercent}<small>%</small></dd></div>
        <div className="hero-stat pixel-frame"><dt><PixelIcon name="flame" className="size-3 text-terracotta"/>Sequência</dt><dd>{bestStreak}<small> dias</small></dd></div>
      </dl>
    </div>
    <ul className="goals-field" aria-label="Canteiro: uma muda por meta">
      {goals.slice(0, 8).map(goal => <li key={goal.id} className="field-plant">
        <PlantGrowth variant="ground" progress={progressFor(goal, log, today)} label={goal.title}/>
        <span className="field-sign" aria-hidden="true">{goal.title}</span>
      </li>)}
    </ul>
  </section>;
}
