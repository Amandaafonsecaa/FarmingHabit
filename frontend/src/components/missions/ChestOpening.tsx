import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CHAPTERS } from '../../lib/journey';
import type { FoundChest, Loot } from '../../lib/treasure';
import { boostersOf, type OwnedCard } from '../../lib/cards';
import { LootIcon, lootLabel, lootRarity } from './TreasureIcons';
import { BoosterPack, BoosterSummary, CardReveal } from './BoosterOpening';
import { flyCoins } from '../../lib/coinFlight';
import { prefersCalm, useRollingNumber } from '../../hooks/useRollingNumber';

type Phase = 'tap' | 'charging' | 'burst' | 'reveal' | 'booster' | 'cards' | 'done';
const TAPS_TO_OPEN = 3;
const FLIP_EVERY_MS = 650;

/** Número que sobe do zero até o valor quando a carta vira */
function CountUp({ value, active }: { value: number; active: boolean }) {
  return <>{useRollingNumber(active ? value : 0, 900)}</>;
}

/** Carta de prêmio (moedas ou poção): chega virada para baixo e vira com o efeito da raridade */
function LootCard({ loot, index, flipped, onFlip }: { loot: Loot; index: number; flipped: boolean; onFlip: () => void }) {
  const rarity = lootRarity(loot);
  return <li className={`loot-card-slot is-${rarity} ${flipped ? 'is-flipped' : ''}`} style={{ '--card': index } as CSSProperties}>
    <button type="button" className="loot-card-inner" onClick={onFlip} disabled={flipped} aria-label={flipped ? lootLabel(loot) : 'Virar carta'}>
      <span className="loot-face loot-back" aria-hidden="true"><span className="loot-back-mark">?</span></span>
      <span className="loot-face loot-front">
        {rarity !== 'comum' && <span className="loot-rays" aria-hidden="true"/>}
        <span className="loot-icon"><LootIcon loot={loot} className="size-full"/></span>
        <strong className="loot-name">{loot.kind === 'coins' ? <><CountUp value={loot.amount} active={flipped}/> moedas</> : lootLabel(loot)}</strong>
        <span className="loot-rarity">{loot.kind === 'coins' ? 'Moedas' : 'Poção'}</span>
        {rarity !== 'comum' && flipped && <span className="loot-sparkles" aria-hidden="true">{Array.from({ length: 6 }, (_, spark) => <span key={spark} style={{ '--s': spark } as CSSProperties}/>)}</span>}
      </span>
    </button>
  </li>;
}

/**
 * Abertura do baú como mini-jogo: toque 3 vezes (ele treme e vaza luz), clarão com fonte de moedas,
 * as cartas de moedas/XP viram, e então vem o pacote de cartas: arrastar para rasgar e revelar uma a uma.
 */
export function ChestOpening({ chest, remaining, owned, onOpen, onClose }: {
  chest: FoundChest; remaining: number; owned: Record<string, OwnedCard>; onOpen: (chest: FoundChest) => Promise<Loot[]>; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('tap');
  const [taps, setTaps] = useState(0);
  const [loot, setLoot] = useState<Loot[]>([]);
  const [flipped, setFlipped] = useState(0);
  const [legendary, setLegendary] = useState(false);
  const [error, setError] = useState('');
  // O álbum antes deste baú: decide o que é carta "Nova!"
  const [ownedBefore] = useState(owned);
  const big = chest.size === 'big';
  const prizes = loot.filter(item => item.kind === 'coins' || item.kind === 'xp');
  const boosters = boostersOf(loot);
  const pulls = boosters.flatMap(booster => booster.cards);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // Revelação: vira uma carta por vez (todas de uma vez no modo calmo) e depois chega o pacote
  useEffect(() => {
    if (phase !== 'reveal') return;
    if (flipped >= prizes.length) {
      const timer = window.setTimeout(() => setPhase(pulls.length ? 'booster' : 'done'), prefersCalm() ? 0 : 900);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setFlipped(count => count + 1), prefersCalm() ? 0 : FLIP_EVERY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, flipped, prizes.length, pulls.length]);

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

  const totals = {
    coins: loot.reduce((sum, item) => sum + (item.kind === 'coins' ? item.amount : 0), 0),
    xp: loot.reduce((sum, item) => sum + (item.kind === 'xp' ? item.amount : 0), 0),
  };

  // Ao guardar, as moedas voam até o contador do mapa (o diálogo fica por cima de tudo, então voam ao fechar)
  function store() {
    flyCoins(lootRef.current, totals.coins);
    onClose();
  }
  const opened = phase !== 'tap' && phase !== 'charging';
  const trim = big ? '#f2c453' : '#c6ccd6';
  const closable = phase === 'tap' || phase === 'done';

  return <dialog ref={dialogRef} className={`pixel-dialog pixel-frame game-dialog chest-dialog phase-${phase} taps-${taps} ${legendary ? 'has-legendary' : ''}`} aria-labelledby="chest-title"
    onCancel={event=>{ event.preventDefault(); if (closable) onClose(); }}>
    <header className="panel-heading"><h2 id="chest-title">{phase === 'booster' || phase === 'cards' ? 'Pacote de cartas!' : big ? 'Baú grande!' : 'Um baú!'}</h2><span className="panel-tag">{CHAPTERS[chest.chapter].name}{chest.loop > 1 ? ` · jornada ${chest.loop}` : ''}</span></header>

    <div ref={lootRef} className="chest-stage">
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
      {phase === 'reveal' && <ul className="loot-list">
        {prizes.map((item, index) => <LootCard key={index} loot={item} index={index} flipped={index < flipped} onFlip={()=>setFlipped(count => Math.max(count, index + 1))}/>)}
      </ul>}
      {phase === 'booster' && <BoosterPack set={boosters[0].set} count={pulls.length} onTorn={()=>setPhase('cards')}/>}
      {phase === 'cards' && <CardReveal pulls={pulls} owned={ownedBefore} onLegendary={()=>setLegendary(true)} onDone={()=>setPhase('done')}/>}
      {phase === 'done' && pulls.length > 0 && <BoosterSummary pulls={pulls} owned={ownedBefore}/>}
    </div>

    {phase === 'done' && <p className="loot-summary"><strong>Você ganhou:</strong> {totals.coins} moedas{totals.xp ? ` · ${totals.xp} XP` : ''}{pulls.length ? ` · ${pulls.length} cartas` : ''}</p>}
    {error && <p role="alert" className="px-5 text-sm font-bold text-[#8c3027]">{error}</p>}

    <footer className="welcome-actions">
      {phase === 'done'
        ? <button type="button" className="pixel-button primary-button" onClick={store}>{remaining > 0 ? `Guardar no álbum (mais ${remaining} ${remaining === 1 ? 'baú' : 'baús'})` : 'Guardar no álbum'}</button>
        : phase === 'cards'
          ? <button type="button" className="pixel-button" onClick={()=>setPhase('done')}>Ver todas</button>
          : <button type="button" className="pixel-button" disabled={phase !== 'tap'} onClick={onClose}>Depois</button>}
    </footer>
  </dialog>;
}
