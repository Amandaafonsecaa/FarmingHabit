import { useState } from 'react';
import { toast } from '../lib/toast';
import { MainLayout } from '../layouts/MainLayout';
import { MissionsHero } from '../components/missions/MissionsHero';
import { QuestScroll } from '../components/missions/QuestScroll';
import { EditMissionDialog } from '../components/dialogs/EditMissionDialog';
import { MissionDialog } from '../components/dialogs/MissionDialog';
import { PixelIcon } from '../components/PixelIcon';
import { useAcceptedMissions, useMissionBoard } from '../hooks/useMissionBoard';
import type { Mission, NewItem } from '../types/world';
import { recordAdventure } from '../lib/diary';
import { foundChests, readTreasure, rollLoot, saveOpenedChest, type FoundChest } from '../lib/treasure';
import { ChestOpening } from '../components/missions/ChestOpening';
import { CollectionPanel } from '../components/missions/CollectionPanel';
import { flyCoins } from '../lib/coinFlight';
import type { AppPage } from '../types/navigation';

const CELEBRATION_MS = 2700;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível falar com o servidor.';

export function MissionsPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const board = useMissionBoard();
  const { accepted, accept, abandon } = useAcceptedMissions();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Mission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Avisos de ação aparecem como toast
  const setAnnouncement = toast;
  const [treasure, setTreasure] = useState(readTreasure);
  const [openingChest, setOpeningChest] = useState<FoundChest | null>(null);

  // Cumpridas continuam no quadro com o carimbo, abaixo das em aberto (as em jornada vêm primeiro).
  // A que está sendo comemorada fica no lugar até o carimbo terminar
  const open = board.missions.filter(mission => !mission.completed || mission.id === celebratingId)
    .sort((a, b) => Number(accepted.includes(b.id)) - Number(accepted.includes(a.id)));
  const done = board.missions.filter(mission => mission.completed && mission.id !== celebratingId);
  const stillOpen = open.filter(mission => !mission.completed);
  const completedCount = board.missions.filter(mission => mission.completed).length;
  const chests = foundChests(completedCount);
  const unopened = chests.filter(chest => !treasure.opened.includes(chest.id));

  // Abre o baú: sorteia, credita moedas/XP no servidor e só então marca como aberto (se falhar, dá para tentar de novo)
  async function openChest(chest: FoundChest) {
    const loot = rollLoot(chest);
    const coins = loot.reduce((sum, item) => sum + (item.kind === 'coins' ? item.amount : 0), 0);
    const xp = loot.reduce((sum, item) => sum + (item.kind === 'xp' ? item.amount : 0), 0);
    await board.grant(coins, xp);
    setTreasure(current => saveOpenedChest(current, chest.id, loot));
    setAnnouncement(`Baú aberto! +${coins} moedas${xp ? ` e +${xp} XP` : ''}.`);
    return loot;
  }

  function showChest(id?: string) {
    const chest = id ? unopened.find(item => item.id === id) : unopened[0];
    if (chest) setOpeningChest(chest);
  }

  async function run(id: string, label: string, action: () => Promise<void>) {
    if (pendingId) return;
    setPendingId(id);
    try { await action(); }
    catch (error) { setAnnouncement(`${label}: ${errorMessage(error)}`); }
    finally { setPendingId(null); }
  }

  function complete(id: string, title: string, xp: number, coins: number, origin: Element) {
    run(id, title, async () => {
      await board.complete(id);
      flyCoins(origin, coins);
      recordAdventure(title);
      setCelebratingId(id);
      setAnnouncement(`${title}: missão cumprida! +${xp} XP e +${coins} moedas.`);
      window.setTimeout(() => { setCelebratingId(null); abandon(id); }, CELEBRATION_MS);
    });
  }

  function remove(id: string, title: string) {
    if (!window.confirm(`Rasgar a missão "${title}" do quadro?`)) return;
    run(id, title, async () => { await board.remove(id); abandon(id); setAnnouncement(`${title}: missão rasgada.`); });
  }

  async function create(item: Extract<NewItem, { kind: 'mission' }>) {
    try {
      await board.create(item);
      setDialogOpen(false);
      setAnnouncement(`${item.title}: nova missão pregada no quadro!`);
      return true;
    } catch (error) {
      setAnnouncement(`${item.title}: ${errorMessage(error)}`);
      return false;
    }
  }

  // Clicar em "Em jornada" no mapa rola até o pergaminho e o faz balançar
  function focusQuest(id: string) {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`quest-${id}`)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
    setHighlightId(id);
    window.setTimeout(() => setHighlightId(current => current === id ? null : current), 1400);
  }

  return <MainLayout page="missions" onNavigate={onNavigate}
    world={<MissionsHero completed={completedCount} loading={board.loading} openCount={stillOpen.length} opened={treasure.opened} unopened={unopened.length} onOpenChest={showChest} coins={board.player?.coins ?? null}
      traveling={stillOpen.filter(mission => accepted.includes(mission.id)).length} activeMission={stillOpen.find(mission => accepted.includes(mission.id)) ?? null}
      onCreate={()=>setDialogOpen(true)} onFocusMission={focusQuest}/>}>
    <div className="missions-layout">
      <section className="world-panel pixel-frame quest-board-panel" aria-labelledby="board-heading">
        <header className="panel-heading"><h2 id="board-heading"><PixelIcon name="mission" className="size-5"/>Quadro de aventuras</h2><span className="panel-tag">{stillOpen.length} em aberto</span></header>
        <div className="quest-board">
          {board.loading && <p className="quest-board-note">Desenrolando os pergaminhos…</p>}
          {board.error && <p role="alert" className="quest-board-note is-error">Não foi possível carregar as missões: {board.error}</p>}
          {!board.loading && !board.error && open.length === 0 && <div className="quest-board-note">
            <p>Nenhuma missão no quadro. Viu algo curioso hoje?</p>
            <button type="button" className="pixel-button primary-button mt-3" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Transformar em missão</button>
          </div>}
          {open.length > 0 && <ul className="quest-list">{open.map((mission, index) => <QuestScroll key={mission.id} mission={mission} index={index}
            completed={mission.completed && mission.id !== celebratingId} active={accepted.includes(mission.id)} pending={pendingId === mission.id} celebrating={celebratingId === mission.id} highlighted={highlightId === mission.id}
            onOpen={()=>{ if (!pendingId && !celebratingId) setEditing(mission); }}
            onAccept={()=>{ accept(mission.id); setAnnouncement(`${mission.title}: pé na estrada! Boa aventura.`); }}
            onAbandon={()=>{ abandon(mission.id); setAnnouncement(`${mission.title}: fica para outro dia.`); }}
            onComplete={origin=>complete(mission.id, mission.title, mission.xp, mission.coins, origin)}
            onRemove={()=>remove(mission.id, mission.title)}/>)}</ul>}
          {/* Divisor discreto entre o que falta fazer e o que já foi cumprido */}
          {done.length > 0 && <>
            <p className="quest-divider"><span>Cumpridas · {done.length}</span></p>
            <ul className="quest-list">{done.map((mission, index) => <QuestScroll key={mission.id} mission={mission} index={index + open.length}
            completed={mission.completed && mission.id !== celebratingId} active={accepted.includes(mission.id)} pending={pendingId === mission.id} celebrating={celebratingId === mission.id} highlighted={highlightId === mission.id}
            onOpen={()=>{ if (!pendingId && !celebratingId) setEditing(mission); }}
            onAccept={()=>{ accept(mission.id); setAnnouncement(`${mission.title}: pé na estrada! Boa aventura.`); }}
            onAbandon={()=>{ abandon(mission.id); setAnnouncement(`${mission.title}: fica para outro dia.`); }}
            onComplete={origin=>complete(mission.id, mission.title, mission.xp, mission.coins, origin)}
            onRemove={()=>remove(mission.id, mission.title)}/>)}</ul>
          </>}
        </div>
      </section>
      <div className="missions-side"><CollectionPanel collection={treasure.collection}/></div>
    </div>
    <p role="status" className="world-status">{'Toda grande descoberta começa com uma pequena curiosidade.'}</p>
    {editing && <EditMissionDialog key={editing.id} mission={editing} active={accepted.includes(editing.id)} onClose={()=>setEditing(null)}
      onSave={async changes=>{ await board.edit(editing.id, changes); setAnnouncement(`${changes.title}: missão atualizada!`); }}
      onUncomplete={async ()=>{ await board.uncomplete(editing.id); setAnnouncement(`${editing.title}: missão desfeita. -${editing.xp} XP e -${editing.coins} moedas.`); }}/>}
    {dialogOpen && <MissionDialog onSave={create} onClose={()=>setDialogOpen(false)}/>}
    {openingChest && <ChestOpening key={openingChest.id} chest={openingChest} remaining={unopened.filter(chest => chest.id !== openingChest.id).length} onOpen={openChest} onClose={()=>setOpeningChest(null)}/>}
  </MainLayout>;
}
