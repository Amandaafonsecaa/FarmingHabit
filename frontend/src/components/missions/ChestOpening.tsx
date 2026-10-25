import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CHAPTERS } from '../../lib/journey';
import type { FoundChest, Loot } from '../../lib/treasure';
import { LootIcon, lootLabel, lootRarity } from './TreasureIcons';

/**
 * Abertura do baú: ele chacoalha esperando o toque, a tampa voa, raios de luz giram
 * e os prêmios aparecem um a um como cartas virando.
 */
export function ChestOpening({ chest, remaining, onOpen, onClose }: {
  chest: FoundChest; remaining: number; onOpen: (chest: FoundChest) => Promise<Loot[]>; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed');
  const [loot, setLoot] = useState<Loot[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  async function open() {
    if (phase !== 'closed') return;
    setPhase('opening');
    setError('');
    try {
      setLoot(await onOpen(chest));
      window.setTimeout(() => setPhase('open'), 700);
    } catch (reason) {
      setPhase('closed');
      setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o baú.');
    }
  }

  const big = chest.size === 'big';
  return <dialog ref={dialogRef} className={`pixel-dialog pixel-frame game-dialog chest-dialog is-${phase}`} aria-labelledby="chest-title" onCancel={event=>{ event.preventDefault(); if (phase !== 'opening') onClose(); }}>
    <header className="panel-heading"><h2 id="chest-title">{big ? '🎁 Baú grande!' : '🎁 Um baú!'}</h2><span className="panel-tag">{CHAPTERS[chest.chapter].name}{chest.loop > 1 ? ` · jornada ${chest.loop}` : ''}</span></header>
    <div className="chest-stage">
      <span className="chest-rays" aria-hidden="true"/>
      <button type="button" className="chest-button" onClick={open} disabled={phase !== 'closed'} aria-label="Abrir o baú">
        <svg className={`treasure-chest ${big ? 'is-big' : ''}`} viewBox="0 0 48 40" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M4 18h40v20H4Z" fill="#7a4a26"/><path d="M6 20h36v16H6Z" fill="#a86b35"/><path d="M6 26h36v2H6Z" fill="#7a4a26"/>
          <path d="M4 18h4v20H4Zm36 0h4v20h-4Z" fill={big ? '#f2c453' : '#c6ccd6'}/><path d="M20 18h8v10h-8Z" fill={big ? '#f2c453' : '#c6ccd6'}/><path d="M23 21h2v4h-2Z" fill="#3b2418"/>
          <g className="treasure-lid"><path d="M4 8h40v10H4Z" fill="#8a5838"/><path d="M8 4h32v4H8Z" fill="#8a5838"/><path d="M6 10h36v6H6Z" fill="#b07a4c"/><path d="M4 8h4v10H4Zm36 0h4v10h-4ZM20 8h8v10h-8Z" fill={big ? '#f2c453' : '#c6ccd6'}/></g>
          <path className="treasure-glow" d="M10 16h28v4H10Z" fill="#fff6c2"/>
        </svg>
      </button>
      {phase === 'closed' && <p className="chest-hint">Toque no baú para abrir</p>}
    </div>

    {phase === 'open' && <ul className="loot-list">{loot.map((item, index) => <li key={index} className={`loot-card is-${lootRarity(item)}`} style={{ '--card': index } as CSSProperties}>
      <span className="loot-icon"><LootIcon loot={item} className="size-full"/></span>
      <strong>{lootLabel(item)}</strong>
      <small>{item.kind === 'collectible' ? lootRarity(item) : item.kind === 'coins' ? 'creditadas' : 'XP creditado'}</small>
    </li>)}</ul>}
    {error && <p role="alert" className="px-5 text-sm font-bold text-[#8c3027]">{error}</p>}

    <footer className="welcome-actions">
      {phase === 'open'
        ? <button type="button" className="pixel-button primary-button" onClick={onClose}>{remaining > 0 ? `Guardar tudo (mais ${remaining} ${remaining === 1 ? 'baú' : 'baús'})` : 'Guardar tudo'}</button>
        : <><button type="button" className="pixel-button" disabled={phase === 'opening'} onClick={onClose}>Depois</button><button type="button" className="pixel-button primary-button" disabled={phase !== 'closed'} onClick={open}>Abrir baú</button></>}
    </footer>
  </dialog>;
}
