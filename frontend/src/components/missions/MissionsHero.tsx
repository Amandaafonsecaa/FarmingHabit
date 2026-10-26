import { useEffect, useRef, useState } from 'react';
import { CHAPTERS, STOPS_PER_CHAPTER, journeyState } from '../../lib/journey';
import { CHEST_STOPS } from '../../lib/treasure';
import { toast } from '../../lib/toast';
import { PixelIcon } from '../PixelIcon';
import { WorldMap } from './WorldMap';
import { CoinHud } from '../home/CoinHud';
import { GuideDialog } from './GuideDialog';
import { loadPlayer } from '../../services/api';
import { readTreasure } from '../../lib/treasure';

/** Topo das Missões: placa minimalista, contador de moedas e o mapa-múndi da jornada */
export function MissionsHero({ completed, loading = false, openCount = 0, traveling = 0, activeMission, opened, unopened, onCreate, onOpenChest, coins }: {
  completed: number; loading?: boolean; openCount?: number; traveling?: number; activeMission: { id: string; title: string } | null;
  opened: string[]; unopened: number; onCreate: () => void; onFocusMission?: (id: string) => void; onOpenChest: (id?: string) => void; coins: number | null;
}) {
  const { loop, chapter, reached } = journeyState(completed);
  const [freshNode, setFreshNode] = useState<number | null>(null);
  const [clearingChapter, setClearingChapter] = useState<number | null>(null);
  const previous = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [talking, setTalking] = useState(false);
  const [playerName, setPlayerName] = useState('aventureira');
  // Nome do jogador para o Capitão cumprimentar
  useEffect(() => { let active = true; loadPlayer().then(player => { if (active) setPlayerName(player.name); }).catch(() => {}); return () => { active = false; }; }, []);

  // A cada missão cumprida: a parada nova aparece com "pop"; região nova abre as nuvens; avisos vão para o toast
  // (só depois de carregar: senão a contagem "salta" de 0 para o total e repete os avisos)
  useEffect(() => {
    if (loading) return;
    const before = previous.current;
    previous.current = completed;
    if (before === null || completed <= before) return;
    const was = journeyState(before);
    if (loop > was.loop) toast('A princesa foi salva! 👑 Começa uma nova jornada pelo Vale do Sítio.', 'info');
    else if (chapter > was.chapter) {
      setClearingChapter(chapter);
      setFreshNode(chapter * STOPS_PER_CHAPTER - 1);
      toast(`Nova região desbloqueada: ${CHAPTERS[chapter].name}! 🎁 E um baú grande te espera.`, 'info');
    } else {
      setFreshNode(chapter * STOPS_PER_CHAPTER + reached - 1);
      if (CHEST_STOPS[reached - 1]) toast('Você encontrou um baú! 🎁 Toque nele no mapa para abrir.', 'info');
    }
    const timer = window.setTimeout(() => { setFreshNode(null); setClearingChapter(null); }, 1800);
    return () => window.clearTimeout(timer);
  }, [completed, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // No celular o mapa rola de lado: começa centralizado na região atual
  useEffect(() => {
    const element = scrollRef.current;
    if (element && element.scrollWidth > element.clientWidth) element.scrollLeft = (element.scrollWidth * (chapter + 0.5)) / CHAPTERS.length - element.clientWidth / 2;
  }, [chapter]);

  return <section className="missions-hero is-world" aria-labelledby="missions-title">
    <div ref={scrollRef} className="world-map-scroll">
      <WorldMap chapter={chapter} reached={reached} loop={loop} heading={!!activeMission} freshNode={freshNode} clearingChapter={clearingChapter} opened={opened} onOpenChest={onOpenChest} onTalk={()=>setTalking(true)}/>
    </div>
    <div className="missions-hero-top">
      {/* Placa minimalista: só o título e o botão de nova missão */}
      <div className="missions-sign is-minimal pixel-frame">
        <h1 id="missions-title">Quadro de Missões</h1>
        <button type="button" className="pixel-button primary-button" onClick={onCreate}><PixelIcon name="plus" className="size-2.5"/>Nova missão</button>
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
