import { useCallback, useState } from 'react';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { amountOn, dailyTarget, frequencyLabel, isScheduled, nextScheduledName, progressFor, streakFor, toKey, weekChecks } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { HarvestBurst, type Burst } from './HarvestBurst';
import type { HarvestReward } from '../../lib/harvestRewards';

interface GoalCardProps {
  goal: TrackedGoal; log: GoalLog; today: Date;
  onSetAmount: (amount: number, origin?: Element) => HarvestReward | null; onRemove: () => void; onAnnounce: (message: string) => void;
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

  // Uma linha de status direta: o que falta hoje (ou na semana)
  const status = !scheduledToday && !weekly ? `Descanso · próxima: ${nextScheduledName(goal, today)}`
    : weekly ? `${Math.min(checks, weekly.timesPerWeek)}/${weekly.timesPerWeek} na semana`
    : quantity ? `${amount}/${target} ${quantity.unit} hoje`
    : frequencyLabel(goal);

  // Cartão compacto: nome, status, barra fina e a ação do dia
  return <li data-flip-id={goal.id} className={`goal-plot ${doneToday || progress >= 100 ? 'is-harvested' : ''} ${!scheduledToday ? 'is-resting' : ''}`}>
    <header className="goal-plot-header">
      <span className="item-icon"><PixelIcon name={goal.icon}/></span>
      <div className="min-w-0 flex-1">
        <h3 className="item-title">{goal.title}{(doneToday || progress >= 100) && <PixelIcon name="check" className="goal-done-check size-3"/>}</h3>
        <p className="goal-frequency">{status}{streak > 0 && <span className="goal-streak" title="Sequência atual"> · <PixelIcon name="flame" className="size-2.5"/>{streak}<span className="sr-only"> {weekly ? 'semanas' : 'dias'} seguidos</span></span>}</p>
      </div>
      <button type="button" className="plot-remove" onClick={onRemove} aria-label={`Arrancar a meta ${goal.title}`}><PixelIcon name="close" className="size-2.5"/></button>
    </header>

    <ProgressBar value={progress} label={`Progresso: ${goal.title}`} className="goal-plot-bar h-3"/>

    {scheduledToday || weekly ? <footer className="goal-plot-actions">
      {quantity ? <div className="quantity-stepper">
        <button type="button" className="pixel-button" disabled={!scheduledToday || amount === 0} onClick={event=>changeAmount(-1, event.currentTarget)} aria-label={`Tirar ${quantity.step} ${quantity.unit}`}><PixelIcon name="minus" className="size-2.5"/></button>
        <button type="button" className="pixel-button harvest-button" disabled={!scheduledToday} onClick={event=>changeAmount(1, event.currentTarget)}><PixelIcon name="plus" className="size-2.5"/>{quantity.step} {quantity.unit}</button>
      </div>
      : <button type="button" className="pixel-button harvest-button" aria-pressed={doneToday} disabled={!scheduledToday} onClick={event=>toggleCheck(event.currentTarget)}>
        <PixelIcon name={doneToday ? 'check' : 'coin'} className="harvest-hint size-3"/>
        {doneToday ? 'Feito hoje' : weekly ? 'Marcar hoje' : 'Colher hoje'}
      </button>}
    </footer> : null}

    {burst && <HarvestBurst key={burst.id} burst={burst} onDone={clearBurst}/>}
  </li>;
}
