import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GymHero } from '../components/evolution/GymHero';
import { WeekBoard } from '../components/evolution/WeekBoard';
import { SketchbookInsights } from '../components/evolution/SketchbookInsights';
import { WeekBloomChart } from '../components/evolution/WeekBloomChart';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { goalWeek } from '../lib/coach';
import { listMissions, loadPlayer, type Player } from '../services/api';
import type { Mission } from '../types/world';
import type { AppPage } from '../types/navigation';

// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;

/** Evolução: as áreas da vida e a semana de relance, com o Coach Rocha na academia */
export function EvolutionPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { goals, log } = useGoalTracker();
  const today = useToday();
  const [player, setPlayer] = useState<Player | null>(null);
  const [offline, setOffline] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      if (active) setPlayer(user);
      // Missões entram em moedas e XP da semana (pela data em que foram cumpridas)
      const list = await listMissions(user.id);
      if (active) setMissions(list);
    })().catch(() => { if (active) setOffline(true); });
    return () => { active = false; };
  }, []);

  const coach = { name: player?.name ?? 'campeão', weeks: goals.map(goal => goalWeek(goal, log, today)), log, today };

  return <MainLayout page="evolution" onNavigate={onNavigate}
    world={<GymHero level={player?.level ?? 1} xpInLevel={(player?.xp ?? 0) % XP_PER_LEVEL} xpPerLevel={XP_PER_LEVEL} goals={goals} log={log} coach={coach}/>}>
    {offline && <p role="alert" className="world-status">Servidor indisponível: o nível aparece quando o backend voltar.</p>}
    <WeekBloomChart goals={goals} log={log} today={today} missions={missions}/>
    {/* Caderninho de notas à esquerda; "Sua semana" continua como o principal */}
    <div className="evolution-layout">
      <SketchbookInsights goals={goals} log={log} today={today}/>
      <WeekBoard goals={goals} log={log} today={today}/>
    </div>
    <p role="status" className="world-status">Cada pequeno passo também é crescimento.</p>
  </MainLayout>;
}
