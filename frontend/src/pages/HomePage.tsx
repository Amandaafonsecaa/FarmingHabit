import { useEffect, useRef, useState } from 'react';
import { toast } from '../lib/toast';
import { GameWorld } from '../components/GameWorld';
import { GoalsPanel } from '../components/GoalsPanel';
import { MissionsPanel } from '../components/MissionsPanel';
import { CoinsPanel } from '../components/CoinsPanel';
import { SeedFab } from '../components/home/SeedFab';
import type { GardenPlot } from '../components/WorldScenery';
import { MissionDialog } from '../components/dialogs/MissionDialog';
import { RewardDialog } from '../components/dialogs/RewardDialog';
import { NewGoalDialog } from '../components/goals/NewGoalDialog';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useAcceptedMissions } from '../hooks/useMissionBoard';
import { amountOn, dailyTarget, isDoneOn, isScheduled, progressFor, toKey, weekChecks } from '../lib/goalLogic';
import type { NewTrackedGoal, TrackedGoal } from '../types/goals';
import type { ItemKind, Mission, NewItem, Reward } from '../types/world';
import { MainLayout } from '../layouts/MainLayout';
import { recordAdventure } from '../lib/diary';
import { readWishes } from '../lib/shop';
import { flyCoins } from '../lib/coinFlight';
import { PLAYER_EVENT, reachesHarvest, requestHarvest, rewardLabel } from '../lib/harvestRewards';
import type { Player } from '../services/api';
import type { AppPage } from '../types/navigation';
import { claimReward, completeMission, createMission, createReward, listMissions, listRewards, loadPlayer } from '../services/api';

const PERFECT_KEY = 'farminghabit.perfect-day';
const CELEBRATION_MS = 9000;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível falar com o servidor.';

export function HomePage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const [player, setPlayer] = useState<Player | null>(null);
  // Metas vêm do mesmo lugar que a aba Metas, para as duas telas mostrarem a mesma coisa
  const { goals, log, setAmount, addGoal, updateGoal } = useGoalTracker();
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const editingGoal = goals.find(goal => goal.id === editingGoalId);
  const today = useToday();
  const todayKey = toKey(today);
  const { accepted, abandon } = useAcceptedMissions();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Avisos de ação aparecem como toast
  const setAnnouncement = toast;
  const [dialogKind, setDialogKind] = useState<ItemKind | null>(null);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [buyingRewardId, setBuyingRewardId] = useState<string | null>(null);
  const purchaseLocked = useRef(false);
  const [perfectDate, setPerfectDate] = useState(() => { try { return localStorage.getItem(PERFECT_KEY); } catch { return null; } });
  const [celebrating, setCelebrating] = useState(false);
  const [wishIds] = useState(readWishes);
  const coins = player?.coins ?? 0;
  const catalog = rewards;

  // Horta: um canteiro por meta que cobra hoje (semanais já batidas na semana ficam de fora)
  const dueToday = goals.filter(goal => goal.frequency.kind === 'weekly'
    ? weekChecks(goal, log, today) < goal.frequency.timesPerWeek || isDoneOn(goal, log, today)
    : isScheduled(goal, today));
  const plots: GardenPlot[] = dueToday.slice(0, 15).map(goal => ({ id: goal.id, title: goal.title, progress: progressFor(goal, log, today), done: isDoneOn(goal, log, today) }));
  const perfectNow = dueToday.length > 0 && dueToday.every(goal => isDoneOn(goal, log, today));

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      const [userMissions, userRewards] = await Promise.all([listMissions(), listRewards()]);
      if (!active) return;
      setPlayer(user); setMissions(userMissions); setRewards(userRewards);
    })()
      .catch(error => { if (active) setLoadError(`Não foi possível carregar seu sítio: ${errorMessage(error)}`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Moedas/XP ganhos em outra parte (metas, baús) atualizam o jogador desta tela
  useEffect(() => {
    const onPlayer = (event: Event) => setPlayer((event as CustomEvent<Player>).detail);
    window.addEventListener(PLAYER_EVENT, onPlayer);
    return () => window.removeEventListener(PLAYER_EVENT, onPlayer);
  }, []);

  // Dia perfeito: no momento em que todas as metas de hoje ficam completas, chovem pétalas e o arco-íris
  // aparece por alguns segundos e some. Não repete ao recarregar a página; some na hora se alguma meta deixar de estar completa.
  const wasPerfect = useRef(perfectNow);
  useEffect(() => {
    const before = wasPerfect.current;
    wasPerfect.current = perfectNow;
    if (!perfectNow) { setCelebrating(false); return; }
    if (before) return;
    try { localStorage.setItem(PERFECT_KEY, todayKey); } catch { /* ignora */ }
    setPerfectDate(todayKey);
    setCelebrating(true);
    setAnnouncement('🌈 Dia perfeito! Todas as metas de hoje foram colhidas.');
    const timer = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    return () => window.clearTimeout(timer);
  }, [perfectNow, todayKey]);

  async function run(id: string, label: string, action: () => Promise<void>) {
    if (pendingId) return;
    setPendingId(id);
    try { await action(); }
    catch (error) { setAnnouncement(`${label}: ${errorMessage(error)}`); }
    finally { setPendingId(null); }
  }

  // Meta cumprida no dia: o servidor confere e paga (uma vez por dia) e as moedinhas voam da origem até o contador
  function payHarvest(goal: TrackedGoal, nextAmount: number, origin: Element) {
    if (!reachesHarvest(goal, log, todayKey, nextAmount)) return;
    requestHarvest(goal, todayKey)
      .then(result => { if (!result.coins && !result.xp) return; flyCoins(origin, result.coins); setAnnouncement(`${goal.title}: colhida! ${rewardLabel(result)}`); })
      .catch(error => setAnnouncement(`${goal.title}: colhida, mas as moedas não foram creditadas (${errorMessage(error)}).`));
  }

  /** Colher (no painel ou na horta): check único conclui o dia, quantidade soma um passo */
  function harvest(goal: TrackedGoal, origin: Element) {
    const amount = amountOn(goal, log, todayKey);
    const target = dailyTarget(goal);
    if (amount >= target) { setAnnouncement(`${goal.title}: já colhida hoje 🌻`); return false; }
    const next = goal.measure.kind === 'quantity' ? amount + goal.measure.step : 1;
    payHarvest(goal, next, origin);
    setAmount(goal.id, todayKey, next);
    if (next < target && goal.measure.kind === 'quantity') setAnnouncement(`${goal.title}: ${next}/${target} ${goal.measure.unit}.`);
    return true;
  }

  // Na horta: a fruta pula e as moedas voam até o contador
  function harvestFromGarden(goalId: string, origin: Element) {
    const goal = goals.find(item => item.id === goalId);
    if (!goal) return;
    harvest(goal, origin);
    setPoppedId(goalId);
    window.setTimeout(() => setPoppedId(current => current === goalId ? null : current), 900);
  }

  function plantGoal(goal: NewTrackedGoal) {
    addGoal(goal);
    setDialogKind(null);
    setAnnouncement(`${goal.title}: semente plantada na horta!`);
  }

  function completeFromHome(id: string, origin: Element) {
    const mission = missions.find(item => item.id === id);
    if (!mission || !player) return;
    run(id, mission.title, async () => {
      const result = await completeMission(id);
      recordAdventure(mission.title);
      abandon(id);
      setMissions(current => current.map(item => item.id === id ? { ...result.mission, rewarded: true } : item));
      setPlayer(current => current && { ...current, ...result.user });
      flyCoins(origin, mission.coins);
      setAnnouncement(`${mission.title}: concluída! +${mission.xp} XP e +${mission.coins} moedas.`);
    });
  }

  // O botão de moedas compra diretamente; a ref bloqueia cliques antes do próximo render.
  async function buyReward(id: string) {
    if (purchaseLocked.current) return;
    const reward = catalog.find(item => item.id === id);
    if (!reward || !player || coins < reward.price) return;
    purchaseLocked.current = true;
    setBuyingRewardId(id);
    try {
      const { remainingCoins } = await claimReward(reward.id);
      const updated = { ...player, coins: remainingCoins };
      setPlayer(updated);
      window.dispatchEvent(new CustomEvent<Player>(PLAYER_EVENT, { detail: updated }));
      setAnnouncement(`${reward.name} foi para suas compras! Aproveite.`);
    } catch (error) {
      setAnnouncement(`${reward.name}: ${errorMessage(error)}`);
    } finally {
      purchaseLocked.current = false;
      setBuyingRewardId(null);
    }
  }

  // Devolve se salvou: o modal só fecha em caso de sucesso e libera o botão em caso de erro
  async function addItem(item: NewItem): Promise<boolean> {
    if (!player) { setAnnouncement(`${item.title}: servidor indisponível, não foi possível salvar.`); return false; }
    try {
      if (item.kind === 'mission') { const created = await createMission(item); setMissions(current => [created, ...current]); }
      else { const created = await createReward(item.title, item.price); setRewards(current => [created, ...current]); }
      setAnnouncement(`${item.title}: ${item.kind === 'mission' ? 'missão pregada no quadro' : 'recompensa na vitrine'}!`);
      setDialogKind(null);
      return true;
    } catch (error) {
      setAnnouncement(`${item.title}: ${errorMessage(error)}`);
      return false;
    }
  }

  return <MainLayout page="home" onNavigate={onNavigate} world={<GameWorld player={player} coins={player ? coins : null} today={today} plots={plots}
    onHarvest={harvestFromGarden} poppedId={poppedId} perfectDay={perfectDate === todayKey} celebrating={celebrating}/>}>
    <div className="functional-panel">
      <GoalsPanel goals={goals} log={log} today={today} onCheck={(goal, origin)=>harvest(goal, origin)} onOpen={()=>onNavigate('goals')} onEdit={goal=>setEditingGoalId(goal.id)}/>
      <MissionsPanel missions={missions} accepted={accepted} loading={loading} error={loadError} pendingId={pendingId} onComplete={completeFromHome} onOpen={()=>onNavigate('missions')}/>
      <CoinsPanel coins={coins} rewards={catalog} wishIds={wishIds} buyingId={buyingRewardId} onBuy={buyReward} onOpen={()=>onNavigate('shop')}/>
    </div>
    <p role="status" className="world-status">{loadError || 'Toque nas plantinhas da horta para colher as metas de hoje.'}</p>
    <SeedFab onPick={setDialogKind}/>
    {dialogKind === 'goal' && <NewGoalDialog onSave={plantGoal} onClose={()=>setDialogKind(null)}/>}
    {editingGoal && <NewGoalDialog key={editingGoal.id} goal={editingGoal} onClose={()=>setEditingGoalId(null)}
      onSave={changes=>{ updateGoal(editingGoal.id, changes); setEditingGoalId(null); setAnnouncement(`${changes.title}: meta atualizada!`); }}/>}
    {dialogKind === 'mission' && <MissionDialog onSave={addItem} onClose={()=>setDialogKind(null)}/>}
    {dialogKind === 'reward' && <RewardDialog onSave={addItem} onClose={()=>setDialogKind(null)}/>}
  </MainLayout>;
}
