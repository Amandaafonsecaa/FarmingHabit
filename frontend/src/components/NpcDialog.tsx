import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { prefersCalm } from '../hooks/useRollingNumber';

const TYPE_SPEED_MS = 24;

export interface NpcChoice<T extends string> { id: T; label: string }

interface NpcDialogProps<T extends string> {
  name: string; portrait: (talking: boolean) => ReactNode; greeting: string[];
  choices: NpcChoice<T>[]; respond: (choice: T) => string[]; farewell: T; onClose: () => void;
}

/**
 * Conversa com personagens no estilo das caixas de diálogo do Stardew (usada pelo Bigode e pelo vendedor das Metas):
 * retrato, texto letra a letra (clique para pular) e opções de resposta até a despedida.
 */
export function NpcDialog<T extends string>({ name, portrait, greeting, choices, respond, farewell, onClose }: NpcDialogProps<T>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameId = useId();
  const [lines, setLines] = useState(greeting);
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
    if (prefersCalm()) { setShown(line.length); return; }
    setShown(0);
    const timer = window.setInterval(() => setShown(count => { if (count >= line.length) { window.clearInterval(timer); return count; } return count + 1; }), TYPE_SPEED_MS);
    return () => window.clearInterval(timer);
  }, [line]);

  function advance() {
    if (typing) { setShown(line.length); return; }
    if (!lastLine) { setIndex(current => current + 1); return; }
    if (closing) onClose();
  }

  function choose(choice: T) {
    setLines(respond(choice));
    setIndex(0);
    setClosing(choice === farewell);
  }

  const showChoices = !typing && lastLine && !closing;
  return <dialog ref={dialogRef} className="shopkeeper-dialog" aria-labelledby={nameId} onCancel={event=>{ event.preventDefault(); onClose(); }}>
    <div className="dialogue-box">
      <div className="dialogue-portrait">{portrait(typing)}<p id={nameId} className="dialogue-name">{name}</p></div>
      <div className="dialogue-main">
        <button type="button" className="dialogue-text" onClick={advance} aria-label={typing ? 'Mostrar a fala inteira' : 'Continuar'}>
          <span aria-hidden="true">{line.slice(0, shown)}</span><span className="sr-only">{line}</span>
          {!typing && !showChoices && <span className="dialogue-next" aria-hidden="true">▼</span>}
        </button>
        {showChoices && <ul className="dialogue-choices">{choices.map(choice => <li key={choice.id}>
          <button type="button" className="dialogue-choice" onClick={()=>choose(choice.id)}><span aria-hidden="true">▶</span>{choice.label}</button>
        </li>)}</ul>}
      </div>
      <button type="button" className="dialogue-close" onClick={onClose} aria-label="Encerrar conversa">✕</button>
    </div>
  </dialog>;
}
