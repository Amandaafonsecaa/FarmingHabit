import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { MissionsHero } from '../components/missions/MissionsHero';
import { QuestScroll } from '../components/missions/QuestScroll';
import { AdventureDiary } from '../components/missions/AdventureDiary';
import { MissionDialog } from '../components/dialogs/MissionDialog';
import { PixelIcon } from '../components/PixelIcon';
import { useAcceptedMissions, useMissionBoard } from '../hooks/useMissionBoard';
import type { NewItem } from '../types/world';
import { recordAdventure } from '../lib/diary';
import type { AppPage } from '../types/navigation';

const CELEBRATION_MS = 1700;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível falar com o servidor.';

export function MissionsPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const board = useMissionBoard();
  const { accepted, accept, abandon } = useAcceptedMissions();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // A missão sendo comemorada fica no quadro até o carimbo terminar, depois vai para o diário
  const open = board.missions.filter(mission => !mission.completed || mission.id === celebratingId)
    .sort((a, b) => Number(accepted.includes(b.id)) - Number(accepted.includes(a.id)));
  const done = board.missions.filter(mission => mission.completed && mission.id !== celebratingId);
  const stillOpen = open.filter(mission => !mission.completed);

  async function run(id: string, label: string, action: () => Promise<void>) {
    if (pendingId) return;
    setPendingId(id);
    try { await action(); }
    catch (error) { setAnnouncement(`${label}: ${errorMessage(error)}`); }
    finally { setPendingId(null); }
  }

  function complete(id: string, title: string, xp: number, coins: number) {
    run(id, title, async () => {
      await board.complete(id);
      recordAdventure(title);
      setCelebratingId(id);
      setAnnouncement(`${title}: missão cumprida! +${xp} XP e +${coins} moedas.`);
      window.setTimeout(() => { setCelebratingId(null); setFreshId(id); abandon(id); }, CELEBRATION_MS);
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
    world={<MissionsHero completed={board.missions.filter(mission => mission.completed).length} openCount={stillOpen.length}
      traveling={stillOpen.filter(mission => accepted.includes(mission.id)).length} activeMission={stillOpen.find(mission => accepted.includes(mission.id)) ?? null}
      onCreate={()=>setDialogOpen(true)} onFocusMission={focusQuest}/>}>
    <div className="missions-layout">
      <section className="world-panel pixel-frame quest-board-panel" aria-labelledby="board-heading">
        <header className="panel-heading"><h2 id="board-heading"><PixelIcon name="mission" className="size-5"/>Quadro de aventuras</h2><span className="panel-tag">{open.length} em aberto</span></header>
        <div className="quest-board">
          {board.loading && <p className="quest-board-note">Desenrolando os pergaminhos…</p>}
          {board.error && <p role="alert" className="quest-board-note is-error">Não foi possível carregar as missões: {board.error}</p>}
          {!board.loading && !board.error && open.length === 0 && <div className="quest-board-note">
            <p>Nenhuma missão no quadro. Viu algo curioso hoje?</p>
            <button type="button" className="pixel-button primary-button mt-3" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Transformar em missão</button>
          </div>}
          <ul className="quest-list">{open.map((mission, index) => <QuestScroll key={mission.id} mission={mission} index={index}
            active={accepted.includes(mission.id)} pending={pendingId === mission.id} celebrating={celebratingId === mission.id} highlighted={highlightId === mission.id}
            onAccept={()=>{ accept(mission.id); setAnnouncement(`${mission.title}: pé na estrada! Boa aventura.`); }}
            onAbandon={()=>{ abandon(mission.id); setAnnouncement(`${mission.title}: fica para outro dia.`); }}
            onComplete={()=>complete(mission.id, mission.title, mission.xp, mission.coins)}
            onRemove={()=>remove(mission.id, mission.title)}/>)}</ul>
        </div>
      </section>
      <AdventureDiary entries={done} freshId={freshId}/>
    </div>
    <p role="status" className="world-status">{announcement || 'Toda grande descoberta começa com uma pequena curiosidade.'}</p>
    {dialogOpen && <MissionDialog onSave={create} onClose={()=>setDialogOpen(false)}/>}
  </MainLayout>;
}
