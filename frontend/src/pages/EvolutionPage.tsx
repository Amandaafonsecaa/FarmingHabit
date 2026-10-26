import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GymHero } from '../components/evolution/GymHero';
import { WeekBoard } from '../components/evolution/WeekBoard';
import { MotivationCorner } from '../components/evolution/MotivationCorner';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useMotivation } from '../hooks/useMotivation';
import { toast } from '../lib/toast';
import { goalWeek } from '../lib/coach';
import { loadPlayer, type Player } from '../services/api';
import type { AppPage } from '../types/navigation';

// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;

/** Evolução: a semana de relance e a motivação da pessoa, lado a lado, com o Coach Rocha na academia */
export function EvolutionPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { goals, log } = useGoalTracker();
  const today = useToday();
  const [player, setPlayer] = useState<Player | null>(null);
  const [offline, setOffline] = useState(false);
  const motivation = useMotivation(player?.id ?? null);

  useEffect(() => {
    let active = true;
    loadPlayer().then(user => { if (active) setPlayer(user); }).catch(() => { if (active) setOffline(true); });
    return () => { active = false; };
  }, []);

  const coach = { name: player?.name ?? 'campeão', weeks: goals.map(goal => goalWeek(goal, log, today)), log, today };

  return <MainLayout page="evolution" onNavigate={onNavigate}
    world={<GymHero level={player?.level ?? 1} xpInLevel={(player?.xp ?? 0) % XP_PER_LEVEL} xpPerLevel={XP_PER_LEVEL} goals={goals} log={log} coach={coach}/>}>
    {offline && <p role="alert" className="world-status">Servidor indisponível: o nível aparece quando o backend voltar.</p>}
    <div className="evolution-layout">
      {/* A semana e o cantinho da motivação lado a lado */}
      <WeekBoard goals={goals} log={log} today={today}/>
      <MotivationCorner motivation={motivation.motivation} disabled={!player}
        onSave={async changes=>{ await motivation.save(changes); toast('Motivação salva! Ela vai estar no quadro todos os dias.'); }}/>
    </div>
    <p role="status" className="world-status">Cada pequeno passo também é crescimento.</p>
  </MainLayout>;
}
