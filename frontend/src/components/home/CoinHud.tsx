import { useEffect, useState } from 'react';
import { LANDED_EVENT } from '../../lib/coinFlight';
import { useRollingNumber } from '../../hooks/useRollingNumber';
import { PixelIcon } from '../PixelIcon';

/** Contador de moedas fixo na cena: destino das moedinhas voando, dá um pulinho quando elas chegam */
export function CoinHud({ coins, className = '' }: { coins: number | null; className?: string }) {
  const shown = useRollingNumber(coins ?? 0);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    const onLand = () => setBump(count => count + 1);
    window.addEventListener(LANDED_EVENT, onLand);
    return () => window.removeEventListener(LANDED_EVENT, onLand);
  }, []);
  return <div key={bump} className={`coin-hud pixel-frame ${bump ? 'is-bumped' : ''} ${className}`} data-coin-target role="status" aria-label={`${coins ?? 0} moedas`}>
    <span className="coin-hud-icon"><PixelIcon name="coin" className="size-5"/></span><strong>{coins === null ? '–' : shown}</strong>
  </div>;
}
