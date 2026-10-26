import type { GoalLog, TrackedGoal } from '../../types/goals';
import { harvestsBetween, streakFor } from '../../lib/goalLogic';

/** Chama pixelada: acesa (laranja) quando você já colheu hoje; cinza quando ainda falta. Sempre tremulando */
function StreakFlame({ lit }: { lit: boolean }) {
  return <svg className={`streak-flame ${lit ? 'is-lit' : ''}`} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    <path d="M14 1h4v3h2v3h2V5h3v5h2v4h1v9h-1v3h-2v2h-3v2H10v-2H7v-2H5v-3H4v-9h1v-3h2V8h2v3h2V6h1V3h2Z" fill={lit ? '#e8762f' : '#b9ad96'}/>
    <path d="M15 8h2v4h2v-2h2v4h1v8h-1v2h-2v2h-6v-2h-2v-2h-1v-6h1v-3h2v2h2Z" fill={lit ? '#f2a33a' : '#d2c8b4'}/>
    <path d="M15 16h2v3h2v4h-1v2h-4v-2h-1v-3h1v-2h1Z" fill={lit ? '#ffe38b' : '#ece5d6'}/>
  </svg>;
}

/** Dias de sequência no topo da Evolução (no lugar das moedas): foguinho animado + número */
export function StreakHud({ goals, log, today, className = '' }: { goals: TrackedGoal[]; log: GoalLog; today: Date; className?: string }) {
  const streak = goals.reduce((best, goal) => Math.max(best, goal.frequency.kind === 'weekly' ? 0 : streakFor(goal, log, today)), 0);
  const lit = harvestsBetween(goals, log, today, today) > 0;
  return <div className={`streak-hud pixel-frame ${lit ? 'is-lit' : ''} ${className}`} role="status"
    aria-label={`${streak} ${streak === 1 ? 'dia' : 'dias'} de sequência${lit ? '' : ', colha uma meta hoje para manter a chama acesa'}`}
    title={lit ? 'Chama acesa hoje!' : 'Colha uma meta hoje para manter a chama acesa'}>
    <StreakFlame lit={lit}/><strong>{streak}</strong><span>{streak === 1 ? 'dia' : 'dias'}</span>
  </div>;
}
