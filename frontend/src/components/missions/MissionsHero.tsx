import { useEffect, useRef, useState } from 'react';
import { CHAPTERS, JOURNEY_LENGTH, STOPS_PER_CHAPTER, journeyState } from '../../lib/journey';
import { CHEST_STOPS } from '../../lib/treasure';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { JourneyMap, type MapChest } from './JourneyMap';
import { CoinHud } from '../home/CoinHud';

interface Banner { title: string; text: string }

export function MissionsHero({ completed, openCount, traveling, activeMission, opened, unopened, onCreate, onFocusMission, onOpenChest, coins }: {
  completed: number; openCount: number; traveling: number; activeMission: { id: string; title: string } | null;
  opened: string[]; unopened: number; onCreate: () => void; onFocusMission: (id: string) => void; onOpenChest: (id?: string) => void; coins: number | null;
}) {
  const { loop, chapter, reached } = journeyState(completed);
  const [viewing, setViewing] = useState<number | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [freshStop, setFreshStop] = useState<number | null>(null);
  const previous = useRef<number | null>(null);

  // Reage a cada missão cumprida: revela a parada, anuncia capítulo novo ou o resgate da princesa
  useEffect(() => {
    const before = previous.current;
    previous.current = completed;
    if (before === null || completed <= before) return;
    const was = journeyState(before);
    const lastStop = CHAPTERS[was.chapter].stops[STOPS_PER_CHAPTER - 1].name;
    setViewing(null);
    if (loop > was.loop) setBanner({ title: 'A princesa foi salva! 👑', text: `Começa a jornada ${loop}. E no fim do castelo, um baú grande te espera!` });
    else if (chapter > was.chapter) setBanner({ title: `Capítulo ${chapter + 1}: ${CHAPTERS[chapter].name}`, text: `Depois de passar por ${lastStop}, você achou um baú grande! 🎁` });
    else {
      setFreshStop(reached - 1);
      if (CHEST_STOPS[reached - 1]) setBanner({ title: 'Um baú apareceu! 🎁', text: 'Toque no baú brilhando no mapa para abrir.' });
    }
    const timer = window.setTimeout(() => { setBanner(null); setFreshStop(null); }, 3400);
    return () => window.clearTimeout(timer);
  }, [completed]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = viewing ?? chapter;
  const isCurrent = shown === chapter;
  const canView = (index: number) => index <= chapter || loop > 1;
  const within = completed % JOURNEY_LENGTH;
  const shownReached = isCurrent ? reached : STOPS_PER_CHAPTER;
  // Baús do capítulo exibido: só os da volta atual (capítulos já vistos em voltas anteriores aparecem como abertos)
  const mapChests: MapChest[] = Object.entries(CHEST_STOPS).map(([stop, size]) => {
    const index = Number(stop);
    const id = `${shown <= chapter ? loop : loop - 1}:${shown}:${index}`;
    const found = index < shownReached;
    return { stop: index, id, size, state: !found ? 'hidden' : opened.includes(id) ? 'opened' : 'ready' };
  });

  return <section className="missions-hero" aria-labelledby="missions-title">
    <JourneyMap chapterIndex={shown} reached={shownReached} heading={isCurrent && !!activeMission} showExplorer={isCurrent} freshStop={isCurrent ? freshStop : null} loop={loop} chests={mapChests} onOpenChest={onOpenChest}/>
    {unopened > 0 && <button type="button" className="chest-alert pixel-frame" onClick={()=>onOpenChest()}><span aria-hidden="true">🎁</span>{unopened} {unopened === 1 ? 'baú para abrir' : 'baús para abrir'}</button>}

    <div className="missions-hero-top">
      <div className="missions-sign pixel-frame">
        <p className="eyebrow">Jornada {loop} · Capítulo {chapter + 1} de {CHAPTERS.length}</p>
        <h1 id="missions-title">Quadro de Missões</h1>
        <p className="journey-chapter">{CHAPTERS[chapter].name} · {reached}/{STOPS_PER_CHAPTER} descobertas</p>
        <ProgressBar value={within / JOURNEY_LENGTH * 100} label={`Jornada: ${within} de ${JOURNEY_LENGTH} missões até a princesa`} className="mt-2 h-2.5"/>
        {activeMission
          ? <button type="button" className="journey-heading" onClick={()=>onFocusMission(activeMission.id)}><span className="footsteps" aria-hidden="true"><span/><span/><span/></span>Em jornada: <strong>{activeMission.title}</strong></button>
          : <p className="missions-motto">Próxima parada: um mistério te espera… Parta numa missão!</p>}
        <button type="button" className="pixel-button primary-button" onClick={onCreate}><PixelIcon name="plus" className="size-2.5"/>Nova missão</button>
      </div>
      <dl className="goals-stats">
        <div className="hero-stat pixel-frame"><dt>Em aberto</dt><dd>{openCount}</dd></div>
        <div className="hero-stat pixel-frame"><dt>Em jornada</dt><dd>{traveling}</dd></div>
        <div className="hero-stat pixel-frame"><dt>Descobertas</dt><dd>{completed}</dd></div>
      </dl>
    </div>

    <CoinHud coins={coins} className="hero-coin-hud is-map"/>
    <nav className="chapter-tabs" aria-label="Capítulos da jornada">
      {CHAPTERS.map((item, index) => {
        const state = index < chapter || (loop > 1 && index > chapter) ? 'done' : index === chapter ? 'current' : 'locked';
        return <button key={item.name} type="button" className={`chapter-tab is-${state} ${shown === index ? 'is-viewing' : ''}`} disabled={!canView(index)}
          aria-pressed={shown === index} onClick={()=>setViewing(index === chapter ? null : index)} title={canView(index) ? item.name : 'Ainda não descoberto'}>
          <span className="chapter-number">{state === 'locked' ? '🔒' : state === 'done' ? '✓' : index + 1}</span>
          <span className="chapter-name">{canView(index) ? item.name : '???'}</span>
        </button>;
      })}
    </nav>

    {banner && <div className="journey-banner pixel-frame" role="status"><p className="journey-banner-title">{banner.title}</p><p>{banner.text}</p></div>}
  </section>;
}
