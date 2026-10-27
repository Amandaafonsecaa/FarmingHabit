import { useEffect, useState } from 'react';
import type { Mission } from '../types/world';
import type { NewMission, Player } from '../services/api';
import { completeMission, uncompleteMission, updateMission, createMission, deleteMission, listMissions, loadPlayer } from '../services/api';

/** Missões e jogador vindos do backend, com as ações do quadro de aventuras */
export function useMissionBoard() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      const list = await listMissions();
      if (!active) return;
      setPlayer(user); setMissions(list);
    })()
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Não foi possível falar com o servidor.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function create(mission: NewMission) {
    if (!player) throw new Error('Servidor indisponível.');
    const created = await createMission(mission);
    setMissions(current => [created, ...current]);
  }

  async function edit(id: string, changes: NewMission) {
    const updated = await updateMission(id, changes);
    setMissions(current => current.map(mission => mission.id === id ? updated : mission));
  }

  /** Conclui no backend: credita XP e moedas e devolve o saldo atualizado do jogador */
  async function complete(id: string) {
    if (!player) throw new Error('Servidor indisponível.');
    const result = await completeMission(id);
    setMissions(current => current.map(mission => mission.id === id ? result.mission : mission));
    setPlayer(current => current && { ...current, ...result.user });
  }

  /** Desfaz no backend: a missão volta a ficar em aberto e o XP e as moedas saem do saldo */
  async function uncomplete(id: string) {
    if (!player) throw new Error('Servidor indisponível.');
    const result = await uncompleteMission(id);
    setMissions(current => current.map(mission => mission.id === id ? result.mission : mission));
    setPlayer(current => current && { ...current, ...result.user });
  }

  async function remove(id: string) {
    await deleteMission(id);
    setMissions(current => current.filter(mission => mission.id !== id));
  }

  /** Jogador atualizado por outra ação já paga pelo servidor (ex.: baú aberto) */
  const applyPlayer = (next: Player) => setPlayer(next);

  return { player, missions, loading, error, create, edit, complete, uncomplete, remove, applyPlayer };
}

// "Partir em aventura" ainda não existe no backend: guardamos quais missões estão em andamento neste navegador
const ACCEPTED_KEY = 'farminghabit.missions.accepted.v1';

export function useAcceptedMissions() {
  const [accepted, setAccepted] = useState<string[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem(ACCEPTED_KEY) ?? '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(ACCEPTED_KEY, JSON.stringify(accepted)); } catch { /* modo privado: segue só em memória */ }
  }, [accepted]);
  const accept = (id: string) => setAccepted(current => current.includes(id) ? current : [...current, id]);
  const abandon = (id: string) => setAccepted(current => current.filter(item => item !== id));
  return { accepted, accept, abandon };
}

/** Patente da missão pelo tamanho da recompensa */
export function rankOf(mission: Mission) {
  if (mission.xp >= 100) return { stars: 3, name: 'Lendária' };
  if (mission.xp >= 40) return { stars: 2, name: 'Aventura' };
  return { stars: 1, name: 'Exploração' };
}
