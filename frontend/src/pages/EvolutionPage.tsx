import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { GymHero } from '../components/evolution/GymHero';
import { WeekBoard } from '../components/evolution/WeekBoard';
import { WeeklyHarvestChart, type WeekHarvest } from '../components/evolution/WeeklyHarvestChart';
import { StreakPanel } from '../components/goals/StreakPanel';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { addDays, harvestsBetween, startOfWeek } from '../lib/goalLogic';
import { goalWeek } from '../lib/coach';
import { loadPlayer, type Player } from '../services/api';
import type { AppPage } from '../types/navigation';

// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/** Evolução: só o que a pessoa fez e deixou de fazer (semana, sequência e colheitas), com o Coach Rocha na academia */
export function EvolutionPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { goals, log } = useGoalTracker();
  const today = useToday();
  const [player, setPlayer] = useState<Player | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    loadPlayer().then(user => { if (active) setPlayer(user); }).catch(() => { if (active) setOffline(true); });
    return () => { active = false; };
  }, []);

  const monday = startOfWeek(today);
  const weeks: WeekHarvest[] = Array.from({ length: 8 }, (_, index) => {
    const start = addDays(monday, (index - 7) * 7);
    const end = addDays(start, 6);
    return { label: shortDate.format(start), range: `${shortDate.format(start)} a ${shortDate.format(end)}`, value: harvestsBetween(goals, log, start, end > today ? today : end), current: index === 7 };
  });
  const coach = { name: player?.name ?? 'campeão', weeks: goals.map(goal => goalWeek(goal, log, today)), log, today };

  return <MainLayout page="evolution" onNavigate={onNavigate}
    world={<GymHero level={player?.level ?? 1} xpInLevel={(player?.xp ?? 0) % XP_PER_LEVEL} xpPerLevel={XP_PER_LEVEL} coins={player?.coins ?? null} coach={coach}/>}>
    {offline && <p role="alert" className="world-status">Servidor indisponível: nível e moedas aparecem quando o backend voltar.</p>}
    <div className="evolution-layout">
      <div className="evolution-main"><WeekBoard goals={goals} log={log} today={today}/><WeeklyHarvestChart weeks={weeks}/></div>
      <div className="evolution-side"><StreakPanel goals={goals} log={log} today={today}/></div>
    </div>
    <p role="status" className="world-status">Cada pequeno passo também é crescimento.</p>
  </MainLayout>;
}
