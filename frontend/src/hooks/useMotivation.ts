import { useEffect, useState } from 'react';
import { getMotivation, saveMotivation, type Motivation } from '../services/api';

/** Motivação do jogador, sincronizada com o servidor */
export function useMotivation(userId: string | null) {
  const [motivation, setMotivation] = useState<Motivation | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getMotivation(userId)
      .then(result => { if (active) setMotivation(result); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar a motivação.'); });
    return () => { active = false; };
  }, [userId]);

  async function save(changes: { text: string; photo?: string | null }) {
    if (!userId) throw new Error('Servidor indisponível.');
    setMotivation(await saveMotivation(userId, changes));
  }

  return { motivation, error, save };
}
