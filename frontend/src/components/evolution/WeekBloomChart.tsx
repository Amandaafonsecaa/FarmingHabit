import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { prefersCalm } from '../../hooks/useRollingNumber';
import type { GoalArea, GoalLog, TrackedGoal } from '../../types/goals';
import type { Mission } from '../../types/world';
import type { RewardClaim } from '../../services/api';
import { GOAL_AREAS } from '../../lib/goalAreas';
import { areasThisWeek, weekEarnings, type AreaWeek, type Earnings } from '../../lib/weekMetrics';
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

/** Quanto é preciso rolar a página para o pergaminho desenrolar (ou enrolar) por inteiro */
const ROLL_DISTANCE = 180;
/** Espaço interno do papel aberto (o mesmo do CSS), que cresce e encolhe junto com o papel */
const PAPER_PADDING = 14;

/**
 * Pergaminho com moedas e experiência da semana. Começa enrolado a cada visita à Evolução e acompanha a rolagem
 * da página: para baixo vai desenrolando, para cima vai enrolando (e volta a abrir se a pessoa descer de novo).
 * Só fechar pelo clique desliga a rolagem; aí apenas um novo clique abre (e religa a rolagem).
 */
function RewardsScroll({ now, before, farmName }: { now: Earnings; before: Earnings; farmName: string }) {
  // Cada visita à página monta o pergaminho de novo: começa enrolado, com a rolagem pronta para abrir
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // Fora do estado para não redesenhar a cada pixel: rolagem ativa, quanto está desenrolado (0 a 1) e a altura aberta
  const scrollActive = useRef(true);
  const unroll = useRef(0);
  const fullHeight = useRef(0);
  const closedByScroll = useRef(false);

  /**
   * Some com o tamanho intermediário e devolve o papel às posições do CSS (aberto ou enrolado).
   * `instant`: sem transição, para o papel não pular quando a rolagem já o deixou no tamanho final.
   */
  const clearRolling = (instant = false) => {
    const body = bodyRef.current;
    if (body && instant) body.classList.add('is-settling');
    body?.classList.remove('is-rolling');
    body?.style.removeProperty('height');
    innerRef.current?.style.removeProperty('padding-block');
    innerRef.current?.style.removeProperty('opacity');
    fullHeight.current = 0;
    if (body && instant) {
      void body.offsetHeight; // aplica o tamanho final sem transição antes de devolver as animações
      requestAnimationFrame(() => body.classList.remove('is-settling'));
    }
  };

  // Clique: abre ou fecha de uma vez. Fechar pelo clique desliga a rolagem; abrir pelo clique religa
  function toggle() {
    closedByScroll.current = false;
    clearRolling();
    scrollActive.current = !open;
    unroll.current = open ? 0 : 1;
    setOpen(!open);
  }

  // Enrolado pela rolagem, o papel já está com altura zero: só depois que o React aplicou "fechado"
  // o tamanho intermediário sai, e sem transição (senão o CSS animaria a partir do papel aberto)
  useEffect(() => {
    if (open || !closedByScroll.current) return;
    closedByScroll.current = false;
    clearRolling(true);
  }, [open]);

  useEffect(() => {
    // Sem a âncora de rolagem do navegador: senão, cada mudança de altura do papel mexe a página e conta como rolagem
    const root = document.documentElement;
    const previousAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = 'none';
    let last = window.scrollY, frame = 0;

    const onScroll = () => {
      const delta = window.scrollY - last;
      last = window.scrollY;
      // Fechado pelo clique, a rolagem não mexe no pergaminho até um novo clique
      if (!delta || !scrollActive.current) return;
      // Movimento reduzido: abre ou fecha de uma vez, conforme a direção
      if (prefersCalm()) {
        const next = delta > 0 ? 1 : 0;
        if (next !== unroll.current) { unroll.current = next; clearRolling(); setOpen(next === 1); }
        return;
      }
      const next = Math.min(1, Math.max(0, unroll.current + delta / ROLL_DISTANCE));
      if (next === unroll.current) return;
      unroll.current = next;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const body = bodyRef.current, inner = innerRef.current;
        if (!body || !inner || !scrollActive.current) return;
        const value = unroll.current;
        // Aberto por inteiro: o CSS assume
        if (value === 1) { clearRolling(true); setOpen(true); return; }
        // Altura aberta = conteúdo + espaço interno do papel aberto (medida antes de mexer, aberto ou enrolado)
        if (!fullHeight.current) {
          const style = getComputedStyle(inner);
          fullHeight.current = inner.scrollHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) + PAPER_PADDING * 2;
        }
        body.classList.add('is-rolling');
        body.style.height = `${(fullHeight.current * value).toFixed(1)}px`;
        inner.style.paddingBlock = `${(PAPER_PADDING * value).toFixed(1)}px`;
        inner.style.opacity = value.toFixed(2);
        // Enrolou por inteiro: a fitinha e o selo voltam, mas a rolagem continua ativa para abrir de novo
        if (value === 0) { closedByScroll.current = true; setOpen(false); } else setOpen(true);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); root.style.overflowAnchor = previousAnchor; };
  }, []);
  const coinNote = sinceLastWeek(now.coins, before, 'coins');
  const xpNote = sinceLastWeek(now.xp, before, 'xp');
  return <section className={`rewards-scroll ${open ? 'is-open' : ''}`}>
    <div className="scroll-paper">
      <span className="scroll-rod is-top" aria-hidden="true"/>
      {/* Desenrola animando a altura (grid 0fr → 1fr); fechado fica escondido também para leitores de tela */}
      <div ref={bodyRef} id={panelId} className="scroll-body" role="region" aria-label="Recompensas da semana" aria-hidden={!open}>
        <div ref={innerRef} className="scroll-inner">
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
      aria-label={open ? 'Enrolar o pergaminho' : 'Abrir o pergaminho'} onClick={toggle}/>
  </section>;
}

/**
 * "Áreas da sua vida": ranking das áreas pelo % de conclusão da semana (a barra é esse %; empates dividem a posição), e ao lado o pergaminho opcional com moedas e XP comparados à semana passada.
 */
export function WeekBloomChart({ goals, log, today, missions, claims }: { goals: TrackedGoal[]; log: GoalLog; today: Date; missions: Mission[]; claims: RewardClaim[] }) {
  const byArea = new Map(areasThisWeek(goals, log, today).map(area => [area.area, area]));
  // % de conclusão (inteiro, como é mostrado); sem nada a cumprir não há % (nunca divide por zero)
  const percentOf = (week?: AreaWeek) => week && week.expected > 0 ? Math.round(week.done / week.expected * 100) : null;
  // Ranking pelo %; no mesmo %, desempata só a ordem pela quantidade concluída. Sem atividades ficam no fim
  const rows = GOAL_AREAS.map(({ value, label }) => ({ value, label, week: byArea.get(value), percent: percentOf(byArea.get(value)) }))
    .sort((a, b) => Number(b.percent !== null) - Number(a.percent !== null) || (b.percent ?? 0) - (a.percent ?? 0) || (b.week?.done ?? 0) - (a.week?.done ?? 0));
  const ranked = rows.filter(row => row.percent !== null);
  // Mesmo % = mesma posição (1º, 1º, 3º...)
  const positionOf = (percent: number) => ranked.findIndex(row => row.percent === percent) + 1;
  const tiedAt = (percent: number) => ranked.filter(row => row.percent === percent).length > 1;
  const top = ranked[0], bottom = ranked[ranked.length - 1];
  // Destaques só quando a posição não está empatada
  const best = top && top.percent! > 0 && !tiedAt(top.percent!) ? top.value : null;
  const lowest = bottom && ranked.length > 1 && bottom.percent! < top.percent! && !tiedAt(bottom.percent!) ? bottom.value : null;
  const { now, before } = weekEarnings(today, claims, missions);
  const [settings] = useSettings();

  return <div className="week-bloom">
    <section className="world-panel pixel-frame bloom-chart" aria-labelledby="bloom-heading">
      <header className="panel-heading"><h2 id="bloom-heading"><PixelIcon name="growth" className="size-5"/>Áreas da sua vida</h2><span className="panel-tag">ranking da semana</span></header>
      <div className="bloom-body">
        {!ranked.some(row => row.week!.done) && <p className="bloom-empty">Ainda não há dados suficientes nesta semana.</p>}
        <ol className="bloom-rows">{rows.map(({ value, label, week, percent }, index) => {
          const { icon, color } = AREA_STYLE[value];
          const position = percent === null ? null : positionOf(percent);
          const tied = percent !== null && tiedAt(percent);
          return <li key={value} className={`bloom-row ${value === best ? 'is-best' : ''} ${percent === null ? 'is-idle' : ''}`} style={{ '--bar': color, '--delay': `${index * 70}ms` } as CSSProperties}>
            <span className={`bloom-rank ${position && position <= 3 ? `is-top${position}` : ''}`} aria-label={position ? `${position}º lugar${tied ? ', empatado' : ''}` : 'sem atividades'}>{position ? `${position}º` : '–'}</span>
            <span className="bloom-icon" aria-hidden="true"><PixelIcon name={icon} className="size-3"/></span>
            <span className="bloom-label">
              <strong>{label}</strong>
              {value === best && <em className="bloom-tag is-best">Melhor área da semana</em>}
              {value === lowest && <em className="bloom-tag is-low">Pode florescer mais</em>}
              {tied && <em className="bloom-tag is-tie">Empate em aproveitamento</em>}
              {percent === null && <em className="bloom-tag is-idle">Ainda sem atividades</em>}
            </span>
            {/* Tamanho da barra = % de conclusão (2/2 e 1/1 ficam iguais: os dois são 100%) */}
            <span className="bloom-bar" role="img" aria-label={percent === null ? `${label}: ainda sem atividades` : `${label}: ${week!.done} de ${week!.expected} concluídas, ${percent}%`}>
              <span className="bloom-fill" style={{ width: `${percent ?? 0}%` }}/>
            </span>
            <span className="bloom-count">{percent === null ? '' : `${week!.done}/${week!.expected}`}</span>
            <span className="bloom-percent">{percent === null ? '—' : `${percent}%`}</span>
          </li>;
        })}</ol>
      </div>
    </section>

    <RewardsScroll now={now} before={before} farmName={settings.farmName}/>
  </div>;
}
