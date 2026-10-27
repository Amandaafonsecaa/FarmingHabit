import { useEffect, useRef } from 'react';

/**
 * Chama `onChange` quando a chave do localStorage muda por fora deste componente:
 * a sincronização com a conta (que chega depois do app abrir) ou outra aba aberta.
 */
export function useStorageChange(key: string, onChange: () => void) {
  const callback = useRef(onChange);
  useEffect(() => { callback.current = onChange; });
  useEffect(() => {
    const listener = (event: StorageEvent) => { if (event.key === key || event.key === null) callback.current(); };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [key]);
}
