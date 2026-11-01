import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';
import { SignOutButton } from './SignOutButton';
import type { AppPage } from '../types/navigation';

const MORE_PAGES: { page: AppPage; label: string; icon: PixelIconName }[] = [
  { page: 'diary', label: 'Diário', icon: 'book' },
  { page: 'evolution', label: 'Evolução', icon: 'growth' },
  { page: 'settings', label: 'Configurações', icon: 'settings' },
];

/** Gaveta que sobe de baixo com as telas que não cabem na barra do celular, mais o Sair */
function MoreSheet({ page, onNavigate, onClose }: { page: AppPage; onNavigate: (page: AppPage) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={dialogRef} className="more-sheet pixel-frame" aria-labelledby={titleId}
    onCancel={event=>{ event.preventDefault(); onClose(); }}
    onClick={event=>{ if (event.target === dialogRef.current) onClose(); }}>
    <header className="panel-heading"><h2 id={titleId}><PixelIcon name="more" className="size-5"/>Mais</h2>
      <button type="button" className="pixel-button more-sheet-close" aria-label="Fechar" onClick={onClose}><PixelIcon name="close" className="size-3"/></button></header>
    <ul className="more-sheet-list">{MORE_PAGES.map(item => <li key={item.page}>
      <button type="button" className={`more-sheet-item ${page === item.page ? 'is-selected' : ''}`} aria-current={page === item.page ? 'page' : undefined}
        onClick={()=>{ onClose(); if (page !== item.page) onNavigate(item.page); }}>
        <span className="item-icon"><PixelIcon name={item.icon}/></span>{item.label}<span className="panel-arrow" aria-hidden="true">▶</span>
      </button></li>)}
      <li><SignOutButton className="more-sheet-item is-signout"/></li>
    </ul>
  </dialog>;
}

/** Só no celular: 5º botão da barra inferior, aceso quando a tela atual mora dentro dele */
export function MoreNavigationItem({ page, onNavigate }: { page: AppPage; onNavigate: (page: AppPage) => void }) {
  const [open, setOpen] = useState(false);
  const selected = MORE_PAGES.some(item => item.page === page);
  return <li className="nav-more" style={{ '--i': 4 } as CSSProperties}>
    <button type="button" className={`game-nav-item ${selected ? 'is-selected' : ''}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>
      <span className="game-nav-icon"><PixelIcon name="more" className="size-5"/>{selected && <span className="nav-sparkle" aria-hidden="true"/>}</span>
      <span className="game-nav-label">Mais</span>
    </button>
    {open && <MoreSheet page={page} onNavigate={onNavigate} onClose={()=>setOpen(false)}/>}
  </li>;
}
