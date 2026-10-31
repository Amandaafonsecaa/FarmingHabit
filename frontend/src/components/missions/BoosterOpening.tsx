import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { CARDS, cardById, type CardPull, type OwnedCard } from '../../lib/cards';
import { prefersCalm } from '../../hooks/useRollingNumber';
import { CardArt, CardBack, TradingCard, setName } from './TradingCard';

const TEAR_AT = .6;
const LEAVE_MS = 320;

/**
 * Pacote de cartas do mundo: arrastar o dedo (ou o mouse) pela costura de cima rasga a ponta.
 * Soltar antes do fim volta ao normal; no teclado, Enter na costura rasga de uma vez (clique de mouse não: tem que arrastar).
 */
export function BoosterPack({ set, count, onTorn }: { set: number; count: number; onTorn: () => void }) {
  const [progress, setProgress] = useState(0);
  const [torn, setTorn] = useState(false);
  const drag = useRef<{ x: number; width: number } | null>(null);
  const cover = CARDS.find(card => card.set === set && card.rarity === 'lendário');

  function tear() {
    if (torn) return;
    setTorn(true);
    setProgress(1);
    window.setTimeout(onTorn, prefersCalm() ? 0 : 650);
  }
  function down(event: PointerEvent<HTMLDivElement>) {
    if (torn) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, width: event.currentTarget.getBoundingClientRect().width };
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || torn) return;
    const next = Math.min(1, Math.abs(event.clientX - drag.current.x) / (drag.current.width * .8));
    setProgress(next);
    if (next >= 1) { drag.current = null; tear(); }
  }
  function up() {
    if (!drag.current) return;
    drag.current = null;
    if (progress >= TEAR_AT) tear(); else setProgress(0);
  }

  return <div className="booster-stage">
    <div className={`booster tcg-set-${set} ${torn ? 'is-torn' : ''} ${progress > 0 && !torn ? 'is-tearing' : ''}`} style={{ '--tear': progress } as CSSProperties}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <div className="booster-cap" aria-hidden="true"/>
      <button type="button" className="booster-seam" onClick={event => { if (event.detail === 0) tear(); }} disabled={torn} aria-label={`Rasgar o pacote de ${setName(set)}`}>
        <span className="booster-rip"/>
        {progress === 0 && !torn && <span className="booster-hint" aria-hidden="true"/>}
      </button>
      <div className="booster-body">
        {cover && <CardArt id={cover.id} className="booster-art"/>}
        <strong className="booster-name">{setName(set)}</strong>
        <span className="booster-count">{count} cartas</span>
      </div>
      <div className="booster-crimp" aria-hidden="true"/>
    </div>
    <p className="tap-meter-text" aria-live="polite">{torn ? 'Rasgou!' : 'Arraste pela costura para rasgar'}</p>
  </div>;
}

/**
 * Cartas saindo do pacote, uma por vez: um toque vira a de cima e o próximo passa para a seguinte.
 * Mostra "Nova!" na primeira cópia de uma carta e avisa o diálogo quando uma lendária aparece.
 */
export function CardReveal({ pulls, owned, onLegendary, onDone }: { pulls: CardPull[]; owned: Record<string, OwnedCard>; onLegendary: () => void; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const topRef = useRef<HTMLButtonElement>(null);
  const isNew = (position: number) => !owned[pulls[position].id]?.count && pulls.findIndex(pull => pull.id === pulls[position].id) === position;

  useEffect(() => { topRef.current?.focus({ preventScroll: true }); }, [index]);

  function advance() {
    if (leaving) return;
    if (!flipped) {
      setFlipped(true);
      if (cardById(pulls[index].id)?.rarity === 'lendário') onLegendary();
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      setLeaving(false);
      setFlipped(false);
      if (index + 1 >= pulls.length) onDone(); else setIndex(index + 1);
    }, prefersCalm() ? 0 : LEAVE_MS);
  }

  const current = cardById(pulls[index].id);
  return <div className="reveal-stage">
    <div className="reveal-stack">
      {/* As de baixo ficam viradas, um pouco deslocadas; a de cima é a que vira */}
      {pulls.map((pull, position) => {
        if (position < index) return null;
        const depth = position - index;
        const card = cardById(pull.id);
        if (!card) return null;
        if (depth > 0) return <div key={position} className="reveal-card is-waiting" style={{ '--depth': Math.min(depth, 3) } as CSSProperties}><CardBack className="reveal-size"/></div>;
        return <div key={position} className={`reveal-card is-top ${leaving ? 'is-leaving' : ''}`}>
          <button ref={topRef} type="button" className={`reveal-flip ${flipped ? 'is-flipped' : ''}`} onClick={advance}
            aria-label={flipped ? `${card.name}${pull.shiny ? ', brilhante' : ''}. Próxima carta` : `Virar a carta ${position + 1} de ${pulls.length}`}>
            <span className="reveal-face is-back"><CardBack className="reveal-size"/></span>
            <span className="reveal-face is-front"><TradingCard card={card} shiny={pull.shiny} live={flipped} className="reveal-size"/></span>
          </button>
          {flipped && isNew(position) && <span className="reveal-badge is-new" aria-hidden="true">Nova!</span>}
          {flipped && card.rarity === 'lendário' && <span className="legendary-banner" aria-hidden="true">LENDÁRIA!</span>}
        </div>;
      })}
    </div>
    <p className="reveal-progress" aria-live="polite">
      <span className="tap-dots" aria-hidden="true">{pulls.map((_, position) => <span key={position} className={position < index || (position === index && flipped) ? 'is-on' : ''}/>)}</span>
      <span className="sr-only">{flipped && current ? `${current.name}, carta ${index + 1} de ${pulls.length}` : `Carta ${index + 1} de ${pulls.length}`}</span>
    </p>
  </div>;
}

/** Resumo do pacote: as cartas em miniatura, com "Nova!" nas inéditas e o número de cópias nas repetidas */
export function BoosterSummary({ pulls, owned }: { pulls: CardPull[]; owned: Record<string, OwnedCard> }) {
  return <ul className="booster-summary">{pulls.map((pull, position) => {
    const card = cardById(pull.id);
    if (!card) return null;
    const fresh = !owned[pull.id]?.count && pulls.findIndex(item => item.id === pull.id) === position;
    const copies = (owned[pull.id]?.count ?? 0) + pulls.slice(0, position + 1).filter(item => item.id === pull.id).length;
    return <li key={position} className="booster-summary-card" style={{ '--card': position } as CSSProperties}>
      <TradingCard card={card} shiny={pull.shiny} mini/>
      {fresh ? <span className="reveal-badge is-new">Nova!</span> : <span className="reveal-badge">x{copies}</span>}
    </li>;
  })}</ul>;
}
