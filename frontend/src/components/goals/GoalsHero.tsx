import { useDayPhase } from '../../hooks/useDayPhase';
import { skyBackground } from '../../lib/timeOfDay';
import { SkyLayer } from '../home/SkyLayer';
import { PetalRain } from '../home/SeasonParticles';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { goalsDueToday, isDoneOn, streakFor } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { useEffect, useState } from 'react';
import { GoalStand } from './GoalStand';
import { VendorDialog } from './VendorDialog';
import { loadPlayer } from '../../services/api';
import { CoinHud } from '../home/CoinHud';

/** Topo da aba: placa de madeira plantada no chão e a vendinha com as metas de hoje em caixotes */
export function GoalsHero({ goals, log, today, coins, celebrating, onPlant, onHarvest }: { goals: TrackedGoal[]; log: GoalLog; today: Date; coins: number | null; celebrating: boolean; onPlant: () => void; onHarvest: (goal: TrackedGoal, origin: Element) => void }) {
  const phase = useDayPhase();
  const [talking, setTalking] = useState(false);
  const [playerName, setPlayerName] = useState('fazendeira');
  // Nome do jogador para o Seu Zé cumprimentar (carregado antes de abrir a conversa)
  useEffect(() => { let active = true; loadPlayer().then(player => { if (active) setPlayerName(player.name); }).catch(() => {}); return () => { active = false; }; }, []);
  const openTalk = () => setTalking(true);
  // Na vendinha ficam as metas que cobram hoje (semanais já batidas na semana saem do balcão)
  const dueGoals = goalsDueToday(goals, log, today);

  return <section className={`goals-hero phase-${phase}`} style={{ background: skyBackground(phase) }} aria-labelledby="goals-title">
    {/* Dia perfeito: o mesmo arco-íris e a mesma chuva de pétalas da Casa */}
    <SkyLayer phase={phase} rainbow={celebrating}/>
    {celebrating && <PetalRain/>}
    <div className="goals-hero-top">
      {/* Placa plantada no chão: as estacas descem até a grama da cena */}
      <div className="planted-sign">
      <div className="goals-sign pixel-frame">
        <h1 id="goals-title">Canteiro de Metas</h1>
        <button type="button" className="pixel-button primary-button plant-button" onClick={onPlant}><PixelIcon name="plus" className="size-2.5"/>Plantar meta</button>
      </div>
      <span className="planted-sign-posts" aria-hidden="true"><span className="post-mound"/><span className="post-mound is-right"/></span>
      </div>
    </div>
    <CoinHud coins={coins} className="hero-coin-hud"/>
    <GoalStand goals={dueGoals} log={log} today={today} onHarvest={onHarvest} onTalk={openTalk}/>
    {/* Para teclado e leitores de tela: aparece só quando recebe foco */}
    <button type="button" className="talk-sr-button sr-only focus:not-sr-only" onClick={openTalk}>Conversar com o Seu Zé</button>
    {talking && <VendorDialog onClose={()=>setTalking(false)} context={{
      name: playerName, hour: new Date().getHours(),
      done: dueGoals.filter(goal => isDoneOn(goal, log, today)).map(goal => goal.title),
      pending: dueGoals.filter(goal => !isDoneOn(goal, log, today)).map(goal => goal.title),
      bestStreak: goals.reduce<{ title: string; days: number } | null>((best, goal) => { const days = goal.frequency.kind === 'weekly' ? 0 : streakFor(goal, log, today); return days > (best?.days ?? 0) ? { title: goal.title, days } : best; }, null),
    }}/>}
  </section>;
}
