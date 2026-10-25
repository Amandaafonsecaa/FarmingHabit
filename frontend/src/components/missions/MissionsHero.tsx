import { useEffect, useRef, useState } from 'react';
import { CHAPTERS, JOURNEY_LENGTH, STOPS_PER_CHAPTER, journeyState } from '../../lib/journey';
import { PixelIcon } from '../PixelIcon';
import { ProgressBar } from '../ProgressBar';
import { JourneyMap } from './JourneyMap';

interface Banner { title: string; text: string }

export function MissionsHero({ completed, openCount, traveling, activeMission, onCreate, onFocusMission }: {
  completed: number; openCount: number; traveling: number; activeMission: { id: string; title: string } | null;
  onCreate: () => void; onFocusMission: (id: string) => void;
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
    if (loop > was.loop) setBanner({ title: 'A princesa foi salva! 👑', text: `Começa a jornada ${loop}: de volta ao Vale do Sítio, com novas aventuras.` });
    else if (chapter > was.chapter) setBanner({ title: `Capítulo ${chapter + 1}: ${CHAPTERS[chapter].name}`, text: `Depois de passar por ${lastStop}, uma nova terra se abre.` });
    else setFreshStop(reached - 1);
    const timer = window.setTimeout(() => { setBanner(null); setFreshStop(null); }, 3400);
    return () => window.clearTimeout(timer);
  }, [completed]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = viewing ?? chapter;
  const isCurrent = shown === chapter;
  const canView = (index: number) => index <= chapter || loop > 1;
  const within = completed % JOURNEY_LENGTH;

  return <section className="missions-hero" aria-labelledby="missions-title">
    <JourneyMap chapterIndex={shown} reached={isCurrent ? reached : STOPS_PER_CHAPTER} heading={isCurrent && !!activeMission} showExplorer={isCurrent} freshStop={isCurrent ? freshStop : null} loop={loop}/>

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
