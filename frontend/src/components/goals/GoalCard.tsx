import { useCallback, useState } from 'react';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, addDays, amountOn, dailyTarget, frequencyLabel, isDoneOn, isScheduled, nextScheduledName, progressFor, startOfWeek, streakFor, toKey, weekChecks } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { PlantGrowth } from './PlantGrowth';
import { HarvestBurst, type Burst } from './HarvestBurst';
import { HARVEST_REWARD, type HarvestReward } from '../../lib/harvestRewards';

interface GoalCardProps {
  goal: TrackedGoal; log: GoalLog; today: Date;
  onSetAmount: (amount: number, origin?: Element) => HarvestReward | null; onRemove: () => void; onAnnounce: (message: string) => void;
}

/** Faixa seg–dom da semana atual: feito, falhou, hoje, agendado ou folga */
function WeekStrip({ goal, log, today }: { goal: TrackedGoal; log: GoalLog; today: Date }) {
  const monday = startOfWeek(today);
  const todayKey = toKey(today);
  return <ol className="week-strip" aria-label="Esta semana">
    {WEEK_ORDER.map((weekday, index) => {
      const date = addDays(monday, index);
      const key = toKey(date);
      const done = isDoneOn(goal, log, date);
      const scheduled = goal.frequency.kind !== 'weekly' && isScheduled(goal, date);
      const state = done ? 'done' : key === todayKey ? 'today' : !scheduled ? 'off' : key < todayKey ? 'missed' : 'planned';
      const stateLabel = { done: 'cultivado', today: 'hoje', off: 'livre', missed: 'não feito', planned: 'agendado' }[state];
      return <li key={weekday} className={`week-cell is-${state}`} title={`${WEEKDAY_NAMES[weekday]}: ${stateLabel}`}>
        <span aria-hidden="true">{WEEKDAY_NAMES[weekday][0]}</span><span className="sr-only">{WEEKDAY_NAMES[weekday]}: {stateLabel}</span>
      </li>;
    })}
  </ol>;
}

export function GoalCard({ goal, log, today, onSetAmount, onRemove, onAnnounce }: GoalCardProps) {
  const [burst, setBurst] = useState<Burst | null>(null);
  const clearBurst = useCallback(() => setBurst(null), []);
  const amount = amountOn(goal, log, toKey(today));
  const target = dailyTarget(goal);
  const progress = progressFor(goal, log, today);
  const streak = streakFor(goal, log, today);
  const scheduledToday = isScheduled(goal, today);
  const weekly = goal.frequency.kind === 'weekly' ? goal.frequency : null;
  const quantity = goal.measure.kind === 'quantity' ? goal.measure : null;
  const checks = weekChecks(goal, log, today);
  const doneToday = amount >= target;

  function celebrate(kind: Burst['kind'], label: string) {
    setBurst({ id: Date.now(), kind, label });
    onAnnounce(`${goal.title}: ${label}`);
  }

  // Check único (diária, dias específicos ou um check da semanal): alterna o dia de hoje
  function toggleCheck(origin: Element) {
    if (doneToday) { onSetAmount(0); onAnnounce(`${goal.title}: marcação de hoje desfeita.`); return; }
    // A plaquinha mostra as moedas ganhas (só na primeira colheita do dia)
    const reward = onSetAmount(1, origin);
    const coins = reward ? ` +${reward.coins} 🪙` : '';
    if (!weekly) celebrate('big', `Colhido!${coins}`);
    else if (checks >= weekly.timesPerWeek) celebrate('small', `Colheita extra!${coins}`);
    else if (checks + 1 >= weekly.timesPerWeek) celebrate('big', `Semana completa!${coins}`);
    else celebrate('small', `${checks + 1}/${weekly.timesPerWeek} na semana${coins}`);
  }

  // Quantidade (copos, minutos...): soma ou tira um passo; floresce ao bater a meta do dia
  function changeAmount(direction: 1 | -1, origin: Element) {
    if (!quantity) return;
    const next = Math.max(0, amount + direction * quantity.step);
    const reward = onSetAmount(next, origin);
    if (direction < 0) return;
    if (next >= target && amount < target) celebrate('big', `Meta do dia!${reward ? ` +${reward.coins} 🪙` : ''}`);
    else celebrate('small', `+${quantity.step} ${quantity.unit}`);
  }

  const status = weekly ? `${Math.min(checks, weekly.timesPerWeek)}/${weekly.timesPerWeek} nesta semana`
    : !scheduledToday ? `Descanso hoje · próxima: ${nextScheduledName(goal, today)}`
    : quantity ? `${amount}/${target} ${quantity.unit} hoje`
    : doneToday ? 'Colhido hoje' : 'Esperando a colheita de hoje';

  return <li data-flip-id={goal.id} className={`goal-plot ${doneToday || progress >= 100 ? 'is-harvested' : ''} ${!scheduledToday ? 'is-resting' : ''}`}>
    <header className="goal-plot-header">
      <span className="item-icon"><PixelIcon name={goal.icon}/></span>
      <div className="min-w-0 flex-1">
        <h3 className="item-title">{goal.title}</h3>
        <p className="goal-frequency">{frequencyLabel(goal)}{quantity && ` · ${quantity.target} ${quantity.unit}/dia`}</p>
      </div>
      {streak > 0 && <span className="streak-badge" title="Sequência atual"><PixelIcon name="flame" className="size-3"/>{streak}<span className="sr-only"> {weekly ? 'semanas' : 'dias'} seguidos</span><span aria-hidden="true">{weekly ? 'sem' : 'd'}</span></span>}
      <button type="button" className="plot-remove" onClick={onRemove} aria-label={`Arrancar a meta ${goal.title}`}><PixelIcon name="close" className="size-2.5"/></button>
    </header>

    <div className="goal-plot-body">
      <PlantGrowth progress={progress} label={goal.title} blooming={burst?.kind === 'big'}/>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex justify-between gap-2 text-xs font-bold"><span>{status}</span><span>{progress}%</span></div>
        <ProgressBar value={progress} label={`Progresso: ${goal.title}`} className="h-3"/>
        {weekly
          ? <div className="week-pips" aria-hidden="true">{Array.from({ length: weekly.timesPerWeek }, (_, index) => <span key={index} className={index < checks ? 'is-filled' : ''}/>)}</div>
          : <WeekStrip goal={goal} log={log} today={today}/>}
      </div>
    </div>

    <footer className="goal-plot-actions">
      {scheduledToday && !doneToday && <span className="reward-chip" title="Recompensa por cumprir hoje">+{HARVEST_REWARD.coins} 🪙</span>}
      {quantity ? <div className="quantity-stepper">
        <button type="button" className="pixel-button" disabled={!scheduledToday || amount === 0} onClick={event=>changeAmount(-1, event.currentTarget)} aria-label={`Tirar ${quantity.step} ${quantity.unit}`}><PixelIcon name="minus" className="size-2.5"/></button>
        <output className="quantity-value" aria-live="polite">{amount}<small>/{target} {quantity.unit}</small></output>
        <button type="button" className="pixel-button harvest-button" disabled={!scheduledToday} onClick={event=>changeAmount(1, event.currentTarget)}><PixelIcon name="plus" className="size-2.5"/>{quantity.step} {quantity.unit}</button>
      </div>
      : <button type="button" className="pixel-button harvest-button" aria-pressed={doneToday} disabled={!scheduledToday} onClick={event=>toggleCheck(event.currentTarget)}>
        <span className="harvest-hint"><PixelIcon name={doneToday ? 'check' : 'coin'} className="size-3"/></span>
        {!scheduledToday ? 'Dia de descanso' : doneToday ? 'Colhido hoje' : weekly ? 'Marcar hoje' : 'Colher hoje'}
      </button>}
    </footer>

    {burst && <HarvestBurst key={burst.id} burst={burst} onDone={clearBurst}/>}
  </li>;
}
