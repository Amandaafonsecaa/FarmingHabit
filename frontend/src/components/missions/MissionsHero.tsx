import { useEffect, useRef, useState } from 'react';
import { CHAPTERS, STOPS_PER_CHAPTER, journeyState } from '../../lib/journey';
import { CHEST_STOPS } from '../../lib/treasure';
import { toast } from '../../lib/toast';
import { WorldMap } from './WorldMap';
import { MapAtmosphere } from './MapAtmosphere';
import { MAP_W, PIXEL_WORLDS } from './pixelWorlds';
import { CoinHud } from '../home/CoinHud';
import { GuideDialog } from './GuideDialog';
import { loadPlayer } from '../../services/api';
import { readTreasure } from '../../lib/treasure';

/** Topo das Missões: placa minimalista, contador de moedas e o mapa-múndi da jornada */
export function MissionsHero({ completed, loading = false, openCount = 0, traveling = 0, activeMission, opened, unopened, onOpenChest, coins }: {
  completed: number; loading?: boolean; openCount?: number; traveling?: number; activeMission: { id: string; title: string } | null;
  opened: string[]; unopened: number; onFocusMission?: (id: string) => void; onOpenChest: (id?: string) => void; coins: number | null;
}) {
  const { loop, chapter, reached } = journeyState(completed);
  const [freshNode, setFreshNode] = useState<number | null>(null);
  const previous = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [talking, setTalking] = useState(false);
  // Mundo mostrado no mapa: o atual, ou um já visitado escolhido pelas setinhas da placa
  const [world, setWorld] = useState(chapter);
  useEffect(() => { setWorld(chapter); }, [chapter]);
  const [playerName, setPlayerName] = useState('aventureira');
  // Nome do jogador para o Capitão cumprimentar
  useEffect(() => { let active = true; loadPlayer().then(player => { if (active) setPlayerName(player.name); }).catch(() => {}); return () => { active = false; }; }, []);

  // A cada missão cumprida: a parada nova aparece com "pop"; mundo novo se desenha no mapa; avisos vão para o toast
  // (só depois de carregar: senão a contagem "salta" de 0 para o total e repete os avisos)
  useEffect(() => {
    if (loading) return;
    const before = previous.current;
    previous.current = completed;
    if (before === null || completed <= before) return;
    const was = journeyState(before);
    if (loop > was.loop) toast('A princesa foi salva! 👑 Começa uma nova jornada pelo Vale do Sítio.', 'info');
    else if (chapter > was.chapter) {
      toast(`Novo mundo: ${CHAPTERS[chapter].name}! 🎁 E um baú grande te espera.`, 'info');
    } else {
      setFreshNode(chapter * STOPS_PER_CHAPTER + reached - 1);
      if (CHEST_STOPS[reached - 1]) toast('Você encontrou um baú! 🎁 Toque nele no mapa para abrir.', 'info');
    }
    const timer = window.setTimeout(() => setFreshNode(null), 1800);
    return () => window.clearTimeout(timer);
  }, [completed, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // No celular o mapa rola de lado: começa centralizado onde a exploradora está
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || element.scrollWidth <= element.clientWidth) return;
    const { start, nodes } = PIXEL_WORLDS[world];
    const x = world === chapter && reached > 0 ? nodes[reached - 1][0] : world === chapter ? start[0] : MAP_W / 2;
    element.scrollLeft = element.scrollWidth * x / MAP_W - element.clientWidth / 2;
  }, [world, chapter, reached]);

  return <section className="missions-hero is-world" aria-labelledby="missions-title">
    <div ref={scrollRef} className="world-map-scroll">
      <WorldMap world={world} chapter={chapter} reached={reached} loop={loop} heading={!!activeMission} freshNode={freshNode} opened={opened} onOpenChest={onOpenChest} onTalk={()=>setTalking(true)}/>
    </div>
    <MapAtmosphere/>
    <div className="missions-hero-top">
      {/* Placa minimalista com o título da página */}
      <div className="missions-sign is-minimal pixel-frame">
        <h1 id="missions-title">Quadro de Missões</h1>
      </div>
      {/* Placa com o nome do mundo: fora do mapa, para estar sempre visível; setinhas levam aos mundos já visitados */}
      <div className="world-title pixel-frame">
        <button type="button" className="world-arrow" disabled={world === 0} onClick={()=>setWorld(world - 1)} aria-label="Mundo anterior">◀</button>
        <p><strong>{CHAPTERS[world].name}</strong>{loop > 1 && <small>Jornada {loop}</small>}</p>
        <button type="button" className="world-arrow" disabled={world >= chapter} onClick={()=>setWorld(world + 1)} aria-label="Próximo mundo">▶</button>
      </div>
      <CoinHud coins={coins} className="hero-coin-hud"/>
    </div>
    {unopened > 0 && <button type="button" className="chest-alert pixel-frame" onClick={()=>onOpenChest()}><span aria-hidden="true">🎁</span>{unopened} {unopened === 1 ? 'baú para abrir' : 'baús para abrir'}</button>}
    {/* Para teclado e leitores de tela: aparece só quando recebe foco */}
    <button type="button" className="talk-sr-button sr-only focus:not-sr-only" onClick={()=>setTalking(true)}>Conversar com o Capitão Bússola</button>
    {talking && <GuideDialog onClose={()=>setTalking(false)} context={{
      name: playerName, completed, openMissions: openCount, traveling, unopened,
      found: Object.keys(readTreasure().collection).length,
    }}/>}
  </section>;
}
