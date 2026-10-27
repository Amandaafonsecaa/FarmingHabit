import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useHoverOpen } from '../hooks/useHoverOpen';
import { PixelIcon } from './PixelIcon';
import { SignOutButton } from './SignOutButton';

export function SettingsNavigationItem({ selected, visible, onSelect }: { selected: boolean; visible: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const hover = useHoverOpen(open, setOpen);
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <li ref={root} className="nav-item-bottom nav-account" style={{ '--i': 6 } as CSSProperties}
    onPointerEnter={hover.onPointerEnter} onPointerLeave={hover.onPointerLeave}
    onBlur={event=>{ if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}
    onKeyDown={event=>{ if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); trigger.current?.focus(); setOpen(false); } }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={id} onFocus={()=>setOpen(true)} className={`game-nav-item ${selected ? 'is-selected' : ''}`} aria-current={selected ? 'page' : undefined}
      onClick={onSelect}>
      <span className="game-nav-icon"><PixelIcon name="settings" className="size-5"/>{selected && <span className="nav-sparkle" aria-hidden="true"/>}</span>
      <span className="game-nav-label">Configurações</span>
    </button>
    <div id={id} className={`nav-account-popover ${open ? 'is-open' : ''}`} inert={!open} aria-hidden={!open}>
      <div className="nav-account-panel"><SignOutButton className="nav-signout"/></div>
    </div>
  </li>;
}
