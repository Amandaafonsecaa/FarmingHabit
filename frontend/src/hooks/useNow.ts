import { useEffect, useState } from 'react';

/** Relógio que atualiza a cada minuto (o céu muda de fase sem recarregar) */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    const onFocus = () => setNow(new Date());
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, []);
  return now;
}
