import { useEffect, useState, type CSSProperties } from 'react';
import { TOAST_EVENT, type ToastItem } from '../lib/toast';

const DURATION = { success: 3600, info: 3600, error: 5600 };
const ICON = { success: '✓', info: '✦', error: '!' };

/** Plaquinhas de aviso penduradas no canto da tela: entram balançando e somem sozinhas */
export function Toaster() {
  const [items, setItems] = useState<(ToastItem & { leaving?: boolean })[]>([]);
  useEffect(() => {
    const onToast = (event: Event) => {
      const item = (event as CustomEvent<ToastItem>).detail;
      setItems(current => [...current.slice(-3), item]);
      window.setTimeout(() => dismiss(item.id), DURATION[item.tone]);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  function dismiss(id: number) {
    setItems(current => current.map(item => item.id === id ? { ...item, leaving: true } : item));
    window.setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 250);
  }

  return <div className="toaster" aria-live="polite">
    {items.map(item => <div key={item.id} className={`toast pixel-frame is-${item.tone} ${item.leaving ? 'is-leaving' : ''}`} role={item.tone === 'error' ? 'alert' : 'status'}
      style={{ '--toast-life': `${DURATION[item.tone]}ms` } as CSSProperties}>
      <span className="toast-icon" aria-hidden="true">{ICON[item.tone]}</span>
      <p className="toast-message">{item.message}</p>
      <button type="button" className="toast-close" onClick={()=>dismiss(item.id)} aria-label="Fechar aviso">✕</button>
      <span className="toast-timer" aria-hidden="true"/>
    </div>)}
  </div>;
}
