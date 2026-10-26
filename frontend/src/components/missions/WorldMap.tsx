import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { CHAPTERS, STOPS_PER_CHAPTER, smoothPath } from '../../lib/journey';
import { CHEST_STOPS } from '../../lib/treasure';
import { avatarColors } from '../../lib/avatar';
import { useProfile } from '../../hooks/useProfile';
import { GLYPHS } from './Landmarks';
import { PixelAvatar } from '../PixelAvatar';
import { GUIDE } from '../../lib/guildGuide';

type Point = [number, number];
const HOME: Point = [52, 268];
// 5 paradas por região, numa trilha que sobe do vale ao castelo (coordenadas do mapa 1000×330)
const NODES: Point[][] = [
  [[108, 264], [150, 228], [198, 260], [232, 214], [276, 244]],
  [[330, 264], [366, 220], [418, 254], [456, 210], [508, 236]],
  [[562, 206], [598, 168], [648, 200], [690, 160], [742, 188]],
  [[792, 226], [834, 256], [876, 214], [916, 244], [956, 196]],
];
const REGION_LABEL: Point[] = [[150, 168], [420, 170], [650, 116], [880, 152]];

// Contorno de cada região (ilhas orgânicas com contorno de tinta)
const REGION_SHAPES = [
  'M20 204Q60 172 140 180Q230 170 270 198Q292 252 264 302Q160 320 40 306Q8 262 20 204Z',
  'M282 198Q340 174 430 186Q500 178 516 206Q530 262 506 304Q400 320 296 306Q270 252 282 198Z',
  'M524 172Q580 132 660 140Q740 128 764 162Q778 202 754 242Q650 254 540 242Q510 208 524 172Z',
  'M770 178Q830 150 900 158Q976 150 988 192Q996 252 972 298Q870 314 786 302Q758 242 770 178Z',
];
const REGION_FILL = ['#b5dc86', '#82b862', '#d6cfc2', '#cdbfd6'];

/** Terreno de cada região (ilha + detalhes) */
const TERRAIN: ReactNode[] = [
  <g key="vale"><path d={REGION_SHAPES[0]} fill={REGION_FILL[0]} stroke="#7a8f4e" strokeWidth="2"/><path d="M60 290h30v6H60Zm150-6h36v6h-36Z" fill="#9cc96f"/>
    <g shapeRendering="crispEdges"><path d="M40 260h24v14H40Z" fill="#e8c48a" stroke="#57311f" strokeWidth="1.5"/><path d="M36 262l16-12 16 12Z" fill="#bf5837" stroke="#7a2e17" strokeWidth="1.5" strokeLinejoin="round"/></g></g>,
  <g key="floresta"><path d={REGION_SHAPES[1]} fill={REGION_FILL[1]} stroke="#4f7a3a" strokeWidth="2"/>
    {[[304, 214], [486, 210], [312, 296], [395, 298], [480, 294], [430, 200]].map(([x, y]) => <path key={`${x}-${y}`} d={`M${x} ${y - 16}l8 12h-4l6 9h-20l6-9h-4Z`} fill="#4f8a3a" stroke="#3f6b35" strokeWidth="1.2" strokeLinejoin="round"/>)}</g>,
  <g key="montanhas"><path d={REGION_SHAPES[2]} fill={REGION_FILL[2]} stroke="#8a7f6e" strokeWidth="2"/>
    <path d="M548 236l22-34 20 22 22-42 26 54Z M694 236l18-28 16 16 18-26 16 38Z" fill="#bdb5a6" stroke="#8a7f6e" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M610 186l4-6 6 10-3-1-3 2-2-2Z M742 190l3-5 5 8-3-1-2 1-2-1Z" fill="#fff"/></g>,
  <g key="castelo"><path d={REGION_SHAPES[3]} fill={REGION_FILL[3]} stroke="#6d5a7a" strokeWidth="2"/>
    <g shapeRendering="crispEdges" fill="#a597b5" stroke="#6d5a7a" strokeWidth="1.2"><path d="M934 196v-34h8v-6h6v6h4v-6h6v6h6v34Z"/><path d="M942 172h4v8h-4Z" fill="#ffd76a"/></g></g>,
];

/** Nuvens sobre uma região ainda não alcançada, com cadeado; somem com animação quando a região é desbloqueada */
function RegionClouds({ chapter, clearing }: { chapter: number; clearing: boolean }) {
  const [x0, x1] = [[14, 290], [276, 528], [516, 776], [762, 996]][chapter];
  const [y0, y1] = chapter === 2 ? [128, 250] : [168, 312];
  // Poucos tufos, recortados no formato da ilha: a terra existe, só ainda está na névoa
  const puffs = Array.from({ length: 6 }, (_, index) => ({ x: x0 + 8 + (index % 3) * ((x1 - x0 - 60) / 2) + (Math.floor(index / 3) ? 30 : 0), y: y0 + 18 + Math.floor(index / 3) * ((y1 - y0) / 2.3) }));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return <g className={`region-clouds ${clearing ? 'is-clearing' : ''}`} aria-hidden="true">
    <clipPath id={`region-clip-${chapter}`}><path d={REGION_SHAPES[chapter]}/></clipPath>
    <path d={REGION_SHAPES[chapter]} fill="#e9e1cf" stroke="#b9ad96" strokeWidth="2" strokeDasharray="6 5"/>
    <g clipPath={`url(#region-clip-${chapter})`} opacity=".95">
      {puffs.map((puff, index) => <g key={index} transform={`translate(${puff.x} ${puff.y})`}><g className="cloud-puff" style={{ animationDelay: `${-index * 0.8}s` }} transform="scale(1.3)">
        <path d="M0 18h8v-8h10v-6h16v6h10v8h8v12H0Z" fill="#fbf7ee" stroke="#ddd2bc" strokeWidth="1"/></g></g>)}
    </g>
    <g transform={`translate(${cx - 10} ${cy - 12}) scale(1.25)`} shapeRendering="crispEdges"><path d="M3 0h10v3h2v5h-3V3H4v5H1V3h2Z" fill="#8a7f6e"/><path d="M0 8h16v12H0Z" fill="#a89a80" stroke="#6b6255" strokeWidth="1.5"/><path d="M7 12h2v4H7Z" fill="#57311f"/></g>
  </g>;
}

/** Mini personagem do jogador (cores do perfil); "!" quando está a caminho de uma missão */
function Explorer({ x, y, heading }: { x: number; y: number; heading: boolean }) {
  const [profile] = useProfile();
  const colors = avatarColors(profile.avatar);
  return <g className="map-explorer" style={{ transform: `translate(${x}px, ${y}px)` }} aria-hidden="true">
    <g className="explorer-bob" shapeRendering="crispEdges">
      <ellipse cx="0" cy="8" rx="7" ry="2" fill="#3b2418" opacity=".25"/>
      <path d="M-4 3h3v5h-3Zm5 0h3v5H1Z" fill="#846853"/><path d="M-5-5h10v9H-5Z" fill={colors.outfit}/>
      <path d="M-6-13h12v8h-12Z" fill={colors.hair}/><path d="M-4-12h8v7h-8Z" fill={colors.skin}/><path d="M-2-10h1v2h-1Zm3 0h1v2H1Z" fill="#3b2418"/>
      {profile.avatar.hat !== 'none' && <path d="M-8-14h16v3H-8Zm3-4h10v4H-5Z" fill={colors.hat}/>}
      {heading && <g className="explorer-alert"><path d="M7-32h10v12H7Z" fill="#fff1c7" stroke="#57311f" strokeWidth="1.5"/><path d="M11-30h2v5h-2Zm0 6h2v2h-2Z" fill="#bf5837"/></g>}
    </g>
  </g>;
}

interface WorldMapProps {
  chapter: number; reached: number; loop: number; heading: boolean; freshNode: number | null; clearingChapter: number | null;
  opened: string[]; onOpenChest: (id: string) => void; onTalk: () => void;
}

/**
 * Mapa-múndi da jornada: as 4 regiões num mapa só. Regiões ainda não alcançadas ficam sob nuvens;
 * cada missão cumprida anda uma parada. Nomes só aparecem no hover, para o mapa ficar limpo.
 */
export function WorldMap({ chapter, reached, loop, heading, freshNode, clearingChapter, opened, onOpenChest, onTalk }: WorldMapProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const done = chapter * STOPS_PER_CHAPTER + reached; // paradas alcançadas nesta volta
  const flat = NODES.flat();
  const trail = smoothPath([HOME, ...flat]);
  const traveled = done > 0 ? smoothPath([HOME, ...flat.slice(0, done)]) : '';
  const current: Point = done > 0 ? flat[done - 1] : HOME;
  const next = flat[done];
  const [ex, ey] = heading && next ? [(current[0] + next[0]) / 2, (current[1] + next[1]) / 2] : current;
  const onKey = (event: KeyboardEvent, id: string) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenChest(id); } };

  return <svg className="world-map" viewBox="0 110 1000 220" preserveAspectRatio="xMidYMax meet" role="group" aria-label={`Mapa da jornada: região ${CHAPTERS[chapter].name}, ${done} de ${flat.length} paradas`}>
    <rect x="-2000" y="0" width="5000" height="400" fill="#efd7a2"/>
    <path d="M-2000 330H3000" stroke="#00000010"/>
    <g fill="#00000008">{[[180, 120, 160, 40], [620, 300, 200, 30], [880, 110, 140, 30]].map(([x, y, rx, ry]) => <ellipse key={x} cx={x} cy={y} rx={rx} ry={ry}/>)}</g>
    {/* Rio entre o vale e a floresta, com pontezinha onde a trilha cruza */}
    <path d="M286 150C276 200 300 240 282 330" fill="none" stroke="#7cc0dc" strokeWidth="10"/><path d="M286 150C276 200 300 240 282 330" fill="none" stroke="#a9dcef" strokeWidth="3"/>

    {/* Terreno só das regiões alcançadas (as outras ficam só como silhueta na névoa) */}
    {TERRAIN.filter((_, index) => index <= chapter)}
    <path d={trail} fill="none" stroke="#8a583855" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 11"/>
    {traveled && <path className="map-trail" d={traveled} fill="none" stroke="#7a3a1f" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 11"/>}

    {/* Paradas: as alcançadas mostram o marco; a próxima pulsa; as seguintes são só um pontinho */}
    {flat.map(([x, y], index) => {
      const region = Math.floor(index / STOPS_PER_CHAPTER);
      if (region > chapter) return null;
      const stop = CHAPTERS[region].stops[index % STOPS_PER_CHAPTER];
      const state = index < done ? 'done' : index === done ? 'next' : 'future';
      return <g key={index} transform={`translate(${x} ${y})`} className={`map-node is-${state}`} onMouseEnter={()=>setHovered(index)} onMouseLeave={()=>setHovered(null)}>
        <rect x="-14" y="-30" width="28" height="40" fill="transparent"/>
        <ellipse className="node-base" cx="0" cy="2" rx="9" ry="4"/>
        {state === 'done' && <g key={freshNode === index ? 'fresh' : 'shown'} className={`node-landmark ${freshNode === index ? 'is-fresh' : ''}`} transform="scale(.75)" shapeRendering="crispEdges">{GLYPHS[stop.landmark]}</g>}
        {state === 'next' && <g className="node-flag" shapeRendering="crispEdges"><path d="M-1-20h2v20h-2Z" fill="#57311f"/><path className="lm-flag" d="M1-20h11v7H1Z" fill="#e7b84b"/></g>}
      </g>;
    })}

    {/* Baús nas paradas 3 e 5 de cada região: aparecem quando encontrados */}
    {flat.map(([x, y], index) => {
      const region = Math.floor(index / STOPS_PER_CHAPTER), stop = index % STOPS_PER_CHAPTER;
      if (!CHEST_STOPS[stop] || index >= done) return null;
      const id = `${loop}:${region}:${stop}`;
      const ready = !opened.includes(id);
      const fresh = freshNode === index;
      return <g key={`chest-${index}`} transform={`translate(${x + 16} ${y + 2})`} className={`map-chest ${ready ? 'is-ready' : 'is-opened'} ${fresh ? 'is-new' : ''}`} shapeRendering="crispEdges"
        {...(ready ? { role: 'button', tabIndex: 0, 'aria-label': 'Abrir baú', onClick: () => onOpenChest(id), onKeyDown: (event: KeyboardEvent) => onKey(event, id) } : { 'aria-hidden': true })}>
        {/* Baú recém-encontrado cai do céu com uma explosão de brilhos */}
        {fresh && <g className="map-chest-burst">{Array.from({ length: 8 }, (_, spark) => <rect key={spark} x="-1.5" y="-8" width="3" height="3" fill={spark % 2 ? '#ffe38b' : '#fff6c2'} style={{ '--i': spark } as CSSProperties}/>)}</g>}
        <g className="map-chest-drop"><g className="map-chest-body">
          {ready && <ellipse cx="0" cy="-5" rx="11" ry="8" fill="#fff6c2" className="map-chest-halo"/>}
          <path d="M-7-6h14v6H-7Z" fill="#a86b35" stroke="#3b2418" strokeWidth="1.2"/><path d="M-2-6h4v4h-4Z" fill={CHEST_STOPS[stop] === 'big' ? '#f2c453' : '#c6ccd6'}/>
          {ready ? <path d="M-7-10h14v4H-7Z" fill="#8a5838" stroke="#3b2418" strokeWidth="1.2"/> : <path d="M-7-13h14v3H-7Z" fill="#8a5838" stroke="#3b2418" strokeWidth="1.2" transform="rotate(-25 -7 -10)"/>}
        </g></g>
        {ready && <g className="map-chest-prompt" transform="translate(0 -24)"><rect x="-17" y="-8" width="34" height="13" fill="#57311f"/><rect x="-15" y="-6" width="30" height="9" fill="#fff1c7"/><path d="M-2 5h4l-2 3Z" fill="#57311f"/><text x="0" y="1.5" textAnchor="middle">Abrir!</text></g>}
      </g>;
    })}

    {/* Nome das regiões alcançadas; as demais ficam sob nuvens */}
    {REGION_LABEL.map(([x, y], index) => index > chapter ? null : <g key={index} transform={`translate(${x} ${y})`} className={`region-label ${index === chapter ? 'is-current' : ''}`} shapeRendering="crispEdges">
      <rect x={-CHAPTERS[index].name.length * 3.4 - 10} y="-11" width={CHAPTERS[index].name.length * 6.8 + 20} height="18" fill="#57311f"/>
      <rect x={-CHAPTERS[index].name.length * 3.4 - 8} y="-9" width={CHAPTERS[index].name.length * 6.8 + 16} height="14" fill={index === chapter ? '#f2c453' : '#d9a05a'}/>
      <text x="0" y="2" textAnchor="middle">{CHAPTERS[index].name}</text>
    </g>)}
    {CHAPTERS.map((_, index) => index > chapter || index === clearingChapter ? <RegionClouds key={`clouds-${index}`} chapter={index} clearing={index === clearingChapter}/> : null)}
    {loop > 1 && <g transform="translate(40 168)" shapeRendering="crispEdges"><rect x="-4" y="-12" width="76" height="18" fill="#57311f"/><rect x="-2" y="-10" width="72" height="14" fill="#fff1c7"/><text x="34" y="1" textAnchor="middle" className="map-loop">Jornada {loop}</text></g>}

    {/* Capitão Bússola, guia da guilda: fica perto de casa e explica as mecânicas */}
    <g className="map-guide npc-clickable" onClick={onTalk} shapeRendering="crispEdges">
      <ellipse cx="62" cy="226" rx="18" ry="4" fill="#3b2418" opacity=".22"/>
      <g className="guide-body"><foreignObject x="37" y="171" width="50" height="56"><PixelAvatar avatar={GUIDE} className="h-full w-full"/></foreignObject></g>
      <g className="talk-prompt"><rect x="34" y="150" width="56" height="15" fill="#57311f"/><rect x="36" y="152" width="52" height="11" fill="#fff1c7"/><rect x="59" y="165" width="6" height="3" fill="#57311f"/>
        <text x="62" y="160.5" textAnchor="middle" className="talk-prompt-text">Conversar</text></g>
    </g>

    {/* A exploradora fica ao lado da parada, sem cobrir o marco */}
    <Explorer x={ex - 16} y={ey + 4} heading={heading}/>

    {/* Nome da parada só no hover */}
    {hovered !== null && (() => {
      const [x, y] = flat[hovered];
      const region = Math.floor(hovered / STOPS_PER_CHAPTER);
      const name = hovered < done ? CHAPTERS[region].stops[hovered % STOPS_PER_CHAPTER].name : 'Parada misteriosa';
      const width = name.length * 6.2 + 18;
      return <g className="crate-plaque" transform={`translate(${x} ${y - 40})`} pointerEvents="none" shapeRendering="crispEdges">
        <rect x={-width / 2} y="-12" width={width} height="18" fill="#57311f"/><rect x={-width / 2 + 2} y="-10" width={width - 4} height="14" fill="#fff1c7"/>
        <text x="0" y="1" textAnchor="middle" className="crate-plaque-text">{name}</text>
      </g>;
    })()}
  </svg>;
}
