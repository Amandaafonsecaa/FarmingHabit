import type { CSSProperties, ReactNode } from 'react';
import { CHAPTERS, smoothPath, type ChapterTheme } from '../../lib/journey';
import { JourneyStop } from './Landmarks';

const PARCHMENT: Record<ChapterTheme, string> = { valley: '#f0d49a', forest: '#e4d9a0', mountain: '#ebe5d6', castle: '#e6d4c6' };
const tree = (x: number, y: number, color = '#6d9b45', size = 1) => <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${size})`}><path d="M0-18l9 14h-4l7 10h-24l7-10h-4Z" fill={color} stroke="#3f6b35" strokeWidth="1.5" strokeLinejoin="round"/><path d="M-1 6h2v5h-2Z" fill="#7a4a26"/></g>;

/** Cenário de fundo de cada capítulo, desenhado como tinta sobre pergaminho */
const SCENERY: Record<ChapterTheme, ReactNode> = {
  valley: <>
    <g fill="#dcc27c" opacity=".7"><ellipse cx="420" cy="150" rx="160" ry="30"/><ellipse cx="760" cy="140" rx="140" ry="26"/></g>
    <g stroke="#b5965a" strokeWidth="1.5" opacity=".8">{[[360, 120], [690, 110]].map(([x, y]) => <g key={x}><path d={`M${x} ${y}h90v34h-90Z`} fill="#e6cf8c"/>{[8, 16, 24].map(dy => <path key={dy} d={`M${x + 4} ${y + dy}h82`}/>)}</g>)}</g>
    <path d="M520 0C500 60 560 100 530 160S560 260 540 320" fill="none" stroke="#7cc0dc" strokeWidth="11"/><path d="M520 0C500 60 560 100 530 160S560 260 540 320" fill="none" stroke="#a9dcef" strokeWidth="3"/>
    {[[880, 120], [905, 100], [930, 125], [600, 300], [260, 300]].map(([x, y]) => tree(x, y))}
    <g shapeRendering="crispEdges"><path d="M28 238h32v20H28Z" fill="#e8c48a" stroke="#57311f" strokeWidth="2"/><path d="M22 240l22-16 22 16Z" fill="#bf5837" stroke="#7a2e17" strokeWidth="2" strokeLinejoin="round"/></g>
  </>,
  forest: <>
    {Array.from({ length: 16 }, (_, i) => tree(30 + i * 62, 150 + (i % 3) * 10, i % 2 ? '#4f8a3a' : '#5f9a3e', 1.3))}
    {Array.from({ length: 14 }, (_, i) => tree(60 + i * 70, 312 + (i % 2) * 6, '#4f8a3a', 1.1))}
    <g className="map-fireflies" fill="#f6d34a">{[[120, 180], [260, 160], [410, 190], [560, 170], [720, 186], [870, 166], [940, 280], [380, 296]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" style={{ animationDelay: `${-i * 0.6}s` }}/>)}</g>
  </>,
  mountain: <>
    <g stroke="#7a6a5a" strokeWidth="2" strokeLinejoin="round">
      <path d="M300 170l70-100 40 50 50-80 90 130Z" fill="#c9c2b4"/><path d="M600 170l60-80 50 60 40-40 70 60Z" fill="#d4cdbf"/><path d="M140 170l50-60 50 60Z" fill="#d4cdbf"/>
      <path d="M352 96l18-26 16 22-8 4-8-6-10 8Z M444 64l16-24 22 32-8-4-10 6-8-6Z M648 106l12-16 12 14-6 3-6-4-6 4Z" fill="#fff"/>
    </g>
    <g className="map-snow" fill="#fff">{Array.from({ length: 22 }, (_, i) => <rect key={i} x={(i * 47) % 1000} y={-10} width="3" height="3" style={{ animationDelay: `${-(i * 0.73) % 6}s`, animationDuration: `${5 + (i % 4)}s` } as CSSProperties}/>)}</g>
  </>,
  castle: <>
    <circle cx="560" cy="62" r="20" fill="#fff6dd" stroke="#c9b58a" strokeWidth="2"/><circle cx="552" cy="56" r="4" fill="#efe2bf"/>
    <g fill="#b9a8c4" stroke="#6d5a7a" strokeWidth="2" opacity=".85">
      <path d="M660 170V90h30v-20h20v20h60v-40h24v40h40v80Z"/><path d="M690 70v-10h6v10m14 0v-10h6v10M770 50v-10h6v10m12 0v-10h6v10" fill="none"/>
    </g>
    <path d="M713 70h4v-24h-4Z M785 50h4v-24h-4Z" fill="#57311f"/><path className="map-flag" d="M717 46h16v8h-16Z M789 26h16v8h-16Z" fill="#bf5837"/>
    <path d="M700 110h10v14h-10Zm60 0h10v14h-10Zm40-30h10v14h-10Z" fill="#ffd76a" className="lm-glow"/>
    <g className="map-bats" fill="#3b2438"><path d="M0 0l6 3 4-3 4 3 6-3-4 6h-12Z" transform="translate(420 90)"/><path d="M0 0l5 3 3-2 3 2 5-3-3 5h-10Z" transform="translate(470 110)"/></g>
  </>,
};

/** Exploradora: anda (com transição) até a parada atual e mostra "!" quando está a caminho de uma missão */
function Explorer({ x, y, heading }: { x: number; y: number; heading: boolean }) {
  return <g className="map-explorer" style={{ transform: `translate(${x}px, ${y}px)` }} aria-hidden="true">
    <g className="explorer-bob" shapeRendering="crispEdges">
      <ellipse cx="0" cy="8" rx="7" ry="2" fill="#3b2418" opacity=".25"/>
      <path d="M-4 3h3v5h-3Zm5 0h3v5H1Z" fill="#846853"/><path d="M-5-5h10v9H-5Z" fill="#648244"/><path d="M5-4h4v6H5Z" fill="#b07a4c"/>
      <path d="M-4-12h8v7h-8Z" fill="#efc5a1"/><path d="M-2-10h1v2h-1Zm3 0h1v2H1Z" fill="#3b2418"/>
      <path d="M-8-14h16v3H-8Zm3-4h10v4H-5Z" fill="#e7b84b"/>
      {heading && <g className="explorer-alert"><path d="M7-32h10v12H7Z" fill="#fff1c7" stroke="#57311f" strokeWidth="1.5"/><path d="M11-30h2v5h-2Zm0 6h2v2h-2Z" fill="#bf5837"/></g>}
    </g>
  </g>;
}

export function JourneyMap({ chapterIndex, reached, heading, showExplorer, freshStop, loop }: {
  chapterIndex: number; reached: number; heading: boolean; showExplorer: boolean; freshStop: number | null; loop: number;
}) {
  const chapter = CHAPTERS[chapterIndex];
  const points: [number, number][] = [chapter.start, ...chapter.stops.map(stop => stop.at)];
  const full = smoothPath([...points, chapter.exit]);
  const traveled = reached > 0 ? smoothPath(points.slice(0, reached + 1)) : '';
  const [cx, cy] = points[reached];
  const next = points[reached + 1];
  // A caminho: fica no meio do trecho até a próxima parada
  const [ex, ey] = heading && next ? [(cx + next[0]) / 2, (cy + next[1]) / 2] : [cx, cy];

  return <svg className={`adventure-map theme-${chapter.theme} ${loop % 2 === 0 ? 'is-autumn' : ''}`} viewBox="0 0 1000 320" preserveAspectRatio="xMidYMid slice" role="img"
    aria-label={`Mapa do capítulo ${chapterIndex + 1}, ${chapter.name}: ${reached} de ${chapter.stops.length} paradas descobertas`}>
    <rect width="1000" height="320" fill={PARCHMENT[chapter.theme]}/>
    <g fill="#00000010">{[[150, 270, 90, 30], [620, 60, 120, 34], [880, 280, 100, 26], [380, 200, 70, 40]].map(([x, y, rx, ry]) => <ellipse key={x} cx={x} cy={y} rx={rx} ry={ry}/>)}</g>
    <path d="M333 0v320M666 0v320M0 160h1000" stroke="#00000014" strokeWidth="2"/>
    {/* key por capítulo: o cenário surge com transição ao trocar de mapa */}
    <g key={chapterIndex} className="map-scenery">{SCENERY[chapter.theme]}</g>

    <path d={full} fill="none" stroke="#8a583866" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 13"/>
    {traveled && <path className="map-trail" d={traveled} fill="none" stroke="#7a3a1f" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 11"/>}
    <g transform={`translate(${chapter.exit[0]} ${chapter.exit[1]})`}><path d="M-6 0l12-6v12Z" fill="#8a5838" className="exit-arrow"/></g>

    {chapter.stops.map((stop, index) => <JourneyStop key={`${chapterIndex}-${index}`} x={stop.at[0]} y={stop.at[1]} landmark={stop.landmark} name={stop.name} revealed={index < reached} fresh={freshStop === index}/>)}

    {/* Rosa dos ventos */}
    <g transform="translate(46 290)"><circle r="18" fill="#f6e2b0" stroke="#7a4a26" strokeWidth="2"/><path d="M0-18l3 15 15 3-15 3-3 15-3-15-15-3 15-3Z" fill="#e8ac59" stroke="#7a4a26" strokeWidth="1" strokeLinejoin="round"/><g className="compass-needle"><path d="M0-13l3 13h-6Z" fill="#bf5837"/><path d="M0 13l3-13h-6Z" fill="#3b2418"/></g></g>

    {showExplorer && <Explorer x={ex} y={ey - 2} heading={heading}/>}
  </svg>;
}
