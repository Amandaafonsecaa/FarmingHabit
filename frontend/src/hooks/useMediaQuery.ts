import { useEffect, useState } from 'react';

/** Acompanha uma media query (ex.: celular) e re-renderiza quando ela muda */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** Mesma quebra do CSS (max-width: 1099px): no celular e no tablet a navegação vira barra inferior fixa */
export const PHONE_QUERY = '(max-width: 1099px)';
