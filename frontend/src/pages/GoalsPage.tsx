import { useState, type CSSProperties, type UIEvent } from 'react';
import { toast } from '../lib/toast';
import { MainLayout } from '../layouts/MainLayout';
import { GoalsHero } from '../components/goals/GoalsHero';
import { GoalCard } from '../components/goals/GoalCard';
import { ConsistencyCalendar } from '../components/goals/ConsistencyCalendar';
import { NewGoalDialog } from '../components/goals/NewGoalDialog';
import { PixelIcon } from '../components/PixelIcon';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useFlipList } from '../hooks/useFlipList';
import { amountOn, dailyTarget, isScheduled, sortByPending, toKey } from '../lib/goalLogic';
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
  const { goals, log, setAmount, addGoal, updateGoal, removeGoal } = useGoalTracker();
  const today = useToday();
  const [view, setView] = useState<'today' | 'all'>('today');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = goals.find(goal => goal.id === editingId);
  // Avisos de ação aparecem como toast
  const setAnnouncement = toast;
  // A lista de metas rola por dentro do quadro; a trepadeira cresce com essa rolagem (cheia se não houver o que rolar)
  const [vineProgress, setVineProgress] = useState(1);
  function onBoardScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setVineProgress(scrollHeight <= clientHeight ? 1 : Math.min(1, (scrollTop + clientHeight * 0.35) / (scrollHeight - clientHeight * 0.65)));
  }
  const coins = usePlayerCoins();
  // Pendentes em cima, colhidas descem para o fim da lista
  const shown = sortByPending(view === 'today' ? goals.filter(goal => isScheduled(goal, today)) : goals, log, today);
  const plotsRef = useFlipList<HTMLUListElement>(shown.map(goal => goal.id).join());

  // Cumprir a meta no dia paga moedas e XP (uma vez por dia); o crédito vai para o servidor em segundo plano
  // Colher pelo caixote da vendinha: check único conclui o dia, quantidade soma um passo
  function harvestFromStand(goal: TrackedGoal, origin: Element) {
    const amount = amountOn(goal, log, toKey(today));
    if (!isScheduled(goal, today)) { setAnnouncement(`${goal.title}: hoje é dia de descanso.`); return; }
    if (amount >= dailyTarget(goal)) { setAnnouncement(`${goal.title}: já colhida hoje 🌻`); return; }
    const next = goal.measure.kind === 'quantity' ? amount + goal.measure.step : 1;
    updateAmount(goal, next, origin);
    if (next < dailyTarget(goal) && goal.measure.kind === 'quantity') setAnnouncement(`${goal.title}: ${next}/${dailyTarget(goal)} ${goal.measure.unit}.`);
  }

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

  return <MainLayout page="goals" onNavigate={onNavigate} world={<GoalsHero goals={goals} log={log} today={today} coins={coins} onPlant={()=>setDialogOpen(true)} onHarvest={harvestFromStand}/>}>
    <div className="goals-layout">
      <section className="world-panel pixel-frame goals-board-panel" aria-labelledby="plots-heading">
        <header className="panel-heading">
          <h2 id="plots-heading"><PixelIcon name="target" className="size-5"/>Metas</h2>
          <div className="view-tabs" role="group" aria-label="Filtrar metas">
            <button type="button" className="view-tab" aria-pressed={view === 'today'} onClick={()=>setView('today')}>Hoje</button>
            <button type="button" className="view-tab" aria-pressed={view === 'all'} onClick={()=>setView('all')}>Todas ({goals.length})</button>
          </div>
        </header>
        <div className="panel-content goals-board" onScroll={onBoardScroll}>
          <GoalsVine progress={vineProgress}/>
          {shown.length === 0
            ? <div className="goals-empty"><p className="item-title">{goals.length ? 'Nenhuma meta cobra hoje. Dia de descanso no sítio!' : 'Nenhuma meta ainda.'}</p>
                {!goals.length && <button type="button" className="pixel-button primary-button mt-3" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Criar a primeira meta</button>}</div>
            : <ul ref={plotsRef} className="goal-plots">{shown.map(goal => <GoalCard key={goal.id} goal={goal} log={log} today={today}
                onSetAmount={(amount, origin)=>updateAmount(goal, amount, origin)} onRemove={()=>uproot(goal.id, goal.title)} onAnnounce={setAnnouncement} onEdit={()=>setEditingId(goal.id)}/>)}</ul>}
        </div>
      </section>
      <div className="goals-side"><ConsistencyCalendar goals={goals} log={log} today={today}/></div>
    </div>
    <p role="status" className="world-status">{'Toda semente precisa de tempo. Volte amanhã para regar.'}</p>
    {dialogOpen && <NewGoalDialog onSave={plant} onClose={()=>setDialogOpen(false)}/>}
    {editing && <NewGoalDialog key={editing.id} goal={editing} onClose={()=>setEditingId(null)}
      onSave={changes=>{ updateGoal(editing.id, changes); setEditingId(null); setAnnouncement(`${changes.title}: meta atualizada!`); }}/>}
  </MainLayout>;
}
