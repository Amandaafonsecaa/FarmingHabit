import { useState, type CSSProperties } from 'react';
import type { Insight } from '../../lib/weekCompare';

const TEAR_MS = 420;

/** Análises em bloquinho de post-it: toque para arrancar o de cima e ver o próximo; no fim, o bloco recomeça */
export function InsightNotes({ insights }: { insights: Insight[] }) {
  const [index, setIndex] = useState(0);
  const [tearing, setTearing] = useState(false);
  const finished = index >= insights.length;
  // O de cima e até dois por baixo, para parecer um bloquinho
  const stack = finished ? [] : insights.slice(index, index + 3);

  function tear() {
    if (tearing) return;
    if (finished) { setIndex(0); return; }
    setTearing(true);
    window.setTimeout(() => { setIndex(current => current + 1); setTearing(false); }, TEAR_MS);
  }

  // Só o bloquinho de post-its, sem card por trás; o contador fica no cantinho do post-it de cima
  return <div className="insight-notes">
    <button type="button" className="notes-pad" onClick={tear}
      aria-label={finished ? 'Recomeçar as análises' : `Análise ${index + 1} de ${insights.length}: ${insights[index].big} ${insights[index].text}. Arrancar e ver a próxima`}>
      {finished
        ? <span className="post-it is-end"><span className="post-it-big">↺</span><span className="post-it-text">fim! toque para recomeçar</span></span>
        : stack.map((note, depth) => <span key={index + depth} className={`post-it is-${note.tone} ${depth === 0 && tearing ? 'is-tearing' : ''}`}
            style={{ zIndex: 3 - depth, '--depth': depth } as CSSProperties} aria-hidden={depth > 0}>
            <span className="post-it-tape" aria-hidden="true"/>
            {depth === 0 && <span className="post-it-count">{index + 1}/{insights.length}</span>}
            <span className="post-it-big">{note.big}</span>
            <span className="post-it-text">{note.text}</span>
          </span>)}
    </button>
  </div>;
}
