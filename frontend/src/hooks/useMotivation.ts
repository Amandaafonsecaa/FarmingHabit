import { useEffect, useState } from 'react';
import { getMotivation, saveMotivation, type Motivation } from '../services/api';

/** Por enquanto a foto fica só neste navegador (a frase continua sincronizada pelo servidor) */
export const MOTIVATION_PHOTO_KEY = 'farminghabit.motivation-photo.v1';

// Guardada como JSON (string entre aspas) para entrar no backup das Configurações, que lê tudo como JSON
const readPhoto = (): string | null => { try { const value = JSON.parse(localStorage.getItem(MOTIVATION_PHOTO_KEY) ?? 'null'); return typeof value === 'string' ? value : null; } catch { return null; } };

/** Motivação do jogador: frase no servidor (quando `ready`, ou seja, o jogador já carregou), foto no navegador */
export function useMotivation(ready: boolean) {
  const [text, setText] = useState<Motivation | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(readPhoto);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    let active = true;
    getMotivation()
      .then(result => { if (active) setText(result); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível carregar a motivação.'); });
    return () => { active = false; };
  }, [ready]);

  /** photo: data URL troca, null remove, undefined mantém */
  async function save(changes: { text: string; photo?: string | null }) {
    if (!ready) throw new Error('Servidor indisponível.');
    if (changes.photo !== undefined) {
      try {
        if (changes.photo) localStorage.setItem(MOTIVATION_PHOTO_KEY, JSON.stringify(changes.photo));
        else localStorage.removeItem(MOTIVATION_PHOTO_KEY);
      } catch { throw new Error('Não deu para guardar a foto neste navegador (espaço cheio?). Tente uma foto menor.'); }
      setPhotoUrl(changes.photo);
    }
    setText(await saveMotivation({ text: changes.text }));
  }

  const motivation: Motivation | null = text || photoUrl ? { text: text?.text ?? '', photoUrl, createdAt: text?.createdAt ?? null, updatedAt: text?.updatedAt ?? null } : null;
  return { motivation, error, save };
}
