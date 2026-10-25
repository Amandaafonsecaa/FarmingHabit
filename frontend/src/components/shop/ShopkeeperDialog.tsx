import { useEffect, useRef, useState } from 'react';
import { choicesFor, greeting, respond, type ChoiceId, type ShopContext } from '../../lib/shopkeeper';

const TYPE_SPEED_MS = 24;

/** Retrato do Bigode: pisca e mexe a boca enquanto fala */
function BigodePortrait({ talking }: { talking: boolean }) {
  return <svg className={`bigode-portrait ${talking ? 'is-talking' : ''}`} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="32" height="32" fill="#cfe7c0"/><rect y="24" width="32" height="8" fill="#a8d08a"/>
    <path d="M6 6h5v5H6Zm15 0h5v5h-5Z" fill="#9aa3b2"/><path d="M7 7h3v3H7Zm15 0h3v3h-3Z" fill="#f2a6a6"/>
    <path d="M5 10h22v14H5Z" fill="#9aa3b2"/><path d="M8 11h3v1H8Zm7-1h2v2h-2Zm6 1h3v1h-3Z" fill="#7d8696"/>
    <g className="portrait-eyes"><path d="M9 14h3v3H9Zm11 0h3v3h-3Z" fill="#3b2418"/><path d="M9 14h1v1H9Zm11 0h1v1h-1Z" fill="#fff"/></g>
    <path d="M15 18h2v1h-2Z" fill="#e8576f"/><path d="M2 19h7v1H2Zm21 0h7v1h-7ZM3 21h6v1H3Zm20 0h6v1h-6Z" fill="#fff"/>
    <path className="portrait-mouth" d="M14 20h4v2h-4Z" fill="#7a2e17"/>
    <path d="M7 24h18v8H7Z" fill="#fff1d6"/><path d="M7 24h18v2H7Z" fill="#bf5837"/><path d="M14 27h4v3h-4Z" fill="#f2c453"/>
  </svg>;
}

/**
 * Conversa com o vendedor no estilo das caixas de diálogo do Stardew:
 * texto letra a letra (clique para pular), depois opções de resposta.
 */
export function ShopkeeperDialog({ context, onClose }: { context: ShopContext; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [lines, setLines] = useState(() => greeting(context));
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [closing, setClosing] = useState(false);
  const line = lines[index];
  const typing = shown < line.length;
  const lastLine = index === lines.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // Máquina de escrever: revela a fala aos poucos (instantâneo no modo calmo)
  useEffect(() => {
    const calm = document.documentElement.classList.contains('calm-mode') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) { setShown(line.length); return; }
    setShown(0);
    const timer = window.setInterval(() => setShown(count => { if (count >= line.length) { window.clearInterval(timer); return count; } return count + 1; }), TYPE_SPEED_MS);
    return () => window.clearInterval(timer);
  }, [line]);

  function advance() {
    if (typing) { setShown(line.length); return; }
    if (!lastLine) { setIndex(current => current + 1); return; }
    if (closing) onClose();
  }

  function choose(choice: ChoiceId) {
    setLines(respond(choice, context));
    setIndex(0);
    setClosing(choice === 'bye');
  }

  const showChoices = !typing && lastLine && !closing;
  return <dialog ref={dialogRef} className="shopkeeper-dialog" aria-labelledby="bigode-name" onCancel={event=>{ event.preventDefault(); onClose(); }}>
    <div className="dialogue-box">
      <div className="dialogue-portrait"><BigodePortrait talking={typing}/><p id="bigode-name" className="dialogue-name">Bigode</p></div>
      <div className="dialogue-main">
        <button type="button" className="dialogue-text" onClick={advance} aria-label={typing ? 'Mostrar a fala inteira' : 'Continuar'}>
          <span aria-hidden="true">{line.slice(0, shown)}</span><span className="sr-only">{line}</span>
          {!typing && !showChoices && <span className="dialogue-next" aria-hidden="true">▼</span>}
        </button>
        {showChoices && <ul className="dialogue-choices">{choicesFor(context).map(choice => <li key={choice.id}>
          <button type="button" className="dialogue-choice" onClick={()=>choose(choice.id)}><span aria-hidden="true">▶</span>{choice.label}</button>
        </li>)}</ul>}
      </div>
      <button type="button" className="dialogue-close" onClick={onClose} aria-label="Encerrar conversa">✕</button>
    </div>
  </dialog>;
}
