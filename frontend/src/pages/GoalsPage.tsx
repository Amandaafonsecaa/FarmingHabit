import { useState, type CSSProperties, type UIEvent } from 'react';
import { toast } from '../lib/toast';
import { MainLayout } from '../layouts/MainLayout';
import { GoalsHero } from '../components/goals/GoalsHero';
import { GoalCard } from '../components/goals/GoalCard';
import { ConsistencyCalendar } from '../components/goals/ConsistencyCalendar';
import { NewGoalDialog } from '../components/goals/NewGoalDialog';
import { PixelIcon } from '../components/PixelIcon';
import { PanelHeading, useCollapsible } from '../components/PanelHeading';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useFlipList } from '../hooks/useFlipList';
import { amountOn, dailyTarget, isScheduled, sortByPending, toKey } from '../lib/goalLogic';
import type { NewTrackedGoal, TrackedGoal } from '../types/goals';
import { settleCheckin } from '../lib/harvestRewards';
import { usePlayerCoins } from '../hooks/usePlayerCoins';
import { usePerfectDay } from '../hooks/usePerfectDay';
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
  const { goals, log, setAmount, addGoal, updateGoal, relapse, removeGoal } = useGoalTracker();
  const today = useToday();
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
  const { celebrating } = usePerfectDay(goals, log, today);
  // Pendentes em cima, colhidas descem para o fim da lista
  const shown = sortByPending(goals, log, today);
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

  // Grava o dia; se ele acabou de ser cumprido, o servidor paga a colheita no mesmo pedido
  function updateAmount(goal: TrackedGoal, amount: number, origin?: Element) {
    settleCheckin(goal.title, setAmount(goal.id, toKey(today), amount), origin);
  }

  function plant(goal: NewTrackedGoal) {
    addGoal(goal);
    setDialogOpen(false);
    setAnnouncement(`${goal.title}: semente plantada!`);
  }

  // Recaída: zera o contador de dias sem e desmarca o "evitei" de hoje (as moedas já ganhas ficam)
  function registerRelapse(goalId: string, title: string) {
    if (!window.confirm(`Registrar uma recaída em "${title}"? O contador de dias sem recomeça do zero — e tudo bem, recomeçar também é progresso.`)) return;
    settleCheckin(title, relapse(goalId, toKey(today)));
    setAnnouncement(`${title}: contador reiniciado. Amanhã é um novo dia 🌱`);
  }

  function uproot(goalId: string, title: string) {
    if (!window.confirm(`Arrancar a meta "${title}"? O histórico dela também será apagado.`)) return;
    removeGoal(goalId).catch(error => setAnnouncement(`${title}: ${error instanceof Error ? error.message : 'não foi possível apagar o histórico.'}`));
    setAnnouncement(`${title}: meta arrancada do canteiro.`);
  }

  const boardCard = useCollapsible();
  return <MainLayout page="goals" onNavigate={onNavigate} world={<GoalsHero goals={goals} log={log} today={today} coins={coins} celebrating={celebrating} onHarvest={harvestFromStand}/>}>
    <div className="goals-layout">
      <section className={`world-panel pixel-frame goals-board-panel ${boardCard.collapsedClass}`} aria-labelledby="plots-heading">
        <PanelHeading id="plots-heading" icon="target" title="Metas" open={boardCard.open} onToggle={boardCard.toggle}>
          <button type="button" className="pixel-button primary-button plant-button" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Plantar meta</button>
        </PanelHeading>
        <div className="panel-content goals-board" onScroll={onBoardScroll}>
          <GoalsVine progress={vineProgress}/>
          {shown.length === 0
            ? <div className="goals-empty"><p className="item-title">{goals.length ? 'Nenhuma meta cobra hoje. Dia de descanso no sítio!' : 'Nenhuma meta ainda.'}</p>
                {!goals.length && <button type="button" className="pixel-button primary-button mt-3" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Criar a primeira meta</button>}</div>
            : <ul ref={plotsRef} className="goal-plots">{shown.map(goal => <GoalCard key={goal.id} goal={goal} log={log} today={today}
                onSetAmount={(amount, origin)=>updateAmount(goal, amount, origin)} onRemove={()=>uproot(goal.id, goal.title)} onAnnounce={setAnnouncement} onEdit={()=>setEditingId(goal.id)} onRelapse={()=>registerRelapse(goal.id, goal.title)}/>)}</ul>}
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
