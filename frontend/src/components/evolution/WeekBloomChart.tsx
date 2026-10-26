import { useId, useState, type CSSProperties } from 'react';
import type { GoalArea, GoalLog, TrackedGoal } from '../../types/goals';
import type { Mission } from '../../types/world';
import { readClaims } from '../../lib/harvestRewards';
import { readTreasure } from '../../lib/treasure';
import { GOAL_AREAS } from '../../lib/goalAreas';
import { areasThisWeek, weekEarnings, type Earnings } from '../../lib/weekMetrics';
import { PixelIcon, type PixelIconName } from '../PixelIcon';
import { useSettings } from '../../hooks/useSettings';

/** Ícone e cor de cada área (paleta do site) */
const AREA_STYLE: Record<GoalArea, { icon: PixelIconName; color: string }> = {
  saude: { icon: 'water', color: '#e8576f' }, estudos: { icon: 'book', color: '#9b7fd4' },
  pessoal: { icon: 'home', color: '#ee6996' }, lazer: { icon: 'sun', color: '#e7b84b' }, nenhuma: { icon: 'leaf', color: '#b98a55' },
};

/** Diferença em relação à semana passada, para o pergaminho (some sem registro na semana passada) */
function sinceLastWeek(now: number, before: Earnings, field: 'coins' | 'xp') {
  if (!before.events) return null;
  const diff = now - before[field];
  return diff === 0 ? 'igual à semana passada' : `${diff > 0 ? '+' : ''}${diff} do que semana passada`;
}

/** Pergaminho secreto: enrolado e sem nada escrito; quem tiver curiosidade abre e vê moedas e experiência da semana */
function RewardsScroll({ now, before, farmName }: { now: Earnings; before: Earnings; farmName: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const coinNote = sinceLastWeek(now.coins, before, 'coins');
  const xpNote = sinceLastWeek(now.xp, before, 'xp');
  return <section className={`rewards-scroll ${open ? 'is-open' : ''}`}>
    <div className="scroll-paper">
      <span className="scroll-rod is-top" aria-hidden="true"/>
      {/* Desenrola animando a altura (grid 0fr → 1fr); fechado fica escondido também para leitores de tela */}
      <div id={panelId} className="scroll-body" role="region" aria-label="Recompensas da semana" aria-hidden={!open}>
        <div className="scroll-inner">
          <p className="scroll-entry"><span className="scroll-label">Moedas ganhas na semana</span><strong className="scroll-value">{now.coins}</strong>{coinNote && <span className="scroll-note">{coinNote}</span>}</p>
          <p className="scroll-entry"><span className="scroll-label">Experiência ganha na semana</span><strong className="scroll-value">{now.xp}</strong>{xpNote && <span className="scroll-note">{xpNote}</span>}</p>
          {/* Carimbo da fazenda no pé da carta */}
          <span className="scroll-stamp" aria-label={`Carimbo: ${farmName}`}><span>{farmName}</span></span>
        </div>
      </div>
      <span className="scroll-rod is-bottom" aria-hidden="true"/>
      {/* Fitinha amarrando e selo de cera: só enquanto está fechado */}
      <span className="scroll-ribbon" aria-hidden="true"/>
      <span className="scroll-seal" aria-hidden="true"/>
    </div>
    {/* Botão transparente por cima de todo o pergaminho */}
    <button type="button" className="scroll-toggle" aria-expanded={open} aria-controls={panelId}
      aria-label={open ? 'Enrolar o pergaminho' : 'Abrir o pergaminho'} onClick={()=>setOpen(current => !current)}/>
  </section>;
}

/**
 * "Áreas da sua vida": ranking das áreas pela quantidade de atividades concluídas na semana
 * (a barra é proporcional a essa quantidade), e ao lado o pergaminho opcional com moedas e XP comparados à semana passada.
 */
export function WeekBloomChart({ goals, log, today, missions }: { goals: TrackedGoal[]; log: GoalLog; today: Date; missions: Mission[] }) {
  const byArea = new Map(areasThisWeek(goals, log, today).map(area => [area.area, area]));
  // Ranking pela quantidade concluída (empate: maior %); áreas sem nenhuma meta ficam no fim
  const rows = GOAL_AREAS.map(({ value, label }) => ({ value, label, week: byArea.get(value) }))
    .sort((a, b) => Number(!!b.week) - Number(!!a.week) || (b.week?.done ?? 0) - (a.week?.done ?? 0) || (b.week?.rate ?? 0) - (a.week?.rate ?? 0));
  const ranked = rows.filter(row => row.week);
  const maxDone = Math.max(1, ...ranked.map(row => row.week!.done));
  const best = ranked[0]?.week?.done ? ranked[0].value : null;
  const lowest = ranked.length > 1 && ranked[ranked.length - 1].value !== best ? ranked[ranked.length - 1].value : null;
  const { now, before } = weekEarnings(today, readClaims(), readTreasure(), missions);
  const [settings] = useSettings();

  return <div className="week-bloom">
    <section className="world-panel pixel-frame bloom-chart" aria-labelledby="bloom-heading">
      <header className="panel-heading"><h2 id="bloom-heading"><PixelIcon name="growth" className="size-5"/>Áreas da sua vida</h2><span className="panel-tag">ranking da semana</span></header>
      <div className="bloom-body">
        {!ranked.some(row => row.week!.done) && <p className="bloom-empty">Ainda não há dados suficientes nesta semana.</p>}
        <ol className="bloom-rows">{rows.map(({ value, label, week }, index) => {
          const { icon, color } = AREA_STYLE[value];
          const percent = week?.expected ? Math.round(week.rate * 100) : null;
          const position = week ? ranked.findIndex(row => row.value === value) + 1 : null;
          return <li key={value} className={`bloom-row ${value === best ? 'is-best' : ''} ${!week ? 'is-idle' : ''}`} style={{ '--bar': color, '--delay': `${index * 70}ms` } as CSSProperties}>
            <span className={`bloom-rank ${position && position <= 3 ? `is-top${position}` : ''}`} aria-label={position ? `${position}º lugar` : 'sem metas'}>{position ? `${position}º` : '–'}</span>
            <span className="bloom-icon" aria-hidden="true"><PixelIcon name={icon} className="size-3"/></span>
            <span className="bloom-label">
              <strong>{label}</strong>
              {value === best && <em className="bloom-tag is-best">Melhor área da semana</em>}
              {value === lowest && <em className="bloom-tag is-low">Pode florescer mais</em>}
            </span>
            {/* Tamanho da barra = quantidade concluída (relativa à área que mais fez) */}
            <span className="bloom-bar" role="img" aria-label={!week ? `${label}: sem metas` : `${label}: ${week.done} de ${week.expected} concluídas${percent === null ? '' : `, ${percent}%`}`}>
              <span className="bloom-fill" style={{ width: `${(week?.done ?? 0) / maxDone * 100}%` }}/>
            </span>
            <span className="bloom-count">{week ? `${week.done}/${week.expected}` : '0/0'}</span>
            <span className="bloom-percent">{percent === null ? '—' : `${percent}%`}</span>
          </li>;
        })}</ol>
      </div>
    </section>

    <RewardsScroll now={now} before={before} farmName={settings.farmName}/>
  </div>;
}
