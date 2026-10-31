import { useEffect, useId, useRef, useState } from 'react';
import { ADVENTURE_NOTES } from '../../lib/adventureNotes';
import { PixelIcon } from '../PixelIcon';

// Couro gasto: tons da madeira do jogo puxados para o marrom-avermelhado
const LEATHER = '#7a4a2a';
const LEATHER_DARK = '#5b3826';
const LEATHER_DEEP = '#3b2418';
const LEATHER_WORN = '#9a6438';
const LEATHER_SCUFF = '#b07a4a';
const STITCH = '#e3c38a';
const PAGES = '#f6dfa6';
const PAGES_SHADE = '#d2ac71';
const RIBBON = '#b96845';

const MOVE_MS = 420;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Capa do caderno fechado: couro com cantos gastos, costura falhada, arranhões e a fita marcadora */
function NotebookCover() {
  // Costura pontilhada com alguns pontos faltando (o caderno já viu muita viagem)
  const missing = new Set([3, 4, 11, 19, 20, 21, 30, 37]);
  const stitches: { x: number; y: number; w: number; h: number }[] = [];
  let index = 0;
  for (let x = 40; x <= 268; x += 12, index++) { stitches.push({ x, y: 22, w: 6, h: 3 }); }
  for (let y = 34; y <= 366; y += 12, index++) { if (!missing.has(index)) stitches.push({ x: 276, y, w: 3, h: 6 }); }
  for (let x = 268; x >= 40; x -= 12, index++) { if (!missing.has(index)) stitches.push({ x, y: 375, w: 6, h: 3 }); }
  return <svg className="notebook-cover-art" viewBox="0 0 300 424" shapeRendering="crispEdges" aria-hidden="true">
    {/* Folhas aparecendo na lateral e embaixo */}
    <rect x="16" y="12" width="282" height="384" fill={PAGES_SHADE}/>
    <rect x="288" y="16" width="8" height="378" fill={PAGES}/>
    <g fill={PAGES_SHADE}>{Array.from({ length: 18 }, (_, line) => <rect key={line} x="288" y={26 + line * 20} width="8" height="2"/>)}</g>

    {/* Capa */}
    <path d="M8 8H284V12H288V388H284V392H8Z" fill={LEATHER}/>
    {/* Lombada com nervuras */}
    <rect x="8" y="8" width="26" height="384" fill={LEATHER_DARK}/>
    <g fill={LEATHER_DEEP}>{[60, 140, 260, 340].map(y => <rect key={y} x="8" y={y} width="26" height="6"/>)}</g>
    <g fill={LEATHER_WORN}>{[58, 138, 258, 338].map(y => <rect key={y} x="10" y={y} width="22" height="2"/>)}</g>

    {/* Cantos gastos e manchas de uso */}
    <path d="M268 8H284V12H288V30H280V20H268Z" fill={LEATHER_SCUFF}/>
    <path d="M280 372H288V388H284V392H266V384H280Z" fill={LEATHER_SCUFF}/>
    <rect x="34" y="8" width="18" height="6" fill={LEATHER_WORN}/>
    <rect x="34" y="386" width="22" height="6" fill={LEATHER_WORN}/>
    <rect x="196" y="300" width="40" height="12" fill={LEATHER_WORN} opacity=".55"/>
    <rect x="80" y="232" width="24" height="8" fill={LEATHER_WORN} opacity=".5"/>

    {/* Costura */}
    <g fill={STITCH}>{stitches.map(({ x, y, w, h }) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h}/>)}</g>

    {/* Arranhões */}
    <g fill={LEATHER_SCUFF}>
      <rect x="210" y="96" width="30" height="2"/><rect x="238" y="98" width="10" height="2"/>
      <rect x="70" y="318" width="22" height="2"/><rect x="90" y="320" width="8" height="2"/>
      <rect x="150" y="250" width="2" height="14"/>
    </g>

    {/* Etiqueta de papel colada na capa */}
    <rect x="70" y="118" width="170" height="92" fill={LEATHER_DEEP} opacity=".35"/>
    <rect x="64" y="112" width="170" height="92" fill="#fff1c7"/>
    <rect x="64" y="112" width="170" height="4" fill="#fff8d8"/>
    <rect x="64" y="200" width="170" height="4" fill={PAGES_SHADE}/>
    <rect x="226" y="112" width="8" height="10" fill={PAGES_SHADE}/>
    <g fill={STITCH} opacity=".9"><rect x="80" y="182" width="138" height="2"/></g>

    {/* Fecho de couro com botão de latão */}
    <rect x="240" y="176" width="48" height="34" fill={LEATHER_DARK}/>
    <rect x="240" y="176" width="48" height="4" fill={LEATHER_WORN}/>
    <rect x="252" y="186" width="14" height="14" fill="#c98b2e"/>
    <rect x="254" y="188" width="6" height="4" fill="#e8b450"/>

    {/* Fita marcadora saindo por baixo */}
    <path d="M196 392H210V420H203L196 412Z" fill={RIBBON}/>
  </svg>;
}

/**
 * Caderno de dúvidas das Missões. Fechado fica ao lado do quadro; aberto desliza do lugar dele até o centro
 * da tela, a capa vira e mostra as perguntas (índice) e a resposta escolhida.
 */
export function AdventureNotebook() {
  const [open, setOpen] = useState(false);
  const closedRef = useRef<HTMLButtonElement>(null);
  return <aside className="notebook-slot" aria-label="Caderno de dúvidas">
    <button ref={closedRef} type="button" className={`notebook-closed ${open ? 'is-away' : ''}`} onClick={()=>setOpen(true)} aria-haspopup="dialog">
      <NotebookCover/>
      <span className="notebook-label">Diário do<br/>Aventureiro</span>
    </button>
    {open && <NotebookDialog origin={closedRef.current} onClose={()=>setOpen(false)}/>}
  </aside>;
}

/** closed: só a capa, viajando até o centro · flipping: a capa vira na lombada · open: páginas liberadas */
type Phase = 'closed' | 'flipping' | 'open';

export function NotebookDialog({ origin, onClose }: { origin: HTMLElement | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const titleId = useId();
  const [phase, setPhase] = useState<Phase>(() => reducedMotion() ? 'open' : 'closed');
  // Desktop abre direto na primeira resposta; no celular (uma página só) começa pelo índice
  const [selected, setSelected] = useState<number | null>(() => window.matchMedia('(min-width: 768px)').matches ? 0 : null);
  const note = selected === null ? null : ADVENTURE_NOTES[selected];

  /** A capa (fechada) vai do lugar do caderno no quadro até o centro, ou faz o caminho de volta */
  function travel(direction: 'in' | 'out') {
    const book = bookRef.current;
    const cover = coverRef.current;
    if (!book || !cover || !origin || reducedMotion()) return Promise.resolve();
    const from = origin.getBoundingClientRect();
    const box = book.getBoundingClientRect();
    const to = cover.getBoundingClientRect();
    // Escala a partir do centro da capa, para ela sair exatamente de cima do caderno fechado
    book.style.transformOrigin = `${to.left + to.width / 2 - box.left}px ${to.top + to.height / 2 - box.top}px`;
    const away = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.height / to.height})`;
    const frames = direction === 'in' ? [{ transform: away }, { transform: 'none' }] : [{ transform: 'none' }, { transform: away, opacity: 0 }];
    return book.animate(frames, { duration: MOVE_MS, easing: 'steps(8, end)', fill: 'forwards' }).finished.then(() => undefined);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    void travel('in').then(() => setPhase(current => current === 'closed' && !closing.current ? 'flipping' : current));
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; origin?.focus(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Fecha a capa por cima das páginas e o caderno volta para o lugar dele */
  function close() {
    if (closing.current) return;
    closing.current = true;
    if (reducedMotion()) { onClose(); return; }
    setPhase('closed');
    window.requestAnimationFrame(() => { void travel('out').then(onClose); });
  }

  return <dialog ref={dialogRef} className="notebook-dialog" aria-labelledby={titleId}
    onCancel={event=>{ event.preventDefault(); close(); }}
    onClick={event=>{ if (event.target === dialogRef.current) close(); }}>
    <div ref={bookRef} className={`notebook-open is-${phase}`}>
      <h2 id={titleId} className="sr-only">Diário do Aventureiro</h2>
      <button type="button" className="notebook-close pixel-button" onClick={close} aria-label="Fechar o caderno"><PixelIcon name="close" className="size-3"/></button>
      <div className={`notebook-spread ${note ? 'has-answer' : ''}`}>
        <section className="notebook-page is-index" aria-label="Perguntas" inert={phase !== 'open'}>
          <p className="notebook-heading">Dúvidas a bordo</p>
          <ol className="notebook-questions">{ADVENTURE_NOTES.map((item, index) =>
            <li key={item.id}><button type="button" className={index === selected ? 'is-current' : ''} aria-current={index === selected ? 'true' : undefined} onClick={()=>setSelected(index)}>{item.question}</button></li>)}</ol>
        </section>
        <section className="notebook-page is-answer" aria-live="polite" inert={phase !== 'open'}>
          {note && <>
            <button type="button" className="notebook-back" onClick={()=>setSelected(null)}><span aria-hidden="true">◀</span> Perguntas</button>
            <h3 className="notebook-question">{note.question}</h3>
            {note.answer.map(line => <p key={line}>{line}</p>)}
            <div className="notebook-turn">
              <button type="button" className="pixel-button" disabled={selected === 0} onClick={()=>setSelected(Math.max(0, (selected ?? 0) - 1))} aria-label="Pergunta anterior">◀</button>
              <span>{(selected ?? 0) + 1}/{ADVENTURE_NOTES.length}</span>
              <button type="button" className="pixel-button" disabled={selected === ADVENTURE_NOTES.length - 1} onClick={()=>setSelected(Math.min(ADVENTURE_NOTES.length - 1, (selected ?? 0) + 1))} aria-label="Próxima pergunta">▶</button>
            </div>
          </>}
        </section>
        {/* Capa: cobre a página da direita enquanto o caderno viaja; depois vira presa na lombada */}
        <div ref={coverRef} className="notebook-flap" aria-hidden="true" onAnimationEnd={()=>setPhase(current => current === 'flipping' ? 'open' : current)}><NotebookCover/><span className="notebook-label">Diário do<br/>Aventureiro</span></div>
      </div>
    </div>
  </dialog>;
}
