import { skyBackground } from '../lib/timeOfDay';
import { useRef, type PointerEvent } from 'react';
import { WorldScenery, type GardenPlot } from './WorldScenery';
import { WorldInfo } from './WorldInfo';
import { SkyLayer } from './home/SkyLayer';
import { CoinHud } from './home/CoinHud';
import { PetalRain, SeasonParticles } from './home/SeasonParticles';
import { useSettings } from '../hooks/useSettings';
import { useNow } from '../hooks/useNow';
import { prefersCalm } from '../hooks/useRollingNumber';
import { PHASE_NAMES, SEASON_NAMES, phaseFor, seasonFor } from '../lib/timeOfDay';
// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;

interface GameWorldProps {
  player: { name: string; level: number; xp: number } | null; coins: number | null; today: Date;
  plots: GardenPlot[]; onHarvest: (goalId: string, element: Element, index: number) => void; poppedId: string | null;
  perfectDay: boolean; celebrating: boolean;
}

/**
 * A fazenda da Casa: o céu segue a hora real (amanhecer, dia, entardecer, noite) e a estação do ano,
 * a horta são as metas de hoje, o contador de moedas recebe as moedinhas voando e o dia perfeito ganha pétalas e um arco-íris passageiro.
 */
export function GameWorld({ player, coins, today, plots, onHarvest, poppedId, perfectDay, celebrating }: GameWorldProps) {
  const [{ farmName }] = useSettings();
  const now = useNow();
  const phase = phaseFor(now);
  const season = seasonFor(now);
  const worldRef = useRef<HTMLElement>(null);
  const frame = useRef(0);

  // Profundidade: nuvens e morros do fundo acompanham o mouse em velocidades diferentes
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || prefersCalm() || frame.current) return;
    const { clientX, clientY } = event;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const element = worldRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--px', (((clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
      element.style.setProperty('--py', (((clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
    });
  }
  const resetParallax = () => { worldRef.current?.style.setProperty('--px', '0'); worldRef.current?.style.setProperty('--py', '0'); };

  return <section ref={worldRef} className={`game-world phase-${phase} season-${season} ${perfectDay ? 'is-perfect' : ''}`} aria-labelledby="world-heading" style={{ background: skyBackground(phase) }}
    onPointerMove={onPointerMove} onPointerLeave={resetParallax}>
    <SkyLayer phase={phase} rainbow={celebrating}/>
    <h1 id="world-heading" className="sr-only">{farmName} · {SEASON_NAMES[season]}, {PHASE_NAMES[phase].toLowerCase()}</h1>
    <CoinHud coins={coins} className="world-coin-hud"/>
    <header className="world-header"><WorldInfo level={player?.level ?? null} totalXp={player?.xp ?? null} xpPerLevel={XP_PER_LEVEL} farmName={farmName} today={today}/></header>
    <WorldScenery level={player?.level ?? 1} plots={plots} onHarvest={onHarvest} poppedId={poppedId} perfectDay={perfectDay}/>
    <div className="world-tint" aria-hidden="true"/>
    <SeasonParticles season={season}/>
    {celebrating && <PetalRain/>}
  </section>;
}
