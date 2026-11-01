import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { PixelIcon, type PixelIconName } from './PixelIcon';
import { SignOutButton } from './SignOutButton';
import type { AppPage } from '../types/navigation';

const PAGE_ITEMS: Record<'shop' | 'evolution' | 'settings', { page: AppPage; label: string; icon: PixelIconName }> = {
  shop: { page: 'shop', label: 'Loja', icon: 'coin' },
  evolution: { page: 'evolution', label: 'Evolução', icon: 'growth' },
  settings: { page: 'settings', label: 'Configurações', icon: 'settings' },
};
/** O que mora na Mochila: com o Diário na barra, a Loja desce para cá */
const mochilaPages = (diaryEnabled: boolean) => diaryEnabled
  ? [PAGE_ITEMS.shop, PAGE_ITEMS.evolution, PAGE_ITEMS.settings]
  : [PAGE_ITEMS.evolution, PAGE_ITEMS.settings];

/** Mochila: gaveta que sobe de baixo com as telas que não cabem na barra do celular, mais o Sair */
function MoreSheet({ page, pages, onNavigate, onClose }: { page: AppPage; pages: ReturnType<typeof mochilaPages>; onNavigate: (page: AppPage) => void; onClose: () => void }) {
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
    <header className="panel-heading"><h2 id={titleId}><PixelIcon name="backpack" className="size-5"/>Mochila</h2>
      <button type="button" className="pixel-button more-sheet-close" aria-label="Fechar" onClick={onClose}><PixelIcon name="close" className="size-3"/></button></header>
    <ul className="more-sheet-list">{pages.map(item => <li key={item.page}>
      <button type="button" className={`more-sheet-item ${page === item.page ? 'is-selected' : ''}`} aria-current={page === item.page ? 'page' : undefined}
        onClick={()=>{ onClose(); if (page !== item.page) onNavigate(item.page); }}>
        <span className="item-icon"><PixelIcon name={item.icon}/></span>{item.label}<span className="panel-arrow" aria-hidden="true">▶</span>
      </button></li>)}
      <li><SignOutButton className="more-sheet-item is-signout"/></li>
    </ul>
  </dialog>;
}

/** Só no celular: 5º botão da barra inferior (Mochila), aceso quando a tela atual mora dentro dela */
export function MoreNavigationItem({ page, onNavigate, diaryEnabled }: { page: AppPage; onNavigate: (page: AppPage) => void; diaryEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const pages = mochilaPages(diaryEnabled);
  const selected = pages.some(item => item.page === page);
  return <li className="nav-more" style={{ '--i': 4 } as CSSProperties}>
    <button type="button" className={`game-nav-item ${selected ? 'is-selected' : ''}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>
      <span className="game-nav-icon"><PixelIcon name="backpack" className="size-5"/>{selected && <span className="nav-sparkle" aria-hidden="true"/>}</span>
      <span className="game-nav-label">Mochila</span>
    </button>
    {open && <MoreSheet page={page} pages={pages} onNavigate={onNavigate} onClose={()=>setOpen(false)}/>}
  </li>;
}
