import { useCallback, useState, type MouseEvent } from 'react';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, addDays, amountOn, dailyTarget, daysWithout, frequencyLabel, isDoneOn, isQuitGoal, isScheduled, nextScheduledName, progressFor, startOfWeek, streakFor, toKey, weekChecks } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { PlantGrowth } from './PlantGrowth';
import { HarvestBurst, type Burst } from './HarvestBurst';
import { HARVEST_REWARD } from '../../lib/harvestRewards';

// Último número digitado para somar em cada meta de quantidade (fica só neste navegador)
const LAST_AMOUNT_KEY = 'farminghabit.quantity-last.v1';
function readLastAmount(goalId: string): number | null {
  try { const value = JSON.parse(localStorage.getItem(LAST_AMOUNT_KEY) ?? '{}')[goalId]; return typeof value === 'number' ? value : null; } catch { return null; }
}
function rememberLastAmount(goalId: string, value: number) {
  try { localStorage.setItem(LAST_AMOUNT_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(LAST_AMOUNT_KEY) ?? '{}'), [goalId]: value })); } catch { /* ignora */ }
}

interface GoalCardProps {
  goal: TrackedGoal; log: GoalLog; today: Date;
  onSetAmount: (amount: number, origin?: Element) => void; onRemove: () => void; onAnnounce: (message: string) => void;
  /** Abre o modal de edição da meta */
  onEdit: () => void;
  /** Recaída numa meta de largar (zera o contador de dias sem) */
  onRelapse: () => void;
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

export function GoalCard({ goal, log, today, onSetAmount, onRemove, onAnnounce, onEdit, onRelapse }: GoalCardProps) {
  const quitting = isQuitGoal(goal);
  const cleanDays = quitting ? daysWithout(goal, today) : 0;
  // Clicar no card (fora dos botões) abre a edição
  const editFromCard = (event: MouseEvent) => { if (!(event.target as Element).closest('button')) onEdit(); };
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
    // As moedas ganhas aparecem no aviso quando o servidor confirma o pagamento
    onSetAmount(1, origin);
    if (!weekly) celebrate('big', quitting ? 'Evitado!' : 'Colhido!');
    else if (checks >= weekly.timesPerWeek) celebrate('small', 'Colheita extra!');
    else if (checks + 1 >= weekly.timesPerWeek) celebrate('big', 'Semana completa!');
    else celebrate('small', `${checks + 1}/${weekly.timesPerWeek} na semana`);
  }

  // Quantidade (copos, minutos...): a pessoa digita quanto somar; o navegador lembra o último número de cada meta
  const [addValue, setAddValue] = useState(() => String(readLastAmount(goal.id) ?? quantity?.step ?? 1));
  const chosen = Number(addValue.replace(',', '.'));
  const validChosen = Number.isFinite(chosen) && chosen > 0;
  function chooseValue(text: string) {
    setAddValue(text);
    const value = Number(text.replace(',', '.'));
    if (Number.isFinite(value) && value > 0) rememberLastAmount(goal.id, value);
  }

  // Soma ou tira o valor digitado; floresce ao bater a meta do dia
  function changeAmount(direction: 1 | -1, origin: Element) {
    if (!quantity) return;
    if (!validChosen) { onAnnounce(`${goal.title}: digite quanto quer somar.`); return; }
    const next = Math.max(0, Math.round((amount + direction * chosen) * 100) / 100);
    onSetAmount(next, origin);
    if (direction < 0) return;
    if (next >= target && amount < target) celebrate('big', 'Meta do dia!');
    else celebrate('small', `+${chosen} ${quantity.unit}`);
  }

  const status = weekly ? `${Math.min(checks, weekly.timesPerWeek)}/${weekly.timesPerWeek} nesta semana`
    : !scheduledToday ? `Descanso hoje · próxima: ${nextScheduledName(goal, today)}`
    : quantity ? `${amount}/${target} ${quantity.unit} hoje`
    : quitting ? (doneToday ? 'Evitado hoje' : 'Marque quando conseguir evitar hoje')
    : doneToday ? 'Colhido hoje' : 'Esperando a colheita de hoje';

  return <li data-flip-id={goal.id} className={`goal-plot ${doneToday || progress >= 100 ? 'is-harvested' : ''} ${!scheduledToday ? 'is-resting' : ''}`}>
    <header className="goal-plot-header is-editable" onClick={editFromCard}>
      <span className="item-icon"><PixelIcon name={goal.icon}/></span>
      <div className="min-w-0 flex-1">
        <h3 className="item-title"><button type="button" className="goal-edit-trigger" onClick={onEdit} aria-haspopup="dialog" aria-label={`Editar meta: ${goal.title}`}>{goal.title}</button></h3>
        <p className="goal-frequency">{frequencyLabel(goal)}{quantity && ` · ${quantity.target} ${quantity.unit}/dia`}</p>
      </div>
      {streak > 0 && <span className="streak-badge" title="Sequência atual"><PixelIcon name="flame" className="size-3"/>{streak}<span className="sr-only"> {weekly ? 'semanas' : 'dias'} seguidos</span><span aria-hidden="true">{weekly ? 'sem' : 'd'}</span></span>}
      <button type="button" className="plot-remove" onClick={onRemove} aria-label={`Arrancar a meta ${goal.title}`}><PixelIcon name="close" className="size-2.5"/></button>
    </header>

    <div className="goal-plot-body is-editable" onClick={editFromCard}>
      <PlantGrowth progress={progress} label={goal.title} blooming={burst?.kind === 'big'}/>
      <div className="min-w-0 flex-1">
        {/* Largar um hábito: contador de dias sem, desde a última recaída */}
        {quitting && <p className="quit-counter" aria-live="polite"><strong>{cleanDays}</strong> {cleanDays === 1 ? 'dia sem' : 'dias sem'}</p>}
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
        <button type="button" className="pixel-button" disabled={!scheduledToday || amount === 0} onClick={event=>changeAmount(-1, event.currentTarget)} aria-label={`Tirar ${addValue} ${quantity.unit}`}><PixelIcon name="minus" className="size-2.5"/></button>
        {/* Quanto somar (ou tirar) a cada toque: a pessoa digita; fica lembrado neste navegador */}
        <label className="quantity-value quantity-input">
          <input type="text" inputMode="decimal" value={addValue} onChange={event=>chooseValue(event.target.value)} disabled={!scheduledToday} aria-label={`Quanto somar a cada toque, em ${quantity.unit}`}/>
          <small>{quantity.unit}</small>
        </label>
        <button type="button" className="pixel-button harvest-button" disabled={!scheduledToday} onClick={event=>changeAmount(1, event.currentTarget)} aria-label={`Somar ${addValue} ${quantity.unit}`}><PixelIcon name="plus" className="size-2.5"/>{validChosen ? chosen : ''} {quantity.unit}</button>
      </div>
      : <button type="button" className="pixel-button harvest-button" aria-pressed={doneToday} disabled={!scheduledToday} onClick={event=>toggleCheck(event.currentTarget)}>
        <span className="harvest-hint"><PixelIcon name={doneToday ? 'check' : 'coin'} className="size-3"/></span>
        {!scheduledToday ? 'Dia de descanso' : quitting ? (doneToday ? 'Evitado hoje' : 'Evitei hoje') : doneToday ? 'Colhido hoje' : weekly ? 'Marcar hoje' : 'Colher hoje'}
      </button>}
      {quitting && <button type="button" className="relapse-button" onClick={onRelapse}>Tive uma recaída</button>}
    </footer>

    {burst && <HarvestBurst key={burst.id} burst={burst} onDone={clearBurst}/>}
  </li>;
}
