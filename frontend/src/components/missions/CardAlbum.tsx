import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { CHAPTERS } from '../../lib/journey';
import { CARDS, CARDS_PER_SET, RARITY_LABEL, foundCount, type CardInfo, type OwnedCard } from '../../lib/cards';
import { PixelIcon } from '../PixelIcon';
import { CardSlotEmpty, TradingCard, setName } from './TradingCard';

/** Carta ampliada: inclina seguindo o ponteiro (o brilho holográfico acompanha) e mostra quantas cópias você tem */
function CardZoom({ card, owned, onClose }: { card: CardInfo; owned: OwnedCard; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus(); };
  }, []);

  function lean(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    setTilt({ x: (event.clientX - box.left) / box.width - .5, y: (event.clientY - box.top) / box.height - .5 });
  }

  return <dialog ref={dialogRef} className="pixel-dialog pixel-frame game-dialog card-zoom-dialog" aria-labelledby="card-zoom-title"
    onCancel={event=>{ event.preventDefault(); onClose(); }} onClick={event=>{ if (event.target === event.currentTarget) onClose(); }}>
    <header className="panel-heading"><h2 id="card-zoom-title">{card.name}</h2><span className="panel-tag">{setName(card.set)}</span></header>
    <div className="card-zoom-stage" onPointerMove={lean} onPointerLeave={()=>setTilt({ x: 0, y: 0 })}>
      <div className="card-zoom-tilt" style={{ '--tx': tilt.x, '--ty': tilt.y } as CSSProperties}>
        <TradingCard card={card} shiny={owned.shiny > 0} live className="card-zoom-card"/>
      </div>
    </div>
    <p className="card-zoom-meta">
      <span>{RARITY_LABEL[card.rarity]}</span>
      <span>{owned.count === 1 ? '1 cópia' : `${owned.count} cópias`}</span>
      {owned.shiny > 0 && <span className="is-shiny">★ {owned.shiny === 1 ? '1 brilhante' : `${owned.shiny} brilhantes`}</span>}
    </p>
    <footer className="welcome-actions"><button type="button" className="pixel-button primary-button" onClick={onClose}>Fechar</button></footer>
  </dialog>;
}

/**
 * Álbum de cartas (fichário): uma página por mundo, com as cartas encontradas nas capas plásticas
 * e as que faltam em silhueta "???". Repetidas mostram quantas cópias; brilhantes ganham estrela.
 */
export function CardAlbum({ cards, initialSet = 0 }: { cards: Record<string, OwnedCard>; initialSet?: number }) {
  const [set, setSet] = useState(initialSet);
  const [zoom, setZoom] = useState<CardInfo | null>(null);
  useEffect(() => { setSet(initialSet); }, [initialSet]);
  const page = CARDS.filter(card => card.set === set);
  const foundHere = page.filter(card => cards[card.id]?.count).length;

  return <section className="world-panel pixel-frame collection-panel" aria-labelledby="collection-heading">
    <header className="panel-heading"><h2 id="collection-heading"><PixelIcon name="sun" className="size-5"/>Álbum de cartas</h2><span className="panel-tag">{foundCount({ cards })}/{CARDS.length}</span></header>
    <div className="collection-body album-body">
      <div className="album-nav">
        <button type="button" className="world-arrow" disabled={set === 0} onClick={()=>setSet(set - 1)} aria-label="Mundo anterior">◀</button>
        <p><strong>{CHAPTERS[set].name}</strong><small>{foundHere}/{CARDS_PER_SET}</small></p>
        <button type="button" className="world-arrow" disabled={set >= CHAPTERS.length - 1} onClick={()=>setSet(set + 1)} aria-label="Próximo mundo">▶</button>
      </div>
      <div className="pixel-progress" role="progressbar" aria-label={`Cartas de ${CHAPTERS[set].name}`} aria-valuemin={0} aria-valuemax={CARDS_PER_SET} aria-valuenow={foundHere}>
        <div className="pixel-progress-fill" style={{ width: `${foundHere / CARDS_PER_SET * 100}%` }}/>
      </div>
      <ul key={set} className="album-page">{page.map((card, index) => {
        const owned = cards[card.id];
        return <li key={card.id} className="album-sleeve" style={{ '--card': index } as CSSProperties}>
          {owned?.count
            ? <button type="button" className="album-card" onClick={()=>setZoom(card)} aria-label={`${card.name}, ${RARITY_LABEL[card.rarity]}, ${owned.count} ${owned.count === 1 ? 'cópia' : 'cópias'}`}>
                <TradingCard card={card} shiny={owned.shiny > 0} mini/>
                {owned.count > 1 && <span className="album-count">x{owned.count}</span>}
              </button>
            : <div className="album-card is-missing" aria-label={`Carta ${card.number} ainda não encontrada`} role="img"><CardSlotEmpty id={card.id}/></div>}
        </li>;
      })}</ul>
    </div>
    {zoom && cards[zoom.id] && <CardZoom card={zoom} owned={cards[zoom.id]} onClose={()=>setZoom(null)}/>}
  </section>;
}
