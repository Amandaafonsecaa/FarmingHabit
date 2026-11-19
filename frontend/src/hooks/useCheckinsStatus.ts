import { useEffect, useState } from 'react';
import { CHECKINS_STATUS_EVENT, checkinsStatus, retryCheckins } from '../lib/checkins';

/** O histórico das metas já chegou do servidor nesta abertura? Até lá as listas de metas mostram o carregando */
export function useCheckinsStatus() {
  const [status, setStatus] = useState(checkinsStatus);
  useEffect(() => {
    const refresh = () => setStatus(checkinsStatus());
    window.addEventListener(CHECKINS_STATUS_EVENT, refresh);
    // Confere de novo ao se inscrever: um aviso disparado entre o desenho e este efeito não se perde
    refresh();
    return () => window.removeEventListener(CHECKINS_STATUS_EVENT, refresh);
  }, []);
  return { status, retry: () => { void retryCheckins(); } };
}
