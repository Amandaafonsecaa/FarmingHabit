import type { KeyboardEvent } from 'react';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import type { AvatarConfig } from '../../lib/avatar';
import { progressFor, isDoneOn } from '../../lib/goalLogic';
import { goalColor } from '../../lib/goalColors';
import { FarmHouse } from '../FarmHouse';
import { Tree } from '../WorldScenery';
import { PixelAvatar } from '../PixelAvatar';

// Posições das verduras no caixote (de baixo para cima): enche conforme o progresso
const HEAP: [number, number][] = [[5, -6], [15, -6], [25, -6], [35, -6], [10, -12], [20, -12], [30, -12], [20, -18]];
const ITEM = 'M2 0h4v1h1v1h1v4h-1v1h-1v1H2V7H1V6H0V2h1V1h1Z';
export const VENDOR: AvatarConfig = { skin: 2, hairStyle: 'short', hairColor: 1, outfit: 'shirt', outfitColor: 2, hat: 'cap', detail: 'none' };
// Banca alargada para a direita (de x=326 a 746) para caber 5 caixotes no balcão.
// Até 5 metas: uma fileira no balcão (layout original, com os potinhos na parede). Mais que isso: o balcão fica
// sempre com 5 e o que passar vai para a prateleira de dentro (com mais de 5 lá, os caixotes de cima ficam mais estreitos).
// Com duas fileiras, caixote + verduras + etiqueta de cada uma cabem entre o toldo (y≈106) e o balcão (232).
const STAND_LEFT = 342, STAND_WIDTH = 388, STAND_CENTER = STAND_LEFT + STAND_WIDTH / 2, SHELF_Y = 152, COUNTER_Y = 232;

const fillCount = (progress: number) => progress >= 100 ? 8 : progress >= 50 ? 5 : progress > 0 ? 2 : 0;
/** Fonte do nome na etiqueta: cabe inteiro em até duas linhas, sem reticências (nomes longos ficam menores) */
const tagFont = (title: string, width: number) => Math.max(4.5, Math.min(7.5, 0.85 * 2 * width / (title.length * 0.62)));

interface GoalStandProps { goals: TrackedGoal[]; log: GoalLog; today: Date; onHarvest: (goal: TrackedGoal, origin: Element) => void; onTalk: () => void }

/**
 * Vendinha de beira de estrada (inspirada na do Hay Day) com a nossa fazenda ao fundo:
 * cada meta de hoje é um caixote no balcão que enche de verduras com o progresso. Clicar colhe.
 */
export function GoalStand({ goals, log, today, onHarvest, onTalk }: GoalStandProps) {
  const done = goals.filter(goal => isDoneOn(goal, log, today)).length;
  const twoRows = goals.length > 5;
  // Prioridade do balcão: as 5 primeiras ficam embaixo; as demais sobem para a prateleira
  const rows = twoRows ? [goals.slice(5), goals.slice(0, 5)] : [[], goals];
  // Largura de cada caixote: 1/5 da banca (mais estreito se a fileira tiver mais de 5); cada fileira fica centralizada
  const slotOf = (row: TrackedGoal[]) => STAND_WIDTH / Math.max(5, row.length);
  const scaleOf = (row: TrackedGoal[]) => Math.min(twoRows ? 1 : 1.3, (slotOf(row) - 12) / 48);
  const labelGap = twoRows ? 4 : 8, labelH = twoRows ? 30 : 34;
  const onKey = (event: KeyboardEvent, goal: TrackedGoal) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onHarvest(goal, event.currentTarget); } };

  return <>
  <svg className="goal-stand" viewBox="0 0 1000 330" preserveAspectRatio="xMidYMax meet" role="group" aria-label={`Vendinha de metas: ${done} de ${goals.length} metas de hoje colhidas`}>
    {/* Fundo: morros e a fazenda principal em segundo plano */}
    <g className="stand-background" shapeRendering="crispEdges">
      <path d="M-2000 214q300-50 620-18t620-6 620 4 620-10 1120 20V400H-2000Z" fill="#7dbf8e"/>
      <path d="M-2000 240q400-28 800-8t800-4 800 4 1600 0V400H-2000Z" fill="#8fd36a"/>
      {[[40, 175, .42], [120, 188, .38], [230, 178, .4], [690, 168, .44], [960, 172, .42], [1000, 186, .38]].map(([x, y, scale], index) => <Tree key={index} x={x} y={y} scale={scale} delay={-index * 0.8}/>)}
      <g transform="translate(772 82) scale(.42)"><FarmHouse/></g>
      <g fill="#efe0b6" stroke="#b8a27c" strokeWidth="1.5">{Array.from({ length: 14 }, (_, index) => <path key={index} d={`M${700 + index * 22} 238v18h4v-18Z`}/>)}<path d="M700 244h300v3H700Z"/></g>
    </g>

    {/* Estrada e grama da frente */}
    <path d="M-2000 284H3000V300H-2000Z" fill="#79bd38"/><path d="M-2000 300H3000V400H-2000Z" fill="#d9b47a"/><path d="M-2000 300H3000V303H-2000Z" fill="#b98a52"/>
    <g fill="#c49a62">{Array.from({ length: 12 }, (_, index) => <path key={index} d={`M${index * 90 + 20} 314h18v3h-18Z`}/>)}</g>

    <g shapeRendering="crispEdges">
      {/* Fundo da barraca com prateleira e potes */}
      <rect x="338" y="104" width="396" height="128" fill="#c48a4a"/>
      {Array.from({ length: 20 }, (_, index) => <path key={index} d={`M${348 + index * 20} 104v128`} stroke="#b07a4c" strokeWidth="2"/>)}
      <rect x="344" y="150" width="384" height="6" fill="#8a5838"/>
      {rows[0].length === 0 && [[360, '#ee6996'], [384, '#f2c453'], [408, '#72ad32'], [692, '#5fa8d3'], [712, '#e8954a']].map(([x, color]) => <g key={x}><rect x={x as number} y="132" width="14" height="18" fill="#d8f0f6" opacity=".7"/><rect x={(x as number) + 2} y="138" width="10" height="10" fill={color as string}/><rect x={(x as number) - 1} y="129" width="16" height="4" fill="#8a5838"/></g>)}

      {/* Postes e toldo listrado com babado */}
      <rect x="326" y="92" width="12" height="202" fill="#8a5838" stroke="#57311f" strokeWidth="2"/><rect x="734" y="92" width="12" height="202" fill="#8a5838" stroke="#57311f" strokeWidth="2"/>
      <g className="stand-awning">
        {Array.from({ length: 14 }, (_, index) => { const x = 316 + index * 32; const color = index % 2 ? '#fff1c7' : '#e8576f'; return <g key={index}>
          <rect x={x} y="68" width="32" height="30" fill={color}/><path d={`M${x} 98h32v4h-4v4h-24v-4h-4Z`} fill={color}/>
        </g>; })}
        <path d="M316 66h448v4H316Z" fill="#57311f"/><path d="M316 98h448" stroke="#57311f" strokeWidth="1" opacity=".3"/>
      </g>
      <path d="M500 66V54M580 66V54" stroke="#57311f" strokeWidth="2"/>
      <rect x="470" y="30" width="140" height="28" fill="#57311f"/><rect x="473" y="33" width="134" height="22" fill="#d9a05a"/><rect x="473" y="33" width="134" height="3" fill="#f2c27a"/>
      <text x="540" y="49" textAnchor="middle" className="stand-sign-text">METAS DE HOJE</text>

      {/* Balcão */}
      <rect x="324" y="232" width="424" height="10" fill="#d9a05a" stroke="#57311f" strokeWidth="2"/>
      <rect x="330" y="242" width="412" height="52" fill="#a86b35" stroke="#57311f" strokeWidth="2"/>
      {Array.from({ length: 10 }, (_, index) => <path key={index} d={`M${370 + index * 40} 242v52`} stroke="#8a5838" strokeWidth="2"/>)}

      {/* Lousinha com o placar do dia */}
      <g transform="translate(764 236)"><path d="M4 40l6-40M38 40l-6-40" stroke="#57311f" strokeWidth="3"/><rect x="0" y="0" width="42" height="30" fill="#3f4a3c" stroke="#8a5838" strokeWidth="3"/><text x="21" y="20" textAnchor="middle" className="stand-chalk">{done}/{goals.length}</text></g>
    </g>

    {/* Caixotes (um por meta), em grade: fileira de cima na prateleira, de baixo no balcão */}
    <g className="stand-crates">
    {rows.map((row, rowIndex) => row.map((goal, index) => {
      const progress = progressFor(goal, log, today);
      const isDone = isDoneOn(goal, log, today);
      const [color, light] = goalColor(goal);
      const baseY = rowIndex === 0 ? SHELF_Y : COUNTER_Y;
      const slot = slotOf(row), scale = scaleOf(row);
      const cx = STAND_CENTER - (row.length * slot) / 2 + slot * (index + .5);
      const labelW = slot - 8;
      return <g key={goal.id} className={`stand-crate ${isDone ? 'is-done' : ''}`} role="button" tabIndex={0} shapeRendering="crispEdges"
        aria-label={`${goal.title}: ${isDone ? 'colhida hoje' : `${progress}%. Colher`}`} onClick={event=>onHarvest(goal, event.currentTarget)} onKeyDown={event=>onKey(event, goal)}>
        <rect x={cx - slot / 2 + 2} y={baseY - 28 * scale - 18} width={slot - 4} height={28 * scale + 18 + labelGap + labelH} fill="transparent"/>
        <g transform={`translate(${cx - 24 * scale} ${baseY - 28 * scale}) scale(${scale})`}>
          <g className="crate-produce">{HEAP.slice(0, fillCount(progress)).map(([px, py], item) => <g key={item} transform={`translate(${px} ${py})`}>
            <path d={ITEM} fill={color} stroke="#3b2418" strokeWidth=".8"/><path d="M2 2h2v2H2Z" fill={light}/>
            {goal.icon === 'target' && <path d="M3-2h2v2H3Z" fill="#53922d"/>}
          </g>)}</g>
          {isDone && <path className="crate-sparkle" d="M44-20h2v2h-2Zm-42 4h2v2H2Z" fill="#fff"/>}
          <rect x="0" y="0" width="48" height="28" fill="#b07a4c" stroke="#57311f" strokeWidth="2"/>
          <path d="M2 9h44M2 18h44" stroke="#8a5838" strokeWidth="2"/><rect x="0" y="0" width="5" height="28" fill="#8a5838"/><rect x="43" y="0" width="5" height="28" fill="#8a5838"/>
        </g>
        {/* Etiqueta pendurada: nome inteiro (até duas linhas) e o progresso */}
        <path d={`M${cx} ${baseY}v${labelGap}`} stroke="#57311f" strokeWidth="1.5"/>
        <foreignObject x={cx - labelW / 2} y={baseY + labelGap} width={labelW} height={labelH}>
          <div className={`crate-label ${isDone ? 'is-done' : ''}`}>
            <span className="crate-label-name" style={{ fontSize: `${tagFont(goal.title, labelW - 4)}px` }}>{goal.title}</span>
            <span className="crate-label-progress">{isDone ? '✓ colhida' : `${progress}%`}</span>
          </div>
        </foreignObject>
      </g>;
    }))}
    </g>
    {goals.length === 0 && [0, 1, 2].map(index => <g key={index} transform={`translate(${STAND_CENTER - 117 + 78 * index + 8} ${COUNTER_Y - 36}) scale(1.3)`} shapeRendering="crispEdges" opacity=".8">
      <rect width="48" height="28" fill="#b07a4c" stroke="#57311f" strokeWidth="2"/><path d="M2 9h44M2 18h44" stroke="#8a5838" strokeWidth="2"/></g>)}
  </svg>
  {/* Camada da frente (mesmo enquadramento): o Seu Zé fica na frente das estacas da placa */}
  <svg className="goal-stand goal-stand-front" viewBox="0 0 1000 330" preserveAspectRatio="xMidYMax meet">
    {/* Seu Zé, o vendedor, em pé ao lado da banca: clicar abre a conversa (como o Bigode na Loja) */}
    <g className="stand-vendor npc-clickable" onClick={onTalk} shapeRendering="crispEdges">
      <ellipse cx="283" cy="292" rx="24" ry="5" fill="#3b2418" opacity=".18"/>
      <g className="vendor-body"><foreignObject x="248" y="220" width="72" height="80"><PixelAvatar avatar={VENDOR} className="h-full w-full"/></foreignObject></g>
      <g className="talk-prompt"><rect x="248" y="198" width="70" height="18" fill="#57311f"/><rect x="250" y="200" width="66" height="14" fill="#fff1c7"/><rect x="279" y="216" width="8" height="4" fill="#57311f"/>
        <rect x="254" y="203" width="8" height="6" fill="#bf5837"/><rect x="256" y="209" width="2" height="2" fill="#bf5837"/><text x="289" y="211" textAnchor="middle" className="talk-prompt-text">Conversar</text></g>
    </g>
  </svg>
  {/* Celular: a banca vira ilustração e as metas aparecem numa grade de cestas fáceis de tocar */}
  {goals.length > 0 && <ul className="stand-grid" aria-label="Metas de hoje">{goals.map(goal => {
    const progress = progressFor(goal, log, today);
    const isDone = isDoneOn(goal, log, today);
    const [color] = goalColor(goal);
    return <li key={goal.id}><button type="button" className={`stand-basket ${isDone ? 'is-done' : ''}`} onClick={event=>onHarvest(goal, event.currentTarget)}
      aria-label={`${goal.title}: ${isDone ? 'colhida hoje' : `${progress}%. Colher`}`}>
      <svg viewBox="0 0 48 34" shapeRendering="crispEdges" aria-hidden="true"><g transform="translate(0 6)">
        {HEAP.slice(0, fillCount(progress)).map(([px, py], item) => <path key={item} d={ITEM} transform={`translate(${px} ${py})`} fill={color} stroke="#3b2418" strokeWidth=".8"/>)}
        <rect x="0" y="0" width="48" height="28" fill="#b07a4c" stroke="#57311f" strokeWidth="2"/><path d="M2 9h44M2 18h44" stroke="#8a5838" strokeWidth="2"/>
      </g></svg>
      <span className="stand-basket-name">{goal.title}</span>
      <span className="stand-basket-progress">{isDone ? '✓ colhida' : `${progress}%`}</span>
    </button></li>;
  })}<li className="stand-grid-count" aria-hidden="true">{done}/{goals.length}</li></ul>}
  </>;
}
