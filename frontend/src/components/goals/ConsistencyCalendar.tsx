import { useId, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import type { DayStatus, GoalLog, TrackedGoal } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, summarizeDay, toKey, type DaySummary } from '../../lib/goalLogic';
import { useInView } from '../../hooks/useScrollGrowth';
import { PixelIcon } from '../PixelIcon';
import { prefersCalm } from '../../hooks/useRollingNumber';

// Bolinha pixelada (octógono 16×16) e suas variações
const BALL = 'M5 3H11V4H12V5H13V11H12V12H11V13H5V12H4V11H3V5H4V4H5Z';
const INNER = 'M5 4H11V5H12V11H11V12H5V11H4V5H5Z';
const LOWER_HALF = 'M4 8H12V11H11V12H5V11H4Z';

/** Semente que muda conforme o dia: fruto colhido, meio cheio, terra seca, aguardando ou descanso */
function SeedSprite({ status }: { status: DayStatus }) {
  if (status === 'rest' || status === 'future') return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"><rect x="7" y="7" width="2" height="2" fill="#c49a62"/></svg>;
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    {status === 'harvest' && <>
      <path d={BALL} fill="#3f6b35"/><path d={INNER} fill="#72ad32"/><rect x="5" y="9" width="7" height="2" fill="#53922d"/>
      <rect x="8" y="1" width="2" height="3" fill="#3f6b35"/><rect x="10" y="1" width="3" height="2" fill="#72ad32"/>
      <rect className="seed-shine" x="5" y="5" width="2" height="2" fill="#f4ffd0"/>
    </>}
    {status === 'partial' && <><path d={BALL} fill="#53922d"/><path d={INNER} fill="#f3dca5"/><path d={LOWER_HALF} fill="#c0e36b"/><rect x="5" y="8" width="7" height="1" fill="#72ad32"/></>}
    {status === 'pending' && <><path d={BALL} fill="#8a5838"/><path d={INNER} fill="#f6e2b0"/><rect x="7" y="7" width="2" height="3" fill="#8a5838"/></>}
    {status === 'dry' && <><path d={BALL} fill="#9a7243"/><path d={INNER} fill="#c9a46a"/><path d="M6 6H7V8H8V9H9V11H8V10H7V9H6Z" fill="#8a6136"/></>}
  </svg>;
}

const STATUS_LABEL: Record<DayStatus, string> = {
  harvest: 'Colheita completa', partial: 'Colheita parcial', dry: 'Terra seca: nada cultivado', pending: 'Hoje: ainda dá tempo', rest: 'Dia de descanso', future: 'Ainda vai chegar',
};

function DayTooltip({ id, date, summary }: { id: string; date: Date; summary: DaySummary }) {
  const title = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  return <span role="tooltip" id={id} className="day-tooltip">
    <strong className="tooltip-title">{title}</strong>
    <span className="tooltip-status">{STATUS_LABEL[summary.status]}</span>
    {summary.cultivated.length > 0 && <span className="tooltip-list">
      {summary.cultivated.map(({ goal, amount, done }) => <span key={goal.id} className={done ? 'is-done' : ''}>
        {done ? '✓' : '◐'} {goal.title}{goal.measure.kind === 'quantity' && ` (${amount}/${goal.measure.target} ${goal.measure.unit})`}
      </span>)}
    </span>}
    {summary.missed.length > 0 && summary.status !== 'pending' && <span className="tooltip-missed">Ficou para trás: {summary.missed.map(goal => goal.title).join(', ')}</span>}
  </span>;
}

// Lado do calendário fica salvo só neste navegador (preferência visual)
const FLIP_KEY = 'farminghabit.calendar-flipped.v1';
function readFlipped() { try { return localStorage.getItem(FLIP_KEY) === '1'; } catch { return false; } }

export function ConsistencyCalendar({ goals, log, today }: { goals: TrackedGoal[]; log: GoalLog; today: Date }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [filter, setFilter] = useState('all');
  const [gridRef, inView] = useInView<HTMLDivElement>(0.15);
  const [flipped, setFlipped] = useState(readFlipped);
  // Virar como um cartão: o calendário inteiro (arame e barbante juntos) gira até ficar de lado, troca a face e volta
  const [turning, setTurning] = useState<'out' | 'in' | null>(null);
  const nextSide = useRef(false);
  const commit = (next: boolean) => { setFlipped(next); try { localStorage.setItem(FLIP_KEY, next ? '1' : '0'); } catch { /* sem armazenamento: só não lembra */ } };
  const flip = (next: boolean) => {
    if (turning) return;
    if (prefersCalm()) { commit(next); return; }
    nextSide.current = next;
    setTurning('out');
  };
  const onTurnEnd = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return;
    if (turning === 'out') { commit(nextSide.current); setTurning('in'); } else setTurning(null);
  };
  const baseId = useId();
  const todayKey = toKey(today);
  const visibleGoals = filter === 'all' ? goals : goals.filter(goal => goal.id === filter);
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7; // colunas vazias antes do dia 1 (semana começa na segunda)
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
    return { date, key: toKey(date), summary: summarizeDay(visibleGoals, log, date, todayKey) };
  });
  const harvested = days.filter(day => day.summary.status === 'harvest').length;
  const partial = days.filter(day => day.summary.status === 'partial').length;

  // Calendário de parede: pendurado num prego com barbante, espiral de arame no topo e folhas empilhadas embaixo
  return <section className={`wall-calendar harvest-calendar ${turning ? `is-turning-${turning}` : ''}`} aria-labelledby="harvest-heading" onAnimationEnd={onTurnEnd}>
    <span className="calendar-hanger" aria-hidden="true"><span className="calendar-nail"/></span>
    <div className="calendar-rings" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index}/>)}</div>
    {/* Frente com os dias; verso só de papelão listrado. Clicar no calendário vira (menos nas setas e no filtro) */}
    <div className={`calendar-flipper ${flipped ? 'is-flipped' : ''}`}>
    <div className="calendar-sheet calendar-front" inert={flipped} onClick={event=>{ if (!(event.target as Element).closest('.calendar-flip, .calendar-filter')) flip(true); }}>
      {/* Para teclado e leitores de tela: aparece só quando recebe foco */}
      <button type="button" className="sr-only focus:not-sr-only" onClick={()=>flip(true)}>Virar o calendário</button>
      <header className="calendar-band">
        <h2 id="harvest-heading" className="calendar-band-label"><PixelIcon name="growth" className="size-3"/>Calendário da Safra</h2>
        <div className="calendar-band-month">
          <button type="button" className="calendar-flip" aria-label="Mês anterior" onClick={()=>setMonth(current=>new Date(current.getFullYear(), current.getMonth() - 1, 1))}>◀</button>
          <p aria-live="polite"><strong>{new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(month)}</strong><small>{month.getFullYear()}</small></p>
          <button type="button" className="calendar-flip" aria-label="Próximo mês" disabled={isCurrentMonth} onClick={()=>setMonth(current=>new Date(current.getFullYear(), current.getMonth() + 1, 1))}>▶</button>
        </div>
        <p className="calendar-band-summary">{harvested} colhidos · {partial} parciais</p>
      </header>
      <div className="calendar-body">
      <label className="calendar-filter">Meta
        <select value={filter} onChange={event=>setFilter(event.target.value)}>
          <option value="all">Todas as metas</option>
          {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
        </select>
      </label>

      <div ref={gridRef} className={`harvest-grid ${inView ? 'is-visible' : ''}`}>
        {WEEK_ORDER.map(weekday => <span key={weekday} className="harvest-weekday" aria-hidden="true">{WEEKDAY_NAMES[weekday]}</span>)}
        {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} aria-hidden="true"/>)}
        {days.map(({ date, key, summary }, index) => {
          const column = (offset + index) % 7;
          const tooltipId = `${baseId}-${key}`;
          return <button key={key} type="button"
            className={`harvest-day is-${summary.status} ${key === todayKey ? 'is-today' : ''} ${column < 2 ? 'tip-start' : column > 4 ? 'tip-end' : ''}`}
            style={{ '--i': index } as CSSProperties} aria-describedby={tooltipId} aria-label={`Dia ${date.getDate()}`}>
            <span className="day-number" aria-hidden="true">{date.getDate()}</span>
            <SeedSprite status={summary.status}/>
            <DayTooltip id={tooltipId} date={date} summary={summary}/>
          </button>;
        })}
      </div>

      <ul className="harvest-legend">
        {(['harvest', 'partial', 'dry', 'rest'] as const).map(status => <li key={status}><span className={`legend-seed is-${status}`}><SeedSprite status={status}/></span>{{ harvest: 'Colhido', partial: 'Parcial', dry: 'Terra seca', rest: 'Descanso' }[status]}</li>)}
      </ul>
      </div>
    </div>
    <button type="button" className="calendar-sheet calendar-back" inert={!flipped} onClick={()=>flip(false)} aria-label="Desvirar o calendário para ver os dias"/>
    </div>
    <span className="calendar-pages" aria-hidden="true"/>
  </section>;
}
