import { useRef, useState } from 'react';
import { signOut } from '../lib/auth';
import { toast } from '../lib/toast';

export function SignOutButton({ className = 'pixel-button' }: { className?: string }) {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  async function leave() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try { await signOut(); }
    catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível sair. Tente novamente.', 'error');
    } finally { locked.current = false; setBusy(false); }
  }
  return <button type="button" className={className} disabled={busy} aria-busy={busy} onClick={()=>void leave()}>
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" shapeRendering="crispEdges" fill="currentColor"><path d="M1 1h7v2H3v10h5v2H1ZM10 3h2v2h2v2h2v2h-2v2h-2v2h-2V9H5V7h5Z"/></svg>
    {busy ? 'Saindo…' : 'Sair'}
  </button>;
}
