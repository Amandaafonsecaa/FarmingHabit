import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CHAPTERS } from '../../lib/journey';
import type { FoundChest, Loot } from '../../lib/treasure';
import { LootIcon, lootLabel, lootRarity } from './TreasureIcons';
import { flyCoins } from '../../lib/coinFlight';
import { prefersCalm, useRollingNumber } from '../../hooks/useRollingNumber';

type Phase = 'tap' | 'charging' | 'burst' | 'reveal' | 'done';
const TAPS_TO_OPEN = 3;
const FLIP_EVERY_MS = 650;
const RARITY_LABEL = { comum: 'Comum', raro: 'Raro', 'lendário': 'Lendário' } as const;

/** Número que sobe do zero até o valor quando a carta vira */
function CountUp({ value, active }: { value: number; active: boolean }) {
  return <>{useRollingNumber(active ? value : 0, 900)}</>;
}

/** Carta de prêmio: chega virada para baixo e vira com o efeito da raridade */
function LootCard({ loot, index, flipped, onFlip }: { loot: Loot; index: number; flipped: boolean; onFlip: () => void }) {
  const rarity = lootRarity(loot);
  return <li className={`loot-card-slot is-${rarity} ${flipped ? 'is-flipped' : ''}`} style={{ '--card': index } as CSSProperties}>
    <button type="button" className="loot-card-inner" onClick={onFlip} disabled={flipped} aria-label={flipped ? lootLabel(loot) : 'Virar carta'}>
      <span className="loot-face loot-back" aria-hidden="true"><span className="loot-back-mark">?</span></span>
      <span className="loot-face loot-front">
        {rarity !== 'comum' && <span className="loot-rays" aria-hidden="true"/>}
        <span className="loot-icon"><LootIcon loot={loot} className="size-full"/></span>
        <strong className="loot-name">{loot.kind === 'coins' ? <><CountUp value={loot.amount} active={flipped}/> moedas</> : lootLabel(loot)}</strong>
        <span className="loot-rarity">{loot.kind === 'collectible' ? RARITY_LABEL[rarity] : loot.kind === 'coins' ? 'Moedas' : 'Poção'}</span>
        {rarity !== 'comum' && flipped && <span className="loot-sparkles" aria-hidden="true">{Array.from({ length: rarity === 'lendário' ? 10 : 6 }, (_, spark) => <span key={spark} style={{ '--s': spark } as CSSProperties}/>)}</span>}
      </span>
    </button>
    {rarity === 'lendário' && flipped && <span className="legendary-banner" aria-hidden="true">LENDÁRIO!</span>}
  </li>;
}

/**
 * Abertura do baú como mini-jogo: toque 3 vezes (ele treme e vaza luz), clarão com fonte de moedas,
 * e as cartas de prêmio viram uma a uma com o efeito de cada raridade.
 */
export function ChestOpening({ chest, remaining, onOpen, onClose }: {
  chest: FoundChest; remaining: number; onOpen: (chest: FoundChest) => Promise<Loot[]>; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lootRef = useRef<HTMLUListElement>(null);
  const [phase, setPhase] = useState<Phase>('tap');
  const [taps, setTaps] = useState(0);
  const [loot, setLoot] = useState<Loot[]>([]);
  const [flipped, setFlipped] = useState(0);
  const [error, setError] = useState('');
  const big = chest.size === 'big';
  const legendaryShown = loot.slice(0, flipped).some(item => lootRarity(item) === 'lendário');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // Revelação: vira uma carta por vez (todas de uma vez no modo calmo)
  useEffect(() => {
    if (phase !== 'reveal') return;
    if (flipped >= loot.length) { setPhase('done'); return; }
    const timer = window.setTimeout(() => setFlipped(count => count + 1), prefersCalm() ? 0 : FLIP_EVERY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, flipped, loot.length]);

  async function tap() {
    if (phase !== 'tap') return;
    const next = taps + 1;
    setTaps(next);
    if (next < TAPS_TO_OPEN) return;
    setPhase('charging');
    setError('');
    try {
      const result = await onOpen(chest);
      setLoot(result);
      setPhase('burst');
      window.setTimeout(() => setPhase('reveal'), prefersCalm() ? 0 : 900);
    } catch (reason) {
      setPhase('tap');
      setTaps(0);
      setError(reason instanceof Error ? reason.message : 'Não foi possível abrir o baú.');
    }
  }

  // Ao guardar, as moedas voam até o contador do mapa (o diálogo fica por cima de tudo, então voam ao fechar)
  function store() {
    const coins = loot.reduce((sum, item) => sum + (item.kind === 'coins' ? item.amount : 0), 0);
    flyCoins(lootRef.current, coins);
    onClose();
  }

  const totals = {
    coins: loot.reduce((sum, item) => sum + (item.kind === 'coins' ? item.amount : 0), 0),
    xp: loot.reduce((sum, item) => sum + (item.kind === 'xp' ? item.amount : 0), 0),
    finds: loot.filter(item => item.kind === 'collectible').length,
  };
  const opened = phase === 'burst' || phase === 'reveal' || phase === 'done';
  const trim = big ? '#f2c453' : '#c6ccd6';

  return <dialog ref={dialogRef} className={`pixel-dialog pixel-frame game-dialog chest-dialog phase-${phase} taps-${taps} ${legendaryShown ? 'has-legendary' : ''}`} aria-labelledby="chest-title"
    onCancel={event=>{ event.preventDefault(); if (phase === 'tap' || phase === 'done') onClose(); }}>
    <header className="panel-heading"><h2 id="chest-title">{big ? 'Baú grande!' : 'Um baú!'}</h2><span className="panel-tag">{CHAPTERS[chest.chapter].name}{chest.loop > 1 ? ` · jornada ${chest.loop}` : ''}</span></header>

    <div className="chest-stage">
      <span className="stage-sparkles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ '--i': index } as CSSProperties}/>)}</span>
      <span className="chest-rays" aria-hidden="true"/>
      {!opened || phase === 'burst' ? <>
        <button type="button" className="chest-button" onClick={tap} disabled={phase !== 'tap'} aria-label={`Bater no baú (${taps} de ${TAPS_TO_OPEN})`}>
          {/* key por toque: reinicia a tremida a cada batida */}
          <svg key={taps} className={`treasure-chest ${big ? 'is-big' : ''}`} viewBox="0 0 48 40" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M4 18h40v20H4Z" fill="#7a4a26"/><path d="M6 20h36v16H6Z" fill="#a86b35"/><path d="M6 26h36v2H6Z" fill="#7a4a26"/>
            <path d="M4 18h4v20H4Zm36 0h4v20h-4Z" fill={trim}/><path d="M20 18h8v10h-8Z" fill={trim}/><path d="M23 21h2v4h-2Z" fill="#3b2418"/>
            {/* Frestas de luz que aumentam a cada toque */}
            <g className="treasure-cracks"><path d="M6 17h36v2H6Z" fill="#fff6c2"/><path d="M12 22h2v4h-2Zm22 4h2v5h-2Z" fill="#ffe38b"/></g>
            <g className="treasure-lid"><path d="M4 8h40v10H4Z" fill="#8a5838"/><path d="M8 4h32v4H8Z" fill="#8a5838"/><path d="M6 10h36v6H6Z" fill="#b07a4c"/><path d="M4 8h4v10H4Zm36 0h4v10h-4ZM20 8h8v10h-8Z" fill={trim}/></g>
            <path className="treasure-glow" d="M8 14h32v6H8Z" fill="#fff6c2"/>
          </svg>
        </button>
        <span className="chest-platform" aria-hidden="true"/>
      </> : null}
      {phase === 'tap' && <div className="tap-meter" aria-live="polite">
        <span className="tap-dots" aria-hidden="true">{Array.from({ length: TAPS_TO_OPEN }, (_, index) => <span key={index} className={index < taps ? 'is-on' : ''}/>)}</span>
        <p>{taps === 0 ? 'Toque no baú para abrir!' : taps === 1 ? 'Ele está tremendo… de novo!' : 'Quase! Mais uma vez!'}</p>
      </div>}
      {phase === 'charging' && <p className="tap-meter-text">Abrindo…</p>}
      {phase === 'burst' && <>
        <span className="chest-flash" aria-hidden="true"/>
        <span className="coin-fountain" aria-hidden="true">{Array.from({ length: big ? 18 : 12 }, (_, index) => <span key={index} className={index % 3 ? 'is-confetti' : 'is-coin'} style={{ '--i': index, '--dx': `${((index * 37) % 120) - 60}px` } as CSSProperties}/>)}</span>
      </>}
      {(phase === 'reveal' || phase === 'done') && <ul ref={lootRef} className="loot-list">
        {loot.map((item, index) => <LootCard key={index} loot={item} index={index} flipped={index < flipped} onFlip={()=>setFlipped(count => Math.max(count, index + 1))}/>)}
      </ul>}
    </div>

    {phase === 'done' && <p className="loot-summary"><strong>Você ganhou:</strong> {totals.coins} moedas{totals.xp ? ` · ${totals.xp} XP` : ''}{totals.finds ? ` · ${totals.finds} ${totals.finds === 1 ? 'achado' : 'achados'}` : ''}</p>}
    {error && <p role="alert" className="px-5 text-sm font-bold text-[#8c3027]">{error}</p>}

    <footer className="welcome-actions">
      {phase === 'done'
        ? <button type="button" className="pixel-button primary-button" onClick={store}>{remaining > 0 ? `Guardar tudo (mais ${remaining} ${remaining === 1 ? 'baú' : 'baús'})` : 'Guardar tudo'}</button>
        : <button type="button" className="pixel-button" disabled={phase !== 'tap'} onClick={onClose}>Depois</button>}
    </footer>
  </dialog>;
}
