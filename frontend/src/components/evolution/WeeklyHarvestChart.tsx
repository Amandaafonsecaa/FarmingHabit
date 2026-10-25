import { useState } from 'react';
import { useInView } from '../../hooks/useScrollGrowth';
import { PixelIcon } from '../PixelIcon';

export interface WeekHarvest { label: string; range: string; value: number; current: boolean }

const W = 600, H = 220, LEFT = 34, RIGHT = 8, TOP = 22, BOTTOM = 28;
const PLOT_W = W - LEFT - RIGHT, PLOT_H = H - TOP - BOTTOM;
const BAR = '#53922d'; // validado contra o pergaminho (#fff8e1): contraste ≥ 3:1

/**
 * Colheitas por semana (série única: sem legenda, o título nomeia a série).
 * Barras finas crescendo do chão como hastes, grade discreta, rótulo só na semana atual e na melhor,
 * dica ao passar o mouse/focar e uma tabela com os mesmos dados.
 */
export function WeeklyHarvestChart({ weeks }: { weeks: WeekHarvest[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(4, Math.ceil(Math.max(...weeks.map(week => week.value)) / 4) * 4);
  const best = weeks.reduce((top, week, index) => week.value > weeks[top].value ? index : top, 0);
  const band = PLOT_W / weeks.length;
  const barWidth = Math.min(40, band - 18);
  const y = (value: number) => TOP + PLOT_H - (value / max) * PLOT_H;
  const centerX = (index: number) => LEFT + band * index + band / 2;

  return <section className="world-panel pixel-frame harvest-chart-panel" aria-labelledby="chart-heading">
    <header className="panel-heading"><h2 id="chart-heading"><PixelIcon name="leaf" className="size-5"/>Colheitas por semana</h2><span className="panel-tag">últimas {weeks.length} semanas</span></header>
    <div ref={ref} className={`harvest-chart ${inView ? 'is-visible' : ''}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Colheitas por semana nas últimas ${weeks.length} semanas. Melhor semana: ${weeks[best].range}, com ${weeks[best].value}.`}>
        {/* Grade discreta: 0, metade e topo */}
        {[0, max / 2, max].map(value => <g key={value}>
          <path d={`M${LEFT} ${y(value)}H${W - RIGHT}`} stroke={value === 0 ? '#8a5838' : '#c9a46a66'} strokeWidth={value === 0 ? 2 : 1}/>
          <text x={LEFT - 6} y={y(value) + 3} textAnchor="end" className="chart-axis">{value}</text>
        </g>)}
        {weeks.map((week, index) => {
          const x = centerX(index) - barWidth / 2;
          const top = y(week.value);
          const labeled = week.value > 0 && (week.current || index === best);
          return <g key={week.label} className={`chart-column ${active === index ? 'is-active' : ''}`}>
            {week.value > 0 && <g className="chart-bar" style={{ transitionDelay: `${index * 70}ms` }}>
              <rect x={x} y={top} width={barWidth} height={TOP + PLOT_H - top} fill={BAR}/>
              <rect x={x} y={top} width={barWidth} height="3" fill="#72ad32"/>
              {/* Brotinho no topo da haste */}
              <path d={`M${centerX(index) - 1} ${top - 7}h2v7h-2Zm-6 1h6v3h-6Zm8-3h6v3h-6Z`} fill="#3f6b35"/>
            </g>}
            {labeled && <text x={centerX(index)} y={top - 11} textAnchor="middle" className="chart-value">{week.value}</text>}
            <text x={centerX(index)} y={H - 8} textAnchor="middle" className={`chart-axis ${week.current ? 'is-current' : ''}`}>{week.current ? 'esta' : week.label}</text>
            {/* Alvo de toque maior que a barra */}
            <rect x={LEFT + band * index} y={TOP} width={band} height={PLOT_H} fill="transparent" tabIndex={0} className="chart-hit"
              aria-label={`Semana de ${week.range}: ${week.value} colheitas`} onMouseEnter={()=>setActive(index)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(index)} onBlur={()=>setActive(null)}/>
          </g>;
        })}
      </svg>
      {active !== null && <div className="chart-tooltip pixel-frame" style={{ left: `${centerX(active) / W * 100}%`, top: `${(y(weeks[active].value) - 10) / H * 100}%` }} role="status">
        <strong>{weeks[active].value} colheita{weeks[active].value === 1 ? '' : 's'}</strong><span>{weeks[active].range}</span>
      </div>}
    </div>
    <details className="chart-table">
      <summary>Ver como tabela</summary>
      <table><thead><tr><th scope="col">Semana</th><th scope="col">Colheitas</th></tr></thead>
        <tbody>{weeks.map(week => <tr key={week.label}><td>{week.range}</td><td>{week.value}</td></tr>)}</tbody></table>
    </details>
  </section>;
}
