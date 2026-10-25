import { useEffect, useState } from 'react';
import { GameWorld } from '../components/GameWorld';
import { GoalsPanel } from '../components/GoalsPanel';
import { MissionsPanel } from '../components/MissionsPanel';
import { CoinsPanel } from '../components/CoinsPanel';
import { mockReward } from '../data/world';
import { MissionDialog } from '../components/dialogs/MissionDialog';
import { RewardDialog } from '../components/dialogs/RewardDialog';
import { NewGoalDialog } from '../components/goals/NewGoalDialog';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { amountOn, dailyTarget, toKey, todayStats } from '../lib/goalLogic';
import type { NewTrackedGoal, TrackedGoal } from '../types/goals';
import type { ItemKind, Mission, NewItem, Reward } from '../types/world';
import { MainLayout } from '../layouts/MainLayout';
import { recordAdventure } from '../lib/diary';
import { recordPurchase } from '../lib/shop';
import { PLAYER_EVENT, claimHarvest, creditPlayer, releaseHarvest, rewardLabel } from '../lib/harvestRewards';
import type { Player } from '../services/api';
import type { AppPage } from '../types/navigation';
import { claimReward, completeMission, createMission, createReward, deleteMission, listMissions, listRewards, loadPlayer, updateMission } from '../services/api';
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível falar com o servidor.';
export function HomePage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const [player, setPlayer] = useState<Player | null>(null);
  // Metas vêm do mesmo lugar que a aba Metas, para as duas telas mostrarem a mesma coisa
  const { goals, log, setAmount, addGoal } = useGoalTracker();
  const today = useToday();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [dialogKind, setDialogKind] = useState<ItemKind | null>(null);
  const { done: goalsDone, due: goalsDue } = todayStats(goals, log, today);
  // A compra mockada só desconta localmente do saldo vindo do backend
  const coins = (player?.coins ?? 0) - (purchasedIds.includes(mockReward.id) ? mockReward.price : 0);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      const [userMissions, userRewards] = await Promise.all([listMissions(user.id), listRewards(user.id)]);
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

  // Executa uma ação na API travando o item e anunciando erros
  async function run(id: string, label: string, action: () => Promise<void>) {
    if (pendingId) return;
    setPendingId(id);
    try { await action(); }
    catch (error) { setAnnouncement(`${label}: ${errorMessage(error)}`); }
    finally { setPendingId(null); }
  }

  // Meta cumprida no dia paga moedas e XP (uma vez por dia); a barra de XP e o saldo atualizam pelo PLAYER_EVENT
  function payHarvest(goal: TrackedGoal, nextAmount: number) {
    const reward = claimHarvest(goal, log, today, nextAmount);
    if (!reward) return;
    creditPlayer(reward.coins, reward.xp)
      .then(() => setAnnouncement(`${goal.title}: colhida! ${rewardLabel(reward)}`))
      .catch(() => { releaseHarvest(reward); setAnnouncement(`${goal.title}: colhida, mas o servidor está fora do ar e as moedas não foram creditadas.`); });
  }

  // Check único alterna o dia de hoje; quantidade soma um passo (o controle completo fica na aba Metas)
  function checkGoal(goal: TrackedGoal) {
    const key = toKey(today);
    const amount = amountOn(goal, log, key);
    if (goal.measure.kind === 'quantity') {
      const next = amount + goal.measure.step;
      payHarvest(goal, next);
      setAmount(goal.id, key, next);
      setAnnouncement(next >= dailyTarget(goal) && amount < dailyTarget(goal) ? `${goal.title}: meta do dia colhida!` : `${goal.title}: ${next}/${dailyTarget(goal)} ${goal.measure.unit}.`);
      return;
    }
    if (amount < 1) payHarvest(goal, 1);
    setAmount(goal.id, key, amount >= 1 ? 0 : 1);
    setAnnouncement(`${goal.title}: ${amount >= 1 ? 'marcação de hoje desfeita.' : 'colhida hoje!'}`);
  }

  function plantGoal(goal: NewTrackedGoal) {
    addGoal(goal);
    setDialogKind(null);
    setAnnouncement(`${goal.title}: semente plantada!`);
  }

  function replaceMission(updated: Mission) {
    setMissions(current=>current.map(item=>item.id === updated.id ? { ...updated, rewarded: item.rewarded || updated.rewarded } : item));
  }

  function toggleMission(id: string) {
    const mission = missions.find(item=>item.id === id);
    if (!mission || !player) return;
    run(id, mission.title, async () => {
      if (mission.completed) {
        replaceMission(await updateMission(id, { completed: false }));
        setAnnouncement(`${mission.title}: missão reaberta. Recompensas já recebidas são mantidas.`);
        return;
      }
      const result = await completeMission(id, player.id);
      recordAdventure(mission.title);
      replaceMission(result.mission);
      setPlayer(current=>current && { ...current, ...result.user });
      setAnnouncement(`${mission.title}: concluída! Você ganhou ${mission.xp} XP e ${mission.coins} moedas.`);
    });
  }

  function removeMission(id: string) {
    const mission = missions.find(item=>item.id === id);
    if (!mission || !window.confirm(`Apagar a missão "${mission.title}"?`)) return;
    run(id, mission.title, async () => {
      await deleteMission(id);
      setMissions(current=>current.filter(item=>item.id !== id));
      setAnnouncement(`${mission.title}: missão apagada.`);
    });
  }

  function buyReward(id: string) {
    const reward = [mockReward, ...rewards].find(item=>item.id === id);
    if (!reward || !player || purchasedIds.includes(id) || coins < reward.price) return;
    if (reward.mock) {
      setPurchasedIds(current=>[...current, id]);
      setAnnouncement(`${reward.name} resgatado! Aproveite esse momento para você.`);
      return;
    }
    run(id, reward.name, async () => {
      const { remainingCoins } = await claimReward(id, player.id);
      recordPurchase(id, reward.name, reward.price);
      setPlayer(current=>current && { ...current, coins: remainingCoins });
      setPurchasedIds(current=>[...current, id]);
      setAnnouncement(`${reward.name} resgatado! Aproveite esse momento para você.`);
    });
  }

  // Devolve se salvou: o modal só fecha em caso de sucesso e libera o botão em caso de erro
  async function addItem(item: NewItem): Promise<boolean> {
    if (!player) { setAnnouncement(`${item.title}: servidor indisponível, não foi possível salvar.`); return false; }
    try {
      if (item.kind === 'mission') { const created = await createMission(player.id, item); setMissions(current=>[created, ...current]); }
      else { const created = await createReward(player.id, item.title, item.price); setRewards(current=>[created, ...current]); }
      setAnnouncement(`${item.title}: ${item.kind === 'mission' ? 'missão adicionada' : 'compra adicionada'} ao seu jardim.`);
      setDialogKind(null);
      return true;
    } catch (error) {
      setAnnouncement(`${item.title}: ${errorMessage(error)}`);
      return false;
    }
  }

  return <MainLayout page="home" onNavigate={onNavigate} world={<GameWorld player={player} today={today} goalsDone={goalsDone} goalsDue={goalsDue}/>}>
    <div className="functional-panel">
      <GoalsPanel goals={goals} log={log} today={today} onCheck={checkGoal} onAdd={()=>setDialogKind('goal')} onOpen={()=>onNavigate('goals')}/>
      <MissionsPanel missions={missions} loading={loading} error={loadError} pendingId={pendingId} onToggle={toggleMission} onDelete={removeMission} onAdd={()=>setDialogKind('mission')} onOpen={()=>onNavigate('missions')}/>
      <CoinsPanel coins={coins} rewards={[mockReward, ...rewards]} purchasedIds={purchasedIds} onBuy={buyReward} onAdd={()=>setDialogKind('reward')} onOpen={()=>onNavigate('shop')}/>
    </div>
    <p role="status" className="world-status">{announcement || loadError || 'Cada conquista tem o seu tempo. Continue cultivando.'}</p>
    {dialogKind === 'goal' && <NewGoalDialog onSave={plantGoal} onClose={()=>setDialogKind(null)}/>}
    {dialogKind === 'mission' && <MissionDialog onSave={addItem} onClose={()=>setDialogKind(null)}/>}
    {dialogKind === 'reward' && <RewardDialog onSave={addItem} onClose={()=>setDialogKind(null)}/>}
  </MainLayout>;
}
