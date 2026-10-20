import { useState } from 'react';
import { GameWorld } from '../components/GameWorld';
import { GoalsPanel } from '../components/GoalsPanel';
import { MissionsPanel } from '../components/MissionsPanel';
import { CoinsPanel } from '../components/CoinsPanel';
import { initialWorldState, player } from '../data/world';
import { AddItemDialog } from '../components/AddItemDialog';
import type { ItemKind, NewItem } from '../types/world';
import { MainLayout } from '../layouts/MainLayout';
export function HomePage() {
  const [world, setWorld] = useState(initialWorldState);
  const [announcement, setAnnouncement] = useState('');
  const [dialogKind, setDialogKind] = useState<ItemKind | null>(null);
  const xp = player.xp + world.missions.filter(mission=>mission.rewarded).reduce((sum, mission)=>sum+mission.xp, 0);

  function toggleGoal(id: string) {
    setWorld(current=>({ ...current, goals: current.goals.map(goal=>goal.id === id ? { ...goal, completed: !goal.completed } : goal) }));
  }

  function toggleMission(id: string) {
    const mission = world.missions.find(item=>item.id === id);
    if (!mission) return;
    setWorld(current=>{
      const selected = current.missions.find(item=>item.id === id);
      if (!selected) return current;
      const firstCompletion = !selected.completed && !selected.rewarded;
      return { ...current, coins: current.coins + (firstCompletion ? selected.coins : 0), missions: current.missions.map(item=>item.id === id
        ? { ...item, completed: !item.completed, rewarded: item.rewarded || firstCompletion } : item) };
    });
    setAnnouncement(mission.completed ? `${mission.title}: missão reaberta. Recompensas já recebidas são mantidas.`
      : mission.rewarded ? `${mission.title}: concluída novamente, sem duplicar recompensas.`
      : `${mission.title}: concluída! Você ganhou ${mission.xp} XP e ${mission.coins} moedas.`);
  }

  function buyReward(id: string) {
    const reward = world.rewards.find(item=>item.id === id);
    if (!reward || world.purchasedRewardIds.includes(id) || world.coins < reward.price) return;
    setWorld(current=>current.purchasedRewardIds.includes(id) || current.coins < reward.price ? current : {
      ...current, coins: current.coins - reward.price, purchasedRewardIds: [...current.purchasedRewardIds, id],
    });
    setAnnouncement(`${reward.name} resgatado! Aproveite esse momento para você.`);
  }

  function addItem(item: NewItem) {
    const id = crypto.randomUUID();
    setWorld(current => {
      if (item.kind === 'goal') return { ...current, goals: [...current.goals, { id, title: item.title, description: item.description, detail: item.description, progress: 0, completed: false }] };
      if (item.kind === 'mission') return { ...current, missions: [...current.missions, { id, title: item.title, description: item.description, xp: item.xp, coins: item.coins, completed: false, rewarded: false }] };
      return { ...current, rewards: [...current.rewards, { id, name: item.title, price: item.price, icon: 'coffee' }] };
    });
    setAnnouncement(`${item.title}: ${item.kind === 'goal' ? 'meta adicionada' : item.kind === 'mission' ? 'missão adicionada' : 'compra adicionada'} ao seu jardim.`);
    setDialogKind(null);
  }

  return <MainLayout world={<GameWorld xp={xp}/>}>
    <div className="functional-panel">
      <GoalsPanel goals={world.goals} onToggle={toggleGoal} onAdd={()=>setDialogKind('goal')}/>
      <MissionsPanel missions={world.missions} onToggle={toggleMission} onAdd={()=>setDialogKind('mission')}/>
      <CoinsPanel coins={world.coins} rewards={world.rewards} purchasedIds={world.purchasedRewardIds} onBuy={buyReward} onAdd={()=>setDialogKind('reward')}/>
    </div>
    <p role="status" className="world-status">{announcement || 'Cada conquista tem o seu tempo. Continue cultivando.'}</p>
    {dialogKind && <AddItemDialog kind={dialogKind} onSave={addItem} onClose={()=>setDialogKind(null)}/>}
  </MainLayout>;
}
