import { useState, type CSSProperties } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GoalsHero } from '../components/goals/GoalsHero';
import { GoalCard } from '../components/goals/GoalCard';
import { ConsistencyCalendar } from '../components/goals/ConsistencyCalendar';
import { NewGoalDialog } from '../components/goals/NewGoalDialog';
import { PixelIcon } from '../components/PixelIcon';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useScrollProgress } from '../hooks/useScrollGrowth';
import { useFlipList } from '../hooks/useFlipList';
import { isScheduled, sortByPending, toKey } from '../lib/goalLogic';
import type { NewTrackedGoal, TrackedGoal } from '../types/goals';
import { claimHarvest, creditPlayer, releaseHarvest, rewardLabel } from '../lib/harvestRewards';
import { flyCoins } from '../lib/coinFlight';
import { usePlayerCoins } from '../hooks/usePlayerCoins';
import type { AppPage } from '../types/navigation';

const VINE_LEAVES = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];

/** Trepadeira lateral que cresce conforme a rolagem pela lista de metas */
function GoalsVine({ progress }: { progress: number }) {
  return <div className="goals-vine" aria-hidden="true" style={{ '--grow': progress } as CSSProperties}>
    <span className="vine-stem"/>
    {VINE_LEAVES.map((position, index) => <span key={position} className={`vine-leaf ${index % 2 ? 'is-right' : ''} ${progress >= position ? 'is-open' : ''}`} style={{ top: `${position * 100}%` }}/>)}
    <span className={`vine-flower ${progress >= 0.98 ? 'is-open' : ''}`}/>
  </div>;
}

export function GoalsPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { goals, log, setAmount, addGoal, removeGoal } = useGoalTracker();
  const today = useToday();
  const [view, setView] = useState<'today' | 'all'>('today');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [boardRef, vineProgress] = useScrollProgress<HTMLDivElement>();
  const coins = usePlayerCoins();
  // Pendentes em cima, colhidas descem para o fim da lista
  const shown = sortByPending(view === 'today' ? goals.filter(goal => isScheduled(goal, today)) : goals, log, today);
  const plotsRef = useFlipList<HTMLUListElement>(shown.map(goal => goal.id).join());

  // Cumprir a meta no dia paga moedas e XP (uma vez por dia); o crédito vai para o servidor em segundo plano
  function updateAmount(goal: TrackedGoal, amount: number, origin?: Element) {
    const reward = claimHarvest(goal, log, today, amount);
    setAmount(goal.id, toKey(today), amount);
    if (reward) creditPlayer(reward.coins, reward.xp)
      .then(() => { flyCoins(origin, reward.coins); setAnnouncement(`${goal.title}: ${rewardLabel(reward)}`); })
      .catch(() => { releaseHarvest(reward); setAnnouncement(`${goal.title}: colhida, mas o servidor está fora do ar e as moedas não foram creditadas.`); });
    return reward;
  }

  function plant(goal: NewTrackedGoal) {
    addGoal(goal);
    setDialogOpen(false);
    setView('all');
    setAnnouncement(`${goal.title}: semente plantada!`);
  }

  function uproot(goalId: string, title: string) {
    if (!window.confirm(`Arrancar a meta "${title}"? O histórico dela também será apagado.`)) return;
    removeGoal(goalId);
    setAnnouncement(`${title}: meta arrancada do canteiro.`);
  }

  return <MainLayout page="goals" onNavigate={onNavigate} world={<GoalsHero goals={goals} log={log} today={today} coins={coins} onPlant={()=>setDialogOpen(true)}/>}>
    <div className="goals-layout">
      <section className="world-panel pixel-frame goals-board-panel" aria-labelledby="plots-heading">
        <header className="panel-heading">
          <h2 id="plots-heading"><PixelIcon name="leaf" className="size-5"/>Plantações</h2>
          <div className="view-tabs" role="group" aria-label="Filtrar metas">
            <button type="button" className="view-tab" aria-pressed={view === 'today'} onClick={()=>setView('today')}>Hoje</button>
            <button type="button" className="view-tab" aria-pressed={view === 'all'} onClick={()=>setView('all')}>Todas ({goals.length})</button>
          </div>
        </header>
        <div ref={boardRef} className="panel-content goals-board">
          <GoalsVine progress={vineProgress}/>
          {shown.length === 0
            ? <div className="goals-empty"><p className="item-title">{goals.length ? 'Nenhuma meta cobra hoje. Dia de descanso no sítio!' : 'O canteiro está vazio.'}</p>
                {!goals.length && <button type="button" className="pixel-button primary-button mt-3" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Plantar a primeira meta</button>}</div>
            : <ul ref={plotsRef} className="goal-plots">{shown.map(goal => <GoalCard key={goal.id} goal={goal} log={log} today={today}
                onSetAmount={(amount, origin)=>updateAmount(goal, amount, origin)} onRemove={()=>uproot(goal.id, goal.title)} onAnnounce={setAnnouncement}/>)}</ul>}
        </div>
      </section>
      <ConsistencyCalendar goals={goals} log={log} today={today}/>
    </div>
    <p role="status" className="world-status">{announcement || 'Toda semente precisa de tempo. Volte amanhã para regar.'}</p>
    {dialogOpen && <NewGoalDialog onSave={plant} onClose={()=>setDialogOpen(false)}/>}
  </MainLayout>;
}
