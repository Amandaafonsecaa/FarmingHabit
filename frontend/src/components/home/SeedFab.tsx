import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PixelIcon, type PixelIconName } from '../PixelIcon';

export type SeedOption = 'goal' | 'mission' | 'reward';
const OPTIONS: { id: SeedOption; label: string; icon: PixelIconName }[] = [{ id: 'goal', label: 'Meta', icon: 'leaf' }, { id: 'mission', label: 'Missão', icon: 'mission' }, { id: 'reward', label: 'Recompensa', icon: 'coin' }];

/** Botão único "+" em forma de semente: abre em leque as 3 opções de criar algo */
export function SeedFab({ onPick }: { onPick: (option: SeedOption) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    const onPointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [open]);

  return <div ref={rootRef} className={`seed-fab ${open ? 'is-open' : ''}`}>
    <ul className="seed-options" aria-hidden={!open}>{OPTIONS.map((option, index) => <li key={option.id} style={{ '--i': index } as CSSProperties}>
      <button type="button" className="seed-option" tabIndex={open ? 0 : -1} onClick={()=>{ setOpen(false); onPick(option.id); }}><span className="seed-option-icon"><PixelIcon name={option.icon} className="size-4"/></span>{option.label}</button>
    </li>)}</ul>
    <button type="button" className="seed-button" aria-expanded={open} aria-label={open ? 'Fechar opções' : 'Criar meta, missão ou recompensa'} onClick={()=>setOpen(value => !value)}>
      <svg viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true"><path d="M8 4h8v2h2v4h2v8h-2v2h-2v2H8v-2H6v-2H4v-8h2V6h2Z" fill="#a86b35"/><path d="M8 6h4v4H8Z" fill="#d29853"/><path className="seed-plus" d="M11 9h2v3h3v2h-3v3h-2v-3H8v-2h3Z" fill="#fff1c7"/><path className="seed-sprout" d="M11 0h2v4h-2ZM7 1h4v2H7Zm6-1h4v2h-4Z" fill="#72ad32"/></svg>
    </button>
  </div>;
}
