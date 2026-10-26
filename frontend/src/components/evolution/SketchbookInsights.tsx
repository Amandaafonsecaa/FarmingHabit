import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { areaLabel } from '../../lib/goalAreas';
import type { GoalArea } from '../../types/goals';
import { areasThisWeek, bestArea, bestDayThisWeek, tipArea } from '../../lib/weekMetrics';

const INK = '#3b2418';

/** Desenho a nanquim: traço levemente trêmulo (filtro), contornos soltos e hachuras */
function Sketch({ children, className = '', label }: { children: ReactNode; className?: string; label?: string }) {
  return <svg className={`sketch ${className}`} viewBox="0 0 80 80" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <g filter="url(#ink-hand)" fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">{children}</g>
  </svg>;
}

const hatch = (x: number, y: number, count: number, gap: number, length: number) =>
  Array.from({ length: count }, (_, i) => `M${x + i * gap} ${y}l${length * .6} ${length}`).join('');

/** Xícara de café com vapor */
const Coffee = () => <Sketch>
  <ellipse cx="38" cy="38" rx="20" ry="4.5" fill="#8a5838" fillOpacity=".18"/>
  <path d="M18 38c0 17 7 27 20 27s20-10 20-27"/><path d="M58 43c10-2 12 11-1 13"/>
  <path d="M9 66c11 6 47 6 58 0M14 64c14 3 38 3 50 0" strokeWidth="1"/>
  <path d={hatch(45, 44, 5, 2.6, 14)} strokeWidth=".7" opacity=".7"/>
  <path d="M30 30c-4-6 4-10 0-16M40 31c-4-8 4-12 0-20" strokeWidth=".9" opacity=".75"/>
</Sketch>;

/** Brotinho num vaso de barro */
const Sprout = () => <Sketch>
  <path d="M24 52h32l-4 20H28Z" fill="#bf5837" fillOpacity=".16"/><path d="M22 46h36v6H22Z"/>
  <path d={hatch(44, 54, 4, 2.4, 14)} strokeWidth=".7" opacity=".7"/>
  <path d="M40 46c0-10-2-16 0-24"/>
  <path d="M40 32c-10-4-14-12-10-16 6 2 10 8 10 16Z" fill="#72ad32" fillOpacity=".18"/>
  <path d="M40 27c8-6 16-4 16 0-4 4-10 4-16 2Z" fill="#72ad32" fillOpacity=".18"/>
  <path d="M34 22l3 5M47 25l-4 1" strokeWidth=".7"/>
</Sketch>;

/** Pazinha de jardim */
const Trowel = () => <Sketch>
  <path d="M22 58c-7-8-3-20 7-22 8 5 6 17-7 22Z" fill="#8d8fa0" fillOpacity=".15"/>
  <path d="M24 54l6-14" strokeWidth=".8"/><path d="M31 38l15-16"/>
  <path d="M44 20l5-5c3-3 7 1 4 4l-5 5c-3 3-7-1-4-4Z" fill="#a86b35" fillOpacity=".2"/>
  <path d={hatch(46, 17, 3, 2, 5)} strokeWidth=".7"/>
</Sketch>;

/** Cestinha de colheita */
const Basket = () => <Sketch>
  <path d="M20 44c0-22 40-22 40 0"/>
  <path d="M27 38a5 5 0 1 1 .1 0M38 36a5 5 0 1 1 .1 0M49 38a5 5 0 1 1 .1 0" fill="#bf5837" fillOpacity=".18"/>
  <path d="M14 44h52l-6 22H20Z"/>
  <path d="M18 51h44M19 58h42" strokeWidth=".8"/><path d="M26 44l-2 22M36 44l-1 22M46 44l1 22M56 44l2 22" strokeWidth=".8"/>
  <path d={hatch(22, 60, 8, 4.5, 5)} strokeWidth=".6" opacity=".7"/>
</Sketch>;

/** Solzinho */
const Sun = () => <Sketch>
  <circle cx="40" cy="40" r="10" fill="#e7b84b" fillOpacity=".2"/>
  <path d="M40 22v-8M40 58v8M22 40h-8M58 40h8M27 27l-5-5M53 53l5 5M53 27l5-5M27 53l-5 5" strokeWidth="1"/>
  <path d="M35 38l10 6M34 42l9 5" strokeWidth=".6" opacity=".6"/>
</Sketch>;

/** Florzinha */
const Flower = () => <Sketch>
  <path d="M40 70c0-14 2-22 0-30"/><path d="M40 56c-8-2-12-8-10-12 6 0 9 5 10 12Z" fill="#72ad32" fillOpacity=".16"/>
  <path d="M40 30c-6-10 6-12 0-2c8-8 14 4 2 2c10 2 4 14-2 2c2 12-12 10-2 0c-12 4-12-10 2-2" fill="#ee6996" fillOpacity=".15"/>
  <circle cx="40" cy="30" r="3" fill="#e7b84b" fillOpacity=".35"/>
  <path d="M33 22l-2-4M48 24l3-3M47 37l3 2" strokeWidth=".6" opacity=".6"/>
</Sketch>;

/** Regador */
const WateringCan = () => <Sketch>
  <path d="M22 40h30v24H22Z" fill="#5f86b8" fillOpacity=".12"/><path d="M22 40c4-10 26-10 30 0"/>
  <path d="M52 50l16-14M66 34l6-2-2 6" /><path d="M22 46c-10 0-10 14 0 14"/>
  <path d={hatch(42, 44, 4, 2.5, 18)} strokeWidth=".7" opacity=".7"/>
  <path d="M71 40l3 5M73 38l5 3M70 43l1 6" strokeWidth=".6" opacity=".7"/>
</Sketch>;

/** Brotinho com um lápis deitado ao lado */
const SeedlingPencil = () => <Sketch>
  <path d="M30 60c0-8 0-14 2-20"/><path d="M32 46c-8-2-10-8-8-11 5 1 8 5 8 11Z" fill="#72ad32" fillOpacity=".18"/><path d="M32 42c6-5 12-3 12 0-3 3-8 3-12 1Z" fill="#72ad32" fillOpacity=".18"/>
  <path d="M18 62c8-3 18-3 26 0" strokeWidth=".9"/><path d={hatch(20, 63, 6, 4, 3)} strokeWidth=".6"/>
  <path d="M50 66l20-20 4 4-20 20-6 2Z" fill="#e7b84b" fillOpacity=".2"/><path d="M48 72l2-6 4 4Z" fill="#3b2418" fillOpacity=".5"/><path d="M68 48l4 4" strokeWidth=".8"/>
</Sketch>;

/** Frase com a área no jeito certo ("Sem categoria" vira "nas metas sem categoria") */
const inArea = (area: GoalArea) => area === 'nenhuma' ? <>nas metas <mark>sem categoria</mark></> : <>em <mark>{areaLabel(area)}</mark></>;
const ofArea = (area: GoalArea) => area === 'nenhuma' ? <>das metas <mark>sem categoria</mark></> : <>de <mark>{areaLabel(area)}</mark></>;

/** Nuvenzinha */
const Cloud = () => <Sketch>
  <path d="M18 50c-8 0-8-12 2-11 0-9 12-12 17-5 4-8 18-6 18 3 9-1 11 13 1 13Z" fill="#b9cbd8" fillOpacity=".15"/>
  <path d="M24 46h22M28 42h14" strokeWidth=".6" opacity=".6"/>
</Sketch>;

/** Folhinhas soltas */
const Leaves = () => <Sketch>
  <path d="M20 54c4-16 18-22 28-18-2 14-16 22-28 18Z" fill="#72ad32" fillOpacity=".14"/><path d="M22 52c8-6 16-10 24-14" strokeWidth=".8"/>
  <path d="M46 62c6-8 16-8 20-4-6 6-14 8-20 4Z" fill="#72ad32" fillOpacity=".14"/><path d="M48 61c5-2 10-3 16-3" strokeWidth=".7"/>
</Sketch>;

/** Sementinhas */
const Seeds = () => <Sketch>
  <path d="M28 40c4-4 8 0 4 4-4 4-8 0-4-4ZM44 34c4-3 7 1 3 4-4 3-7-1-3-4ZM38 52c4-3 7 1 3 4-4 3-7-1-3-4ZM54 48c3-3 6 1 3 3-3 3-6-1-3-3Z" fill="#a86b35" fillOpacity=".25"/>
  <path d="M30 41l2 1M46 35l1 1M40 53l1 1" strokeWidth=".6"/>
</Sketch>;

/** Frase com rabiscos espalhados em volta (cantos, em cima e embaixo); a frase fica sempre no centro */
type Spot = 'tl' | 'tr' | 'bl' | 'br' | 'top' | 'bottom' | 'left' | 'right';
type Page = { text?: ReactNode; doodles: [Spot, ReactNode][]; scene?: ReactNode };

/** Página que vira: frente com o conteúdo e verso com papel pautado em branco */
function PageFace({ page }: { page: Page }) {
  return <div className={`nb-content ${page.text ? '' : 'is-drawing'}`}>
    {page.text ? <p className="nb-text">{page.text}</p> : <div className="nb-scene">{page.scene}</div>}
    {page.doodles.map(([spot, art], index) => <span key={index} className={`nb-doodle at-${spot}`} aria-hidden="true">{art}</span>)}
  </div>;
}

const TURN_MS = 900;

/**
 * Caderno de espiral da semana: uma página por vez, vista de frente, espiral na esquerda.
 * Clicar na página vira (metade direita: próxima; terço esquerdo: anterior), com a folha girando em 3D pela espiral.
 * Páginas de frase em primeira pessoa (dos dados da semana) alternam com páginas só de desenho.
 */
export function SketchbookInsights({ goals, log, today }: { goals: TrackedGoal[]; log: GoalLog; today: Date }) {
  const day = bestDayThisWeek(goals, log, today);
  const areas = areasThisWeek(goals, log, today);
  const strongest = bestArea(areas);
  const focus = tipArea(areas);

  const pages: Page[] = [
    { text: day ? <>Meu melhor dia foi <mark>{day.name}</mark>.</> : <>Ainda estou escolhendo meu melhor dia.</>,
      doodles: [['tl', <Sun/>], ['br', <Coffee/>], ['bottom', <Seeds/>]] },
    { scene: <div className="nb-scene-row"><Sprout/><Flower/><WateringCan/></div>, doodles: [['tr', <Cloud/>], ['bl', <Leaves/>]] },
    { text: strongest ? <>Nesta semana, eu avancei mais {inArea(strongest.area)}.</> : <>Tudo bem ir devagar no começo.</>,
      doodles: [['tr', <Flower/>], ['bl', <Basket/>], ['top', <Leaves/>]] },
    { text: focus === null ? <>Quero plantar uma meta nova.</> : focus === 'ok' ? <>Esta semana eu consegui cuidar de tudo.</> : <>Posso cuidar um pouco mais {ofArea(focus.area)}.</>,
      doodles: [['tl', <WateringCan/>], ['br', <Sprout/>], ['bottom', <Seeds/>]] },
    { scene: <div className="nb-scene-row"><Basket/><Leaves/><Trowel/></div>, doodles: [['tl', <Sun/>], ['br', <Seeds/>]] },
    { text: <>Cada pequeno passo também é progresso.</>, doodles: [['tl', <Cloud/>], ['tr', <Sun/>], ['bl', <SeedlingPencil/>], ['br', <Leaves/>]] },
  ];

  const [index, setIndex] = useState(0);
  // Folha em movimento: na próxima, a atual gira por cima; na anterior, a de trás volta por cima
  const [turning, setTurning] = useState<{ sheet: number; dir: 'next' | 'prev' } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function turn(dir: 'next' | 'prev') {
    if (turning) return;
    const target = (index + (dir === 'next' ? 1 : pages.length - 1)) % pages.length;
    setTurning({ sheet: dir === 'next' ? index : target, dir });
    // Na próxima, a de baixo já é a nova; na anterior, a nova cobre a atual e só depois vira a base
    if (dir === 'next') setIndex(target);
    timer.current = window.setTimeout(() => { if (dir === 'prev') setIndex(target); setTurning(null); }, TURN_MS);
  }
  function onClick(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    turn(event.clientX - box.left < box.width * .33 ? 'prev' : 'next');
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); turn('next'); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); turn('prev'); }
  };
  const describe = (at: number) => pages[at].text ? '' : 'Página de desenhos. ';

  return <section className="notebook" aria-label="Meu caderno da semana" aria-roledescription="caderno">
    {/* Tremor de mão compartilhado pelos desenhos */}
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <filter id="ink-hand"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
    </svg>
    <div className="nb-body">
      <span className="nb-spiral" aria-hidden="true"/>
      <button type="button" className="nb-stack" onClick={onClick} onKeyDown={onKey} aria-live="polite">
        {/* Página de baixo (a que fica à vista) */}
        <span className="nb-sheet is-base"><PageFace page={pages[index]}/></span>
        {/* Folha virando, com frente, verso e sombra */}
        {turning && <span className={`nb-turn is-${turning.dir}`} aria-hidden="true">
          <span className="nb-sheet is-front"><PageFace page={pages[turning.sheet]}/></span>
          <span className="nb-sheet is-back"/>
        </span>}
        {turning && <span className={`nb-turn-shadow is-${turning.dir}`} aria-hidden="true"/>}
        <span className="nb-corner" aria-hidden="true"/>
        <span className="sr-only">{describe(index)}Página {index + 1} de {pages.length}. Clique na página ou use as setas do teclado para virar.</span>
      </button>
    </div>
  </section>;
}
