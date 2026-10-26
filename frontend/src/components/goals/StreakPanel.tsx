import type { GoalLog, TrackedGoal } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, addDays, harvestsBetween, startOfWeek, streakFor, toKey } from '../../lib/goalLogic';

const MILESTONES = [3, 7, 14, 30, 60, 100];

/** Chama pixelada: acesa (laranja, tremulando) quando você já colheu hoje; apagada (cinza) quando ainda falta */
function StreakFlame({ lit }: { lit: boolean }) {
  return <svg className={`streak-flame ${lit ? 'is-lit' : ''}`} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    <path d="M14 1h4v3h2v3h2V5h3v5h2v4h1v9h-1v3h-2v2h-3v2H10v-2H7v-2H5v-3H4v-9h1v-3h2V8h2v3h2V6h1V3h2Z" fill={lit ? '#e8762f' : '#b9ad96'}/>
    <path d="M15 8h2v4h2v-2h2v4h1v8h-1v2h-2v2h-6v-2h-2v-2h-1v-6h1v-3h2v2h2Z" fill={lit ? '#f2a33a' : '#d2c8b4'}/>
    <path d="M15 16h2v3h2v4h-1v2h-4v-2h-1v-3h1v-2h1Z" fill={lit ? '#ffe38b' : '#ece5d6'}/>
  </svg>;
}

/** Sequência no estilo Duolingo: chama grande com os dias seguidos e a semana com os dias "acesos" */
export function StreakPanel({ goals, log, today }: { goals: TrackedGoal[]; log: GoalLog; today: Date }) {
  const streak = goals.reduce((best, goal) => Math.max(best, goal.frequency.kind === 'weekly' ? 0 : streakFor(goal, log, today)), 0);
  const litToday = harvestsBetween(goals, log, today, today) > 0;
  const nextMilestone = MILESTONES.find(value => value > streak);
  const monday = startOfWeek(today);
  const todayKey = toKey(today);
  const message = !litToday ? 'Colha uma meta hoje para manter a chama acesa!'
    : nextMilestone ? `Faltam ${nextMilestone - streak} ${nextMilestone - streak === 1 ? 'dia' : 'dias'} para ${nextMilestone} dias seguidos.`
    : 'Uma lenda da constância! 🏆';

  return <section className="world-panel pixel-frame streak-panel" aria-labelledby="streak-heading">
    <div className="streak-hero">
      <StreakFlame lit={litToday}/>
      <div>
        <p className="streak-count"><strong>{streak}</strong></p>
        <h2 id="streak-heading" className="streak-label">{streak === 1 ? 'dia de sequência' : 'dias de sequência'}</h2>
        <p className="streak-message">{message}</p>
      </div>
    </div>
    <ol className="streak-week" aria-label="Esta semana">
      {WEEK_ORDER.map((weekday, index) => {
        const date = addDays(monday, index);
        const key = toKey(date);
        const kept = key <= todayKey && harvestsBetween(goals, log, date, date) > 0;
        const state = kept ? 'kept' : key === todayKey ? 'today' : key > todayKey ? 'future' : 'missed';
        return <li key={weekday} className={`streak-day is-${state}`}>
          <span className="streak-day-name">{WEEKDAY_NAMES[weekday][0]}</span>
          <span className="streak-day-dot" aria-label={`${WEEKDAY_NAMES[weekday]}: ${kept ? 'colheu' : state === 'today' ? 'hoje' : state === 'future' ? 'ainda não chegou' : 'não colheu'}`}>{kept ? '✓' : ''}</span>
        </li>;
      })}
    </ol>
  </section>;
}
