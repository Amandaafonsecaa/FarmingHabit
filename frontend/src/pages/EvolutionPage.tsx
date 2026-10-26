import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GymHero } from '../components/evolution/GymHero';
import { WeekBoard } from '../components/evolution/WeekBoard';
import { MotivationCorner } from '../components/evolution/MotivationCorner';
import { InsightNotes } from '../components/evolution/InsightNotes';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useMotivation } from '../hooks/useMotivation';
import { toast } from '../lib/toast';
import { goalWeek } from '../lib/coach';
import { compareWeeks, weekInsights } from '../lib/weekCompare';
import { loadPlayer, type Player } from '../services/api';
import type { AppPage } from '../types/navigation';

// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;

/** Evolução: a semana de relance, a motivação da pessoa e as análises em post-it, com o Coach Rocha na academia */
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

  const compare = compareWeeks(goals, log, today);
  const coach = { name: player?.name ?? 'campeão', weeks: goals.map(goal => goalWeek(goal, log, today)), log, today };

  return <MainLayout page="evolution" onNavigate={onNavigate}
    world={<GymHero level={player?.level ?? 1} xpInLevel={(player?.xp ?? 0) % XP_PER_LEVEL} xpPerLevel={XP_PER_LEVEL} goals={goals} log={log} coach={coach}/>}>
    {offline && <p role="alert" className="world-status">Servidor indisponível: o nível aparece quando o backend voltar.</p>}
    <div className="evolution-layout">
      {/* A semana na largura toda; embaixo, o cantinho da motivação e as análises lado a lado */}
      <WeekBoard goals={goals} log={log} today={today}/>
      <MotivationCorner motivation={motivation.motivation} disabled={!player}
        onSave={async changes=>{ await motivation.save(changes); toast('Motivação salva! Ela vai estar no quadro todos os dias.'); }}/>
      <InsightNotes insights={weekInsights(compare)}/>
    </div>
    <p role="status" className="world-status">Cada pequeno passo também é crescimento.</p>
  </MainLayout>;
}
