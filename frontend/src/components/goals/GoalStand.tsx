import { useState, type KeyboardEvent } from 'react';
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
// Caixotes 30% maiores e centralizados no balcão (que vai de x=330 a x=690)
const MAX_CRATES = 5, CRATE_SCALE = 1.3, CRATE_STEP = 70, COUNTER_CENTER = 510;

const fillCount = (progress: number) => progress >= 100 ? 8 : progress >= 50 ? 5 : progress > 0 ? 2 : 0;
const short = (text: string, size: number) => text.length > size ? `${text.slice(0, size - 1)}…` : text;

interface GoalStandProps { goals: TrackedGoal[]; log: GoalLog; today: Date; onHarvest: (goal: TrackedGoal, origin: Element) => void; onTalk: () => void }

/**
 * Vendinha de beira de estrada (inspirada na do Hay Day) com a nossa fazenda ao fundo:
 * cada meta de hoje é um caixote no balcão que enche de verduras com o progresso. Clicar colhe.
 */
export function GoalStand({ goals, log, today, onHarvest, onTalk }: GoalStandProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const crates = goals.slice(0, MAX_CRATES);
  const extra = goals.length - crates.length;
  const done = goals.filter(goal => isDoneOn(goal, log, today)).length;
  const slots = goals.length === 0 ? 3 : crates.length + (extra > 0 ? 1 : 0);
  const crateX = (index: number) => COUNTER_CENTER - (slots * CRATE_STEP) / 2 + index * CRATE_STEP + 4;
  const onKey = (event: KeyboardEvent, goal: TrackedGoal) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onHarvest(goal, event.currentTarget); } };

  return <>
  <svg className="goal-stand" viewBox="0 0 1000 330" preserveAspectRatio="xMidYMax meet" role="group" aria-label={`Vendinha de metas: ${done} de ${goals.length} metas de hoje colhidas`}>
    {/* Fundo: morros e a fazenda principal em segundo plano */}
    <g className="stand-background" shapeRendering="crispEdges">
      <path d="M-2000 214q300-50 620-18t620-6 620 4 620-10 1120 20V400H-2000Z" fill="#7dbf8e"/>
      <path d="M-2000 240q400-28 800-8t800-4 800 4 1600 0V400H-2000Z" fill="#8fd36a"/>
      {[[40, 175, .42], [120, 188, .38], [230, 178, .4], [720, 168, .44], [930, 172, .42], [990, 186, .38]].map(([x, y, scale], index) => <Tree key={index} x={x} y={y} scale={scale} delay={-index * 0.8}/>)}
      <g transform="translate(640 82) scale(.42)"><FarmHouse/></g>
      <g fill="#efe0b6" stroke="#b8a27c" strokeWidth="1.5">{Array.from({ length: 14 }, (_, index) => <path key={index} d={`M${700 + index * 22} 238v18h4v-18Z`}/>)}<path d="M700 244h300v3H700Z"/></g>
    </g>

    {/* Estrada e grama da frente */}
    <path d="M-2000 284H3000V300H-2000Z" fill="#79bd38"/><path d="M-2000 300H3000V400H-2000Z" fill="#d9b47a"/><path d="M-2000 300H3000V303H-2000Z" fill="#b98a52"/>
    <g fill="#c49a62">{Array.from({ length: 12 }, (_, index) => <path key={index} d={`M${index * 90 + 20} 314h18v3h-18Z`}/>)}</g>

    <g shapeRendering="crispEdges">
      {/* Fundo da barraca com prateleira e potes */}
      <rect x="338" y="104" width="344" height="128" fill="#c48a4a"/>
      {Array.from({ length: 17 }, (_, index) => <path key={index} d={`M${348 + index * 20} 104v128`} stroke="#b07a4c" strokeWidth="2"/>)}
      <rect x="344" y="150" width="332" height="6" fill="#8a5838"/>
      {[[360, '#ee6996'], [384, '#f2c453'], [408, '#72ad32'], [640, '#5fa8d3'], [660, '#e8954a']].map(([x, color]) => <g key={x}><rect x={x as number} y="132" width="14" height="18" fill="#d8f0f6" opacity=".7"/><rect x={(x as number) + 2} y="138" width="10" height="10" fill={color as string}/><rect x={(x as number) - 1} y="129" width="16" height="4" fill="#8a5838"/></g>)}

      {/* Postes e toldo listrado com babado */}
      <rect x="326" y="92" width="12" height="202" fill="#8a5838" stroke="#57311f" strokeWidth="2"/><rect x="682" y="92" width="12" height="202" fill="#8a5838" stroke="#57311f" strokeWidth="2"/>
      <g className="stand-awning">
        {Array.from({ length: 12 }, (_, index) => { const x = 316 + index * 32; const color = index % 2 ? '#fff1c7' : '#e8576f'; return <g key={index}>
          <rect x={x} y="68" width="32" height="30" fill={color}/><path d={`M${x} 98h32v4h-4v4h-24v-4h-4Z`} fill={color}/>
        </g>; })}
        <path d="M316 66h384v4H316Z" fill="#57311f"/><path d="M316 98h384" stroke="#57311f" strokeWidth="1" opacity=".3"/>
      </g>
      <path d="M470 66V54M550 66V54" stroke="#57311f" strokeWidth="2"/>
      <rect x="440" y="30" width="140" height="28" fill="#57311f"/><rect x="443" y="33" width="134" height="22" fill="#d9a05a"/><rect x="443" y="33" width="134" height="3" fill="#f2c27a"/>
      <text x="510" y="49" textAnchor="middle" className="stand-sign-text">METAS DE HOJE</text>

      {/* Balcão */}
      <rect x="324" y="232" width="372" height="10" fill="#d9a05a" stroke="#57311f" strokeWidth="2"/>
      <rect x="330" y="242" width="360" height="52" fill="#a86b35" stroke="#57311f" strokeWidth="2"/>
      {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M${370 + index * 40} 242v52`} stroke="#8a5838" strokeWidth="2"/>)}

      {/* Lousinha com o placar do dia */}
      <g transform="translate(712 236)"><path d="M4 40l6-40M38 40l-6-40" stroke="#57311f" strokeWidth="3"/><rect x="0" y="0" width="42" height="30" fill="#3f4a3c" stroke="#8a5838" strokeWidth="3"/><text x="21" y="20" textAnchor="middle" className="stand-chalk">{done}/{goals.length}</text></g>
    </g>

    {/* Caixotes (um por meta) */}
    {crates.map((goal, index) => {
      const progress = progressFor(goal, log, today);
      const isDone = isDoneOn(goal, log, today);
      const [color, light] = goalColor(goal);
      return <g key={goal.id} transform={`translate(${crateX(index)} 196) scale(${CRATE_SCALE})`} className={`stand-crate ${isDone ? 'is-done' : ''}`} role="button" tabIndex={0} shapeRendering="crispEdges"
        aria-label={`${goal.title}: ${isDone ? 'colhida hoje' : `${progress}%. Colher`}`} onClick={event=>onHarvest(goal, event.currentTarget)} onKeyDown={event=>onKey(event, goal)}
        onMouseEnter={()=>setHovered(index)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(index)} onBlur={()=>setHovered(null)}>
        <rect x="-2" y="-26" width="52" height="56" fill="transparent"/>
        <g className="crate-produce">{HEAP.slice(0, fillCount(progress)).map(([px, py], item) => <g key={item} transform={`translate(${px} ${py})`}>
          <path d={ITEM} fill={color} stroke="#3b2418" strokeWidth=".8"/><path d="M2 2h2v2H2Z" fill={light}/>
          {goal.icon === 'target' && <path d="M3-2h2v2H3Z" fill="#53922d"/>}
        </g>)}</g>
        {isDone && <path className="crate-sparkle" d="M44-20h2v2h-2Zm-42 4h2v2H2Z" fill="#fff"/>}
        <rect x="0" y="0" width="48" height="28" fill="#b07a4c" stroke="#57311f" strokeWidth="2"/>
        <path d="M2 9h44M2 18h44" stroke="#8a5838" strokeWidth="2"/><rect x="0" y="0" width="5" height="28" fill="#8a5838"/><rect x="43" y="0" width="5" height="28" fill="#8a5838"/>
        {/* Etiqueta pendurada na frente do balcão */}
        <path d="M24 28v12" stroke="#57311f" strokeWidth="1.5"/>
        <rect x="1" y="40" width="46" height="24" fill={isDone ? '#e8f0c4' : '#fff1c7'} stroke="#8a5838" strokeWidth="1.5"/>
        <text x="24" y="50" textAnchor="middle" className="crate-tag">{short(goal.title, 9)}</text>
        <text x="24" y="60" textAnchor="middle" className={`crate-tag-progress ${isDone ? 'is-done' : ''}`}>{isDone ? '✓ colhida' : `${progress}%`}</text>
      </g>;
    })}
    {extra > 0 && <g transform={`translate(${crateX(crates.length) + 8} 206) scale(${CRATE_SCALE})`} className="crate-more"><rect width="28" height="18" fill="#fff1c7" stroke="#8a5838" strokeWidth="1.5"/><text x="14" y="13" textAnchor="middle" className="crate-tag">+{extra}</text></g>}
    {goals.length === 0 && [0, 1, 2].map(index => <g key={index} transform={`translate(${crateX(index)} 196) scale(${CRATE_SCALE})`} shapeRendering="crispEdges" opacity=".8">
      <rect width="48" height="28" fill="#b07a4c" stroke="#57311f" strokeWidth="2"/><path d="M2 9h44M2 18h44" stroke="#8a5838" strokeWidth="2"/></g>)}

    {/* Plaquinha com o nome inteiro da meta (hover/foco) */}
    {hovered !== null && crates[hovered] && (() => {
      const goal = crates[hovered];
      const label = short(goal.title, 26);
      const width = label.length * 6.2 + 20;
      const x = crateX(hovered) + 24 * CRATE_SCALE;
      return <g className="crate-plaque" transform={`translate(${x} 156)`} pointerEvents="none" shapeRendering="crispEdges">
        <rect x={-width / 2} y="-14" width={width} height="20" fill="#57311f"/><rect x={-width / 2 + 2} y="-12" width={width - 4} height="16" fill="#fff1c7"/>
        <path d="M-4 6h8l-4 5Z" fill="#57311f"/>
        <text x="0" y="0" textAnchor="middle" className="crate-plaque-text">{label}</text>
      </g>;
    })()}
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
  </>;
}
