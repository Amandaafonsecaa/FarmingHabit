import { useEffect, useRef, useState } from 'react';

export const prefersCalm = () => document.documentElement.classList.contains('calm-mode') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Número que rola até o valor novo (sobe ou desce com suavidade) */
export function useRollingNumber(value: number, duration = 700) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (prefersCalm()) { setShown(value); from.current = value; return; }
    const start = performance.now(), initial = from.current;
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / duration);
      setShown(Math.round(initial + (value - initial) * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step); else from.current = value;
    });
    return () => { cancelAnimationFrame(frame); from.current = value; };
  }, [value, duration]);
  return shown;
}
