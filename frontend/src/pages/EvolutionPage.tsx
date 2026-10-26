import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { FarmEvolution } from '../components/evolution/FarmEvolution';
import { SkillsPanel } from '../components/evolution/SkillsPanel';
import { AchievementsPanel } from '../components/evolution/AchievementsPanel';
import { LevelRoad } from '../components/evolution/LevelRoad';
import { WeeklyHarvestChart, type WeekHarvest } from '../components/evolution/WeeklyHarvestChart';
import { StreakPanel } from '../components/goals/StreakPanel';
import { PixelIcon } from '../components/PixelIcon';
import { ProgressBar } from '../components/ProgressBar';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { useDiary } from '../hooks/useDiary';
import { addDays, fromKey, harvestsBetween, longestStreak, startOfWeek, toKey } from '../lib/goalLogic';
import { FARM_STAGES, buildAchievements, buildSkills, stageForLevel, type EvolutionStats } from '../lib/evolution';
import { listMissions, loadPlayer, type Player } from '../services/api';
import type { AppPage } from '../types/navigation';

// Regra do backend: a cada 100 XP sobe 1 nível
const XP_PER_LEVEL = 100;
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

export function EvolutionPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { goals, log } = useGoalTracker();
  const diary = useDiary();
  const today = useToday();
  const [player, setPlayer] = useState<Player | null>(null);
  const [missionsDone, setMissionsDone] = useState(0);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await loadPlayer();
      const missions = await listMissions(user.id);
      if (!active) return;
      setPlayer(user); setMissionsDone(missions.filter(mission => mission.completed).length);
    })().catch(() => { if (active) setOffline(true); });
    return () => { active = false; };
  }, []);

  // Tudo calculado a partir do que já existe: metas (canteiro), missões (backend) e diário
  const firstDay = goals.reduce((earliest, goal) => goal.createdOn < earliest ? goal.createdOn : earliest, toKey(today));
  const stats: EvolutionStats = {
    level: player?.level ?? 1,
    coins: player?.coins ?? 0,
    goals: goals.length,
    harvests: harvestsBetween(goals, log, fromKey(firstDay), today),
    bestStreak: goals.reduce((best, goal) => Math.max(best, longestStreak(goal, log, today)), 0),
    missions: missionsDone,
    pages: diary.written.length,
    quantity: goals.reduce((sum, goal) => goal.measure.kind !== 'quantity' ? sum : sum + Object.values(log).reduce((total, day) => total + (day[goal.id] ?? 0), 0), 0),
  };
  const monday = startOfWeek(today);
  const weeks: WeekHarvest[] = Array.from({ length: 8 }, (_, index) => {
    const start = addDays(monday, (index - 7) * 7);
    const end = addDays(start, 6);
    return { label: shortDate.format(start), range: `${shortDate.format(start)} a ${shortDate.format(end)}`, value: harvestsBetween(goals, log, start, end > today ? today : end), current: index === 7 };
  });

  const level = stats.level;
  const xpInLevel = (player?.xp ?? 0) % XP_PER_LEVEL;
  const stage = stageForLevel(level);
  const nextStage = FARM_STAGES[stage + 1];
  const achievements = buildAchievements(stats);

  return <MainLayout page="evolution" onNavigate={onNavigate} world={<section className="evolution-hero" aria-labelledby="evolution-title">
    <FarmEvolution stage={stage}/>
    <div className="evolution-hero-top">
      <div className="evolution-sign pixel-frame">
        <p className="eyebrow">Nível {level} · {FARM_STAGES[stage].name}</p>
        <h1 id="evolution-title">Evolução</h1>
        <p className="missions-motto">{FARM_STAGES[stage].hint}</p>
        <ProgressBar value={xpInLevel / XP_PER_LEVEL * 100} label="Experiência do nível" className="mt-1 h-2.5"/>
        <p className="evolution-xp">{xpInLevel} / {XP_PER_LEVEL} XP</p>
      </div>
      <dl className="goals-stats">
        <div className="hero-stat pixel-frame"><dt>Nível</dt><dd>{level}</dd></div>
        <div className="hero-stat pixel-frame"><dt><PixelIcon name="coin" className="size-3 text-[#a86d1c]"/>Moedas</dt><dd>{stats.coins}</dd></div>
        <div className="hero-stat pixel-frame"><dt>Conquistas</dt><dd>{achievements.filter(item => item.current >= item.goal).length}<small>/{achievements.length}</small></dd></div>
      </dl>
    </div>
    {nextStage && <div className="next-upgrade pixel-frame"><span className="upgrade-hammer" aria-hidden="true"><PixelIcon name="home" className="size-4"/></span>
      <span><strong>Próxima reforma:</strong> {nextStage.name}<small> · faltam {nextStage.level - level} {nextStage.level - level === 1 ? 'nível' : 'níveis'}</small></span></div>}
  </section>}>
    {offline && <p role="alert" className="world-status">Servidor indisponível: nível, moedas e missões aparecem quando o backend voltar.</p>}
    <div className="evolution-layout">
      <div className="evolution-main"><SkillsPanel skills={buildSkills(stats)}/><WeeklyHarvestChart weeks={weeks}/></div>
      <div className="evolution-side"><StreakPanel goals={goals} log={log} today={today}/><LevelRoad level={level} xpInLevel={xpInLevel} xpPerLevel={XP_PER_LEVEL}/><AchievementsPanel achievements={achievements}/></div>
    </div>
    <p role="status" className="world-status">Cada pequeno passo também é crescimento.</p>
  </MainLayout>;
}
