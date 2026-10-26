import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { CHAPTERS, STOPS_PER_CHAPTER, smoothPath } from '../../lib/journey';
import { CHEST_STOPS } from '../../lib/treasure';
import { avatarColors } from '../../lib/avatar';
import { useProfile } from '../../hooks/useProfile';
import { GuideWarrior } from './GuideWarrior';
import { MAP_H, MAP_W, PIXEL_WORLDS, spritePaths, type Placed } from './pixelWorlds';
import { GLYPHS } from './Landmarks';

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

/** Um enfeite do mapa em pixel art, ancorado pelo pé */
function PixelSprite({ item, delay }: { item: Placed; delay: number }) {
  const { sprite, x, y, scale } = item;
  const width = sprite.rows[0].length * scale, height = sprite.rows.length * scale;
  // A animação mexe no transform do grupo do meio; a escala fica num grupo próprio para não ser sobrescrita
  return <g transform={`translate(${x - width / 2} ${y - height})`}><g className="px-pop" style={{ '--d': `${delay.toFixed(2)}s` } as CSSProperties}><g transform={`scale(${scale})`}>
    {spritePaths(sprite).map(({ fill, d }) => <path key={fill} d={d} fill={fill}/>)}
  </g></g></g>;
}

interface WorldMapProps {
  world: number; chapter: number; reached: number; loop: number; heading: boolean; freshNode: number | null;
  opened: string[]; onOpenChest: (id: string) => void; onTalk: () => void;
}

/**
 * Mapa da jornada em pixel art: cada região é um mundo com o seu próprio mapa, que se monta peça por peça
 * quando aparece. O mapa inteiro sempre cabe na tela; o nome do mundo fica na placa do topo (MissionsHero).
 */
export function WorldMap({ world, chapter, reached, loop, heading, freshNode, opened, onOpenChest, onTalk }: WorldMapProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const map = PIXEL_WORLDS[world];
  const isCurrent = world === chapter;
  const done = isCurrent ? reached : STOPS_PER_CHAPTER; // mundos anteriores já foram todos percorridos
  const trail = smoothPath([map.start, ...map.nodes, map.exit]);
  const current = done > 0 ? map.nodes[done - 1] : map.start;
  // O trecho percorrido é a própria trilha, recortada até a última parada (a trilha sempre anda para a direita)
  const traveledTo = isCurrent ? current[0] : map.exit[0];
  const next = map.nodes[done] ?? map.exit;
  const [ex, ey] = heading ? [(current[0] + next[0]) / 2, (current[1] + next[1]) / 2] : current;
  const fresh = isCurrent && freshNode !== null && Math.floor(freshNode / STOPS_PER_CHAPTER) === chapter ? freshNode % STOPS_PER_CHAPTER : null;

  // Ordem da montagem: chão e água, a trilha se abrindo, os enfeites de cima para baixo e por fim as paradas
  const step = Math.min(.05, 2.4 / map.items.length);
  const trailAt = .3;
  const stopsAt = .4 + map.items.length * step;
  const name = CHAPTERS[world].name;
  const onKey = (event: KeyboardEvent, action: () => void) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); } };

  return <svg className="world-map pixel-map" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMax meet" role="group" aria-label={`Mapa de ${name}: ${done} de ${STOPS_PER_CHAPTER} paradas`}>
    {/* Trocar de mundo remonta o mapa, e ele se monta de novo */}
    <g key={`${loop}-${world}`}>
      <defs>
        <clipPath id={`trail-reveal-${world}`}><rect className="trail-wipe" style={{ '--d': `${trailAt}s`, '--t': '1.6s' } as CSSProperties} x="0" y="-100" width={MAP_W} height={MAP_H + 200}/></clipPath>
        <clipPath id={`trail-done-${world}`}><rect x="0" y="-100" width={traveledTo + 1} height={MAP_H + 200}/></clipPath>
      </defs>
      <rect x="-3000" y="-1000" width="8000" height="2400" fill={map.ground}/>
      {/* Pontinhos no chão, como a grama dos jogos */}
      <g fill={map.speck} shapeRendering="crispEdges">{Array.from({ length: 140 }, (_, i) => <rect key={i} x={(i * 137) % MAP_W} y={(i * 71) % MAP_H} width="4" height="2"/>)}</g>
      <g className="px-water" shapeRendering="crispEdges">
        {map.water.map((d, i) => <path key={i} d={d} fill="#4fa3e0" stroke="#1d4f8a" strokeWidth="3"/>)}
        {map.foam.map(([x, y], i) => <path key={`f${i}`} d={`M${x} ${y}h14v2h-14Zm6 6h12v2h-12Z`} fill="#bfe6f7"/>)}
      </g>

      {/* Trilha de terra: abre da esquerda para a direita; o trecho já andado ganha pegadas */}
      <g clipPath={`url(#trail-reveal-${world})`}>
        <path d={trail} fill="none" stroke="#a87a44" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={trail} fill="none" stroke="#e6c385" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
        {done > 0 && <path clipPath={`url(#trail-done-${world})`} d={trail} fill="none" stroke="#b8864a" strokeWidth="3" strokeDasharray="4 6"/>}
      </g>

      <g shapeRendering="crispEdges">{map.items.map((item, index) => <PixelSprite key={index} item={item} delay={.2 + index * step}/>)}</g>

      {/* Paradas: cada uma tem a sua construção (as mesmas da primeira versão do mapa); as com baú também ganham bandeira.
          A próxima ganha uma setinha pulando; as ainda não alcançadas ficam apagadinhas.
          A última parada do castelo fica escondida até ser alcançada, para não estragar a surpresa */}
      {map.nodes.map(([x, y], index) => {
        const state = index < done ? 'done' : index === done && isCurrent ? 'next' : 'future';
        const stop = CHAPTERS[world].stops[index];
        const secret = stop.landmark === 'princess' && state !== 'done';
        return <g key={index} className={`map-node is-${state}`} onMouseEnter={()=>setHovered(index)} onMouseLeave={()=>setHovered(null)}>
          <g className={`px-pop ${fresh === index ? 'is-fresh' : ''}`} style={{ '--d': `${(stopsAt + index * .12).toFixed(2)}s` } as CSSProperties} shapeRendering="crispEdges">
            <g transform={`translate(${x} ${y})`}>
              <rect x="-26" y="-56" width="52" height="64" fill="transparent"/>
              <path className="node-base" d="M-10-3h20v2h2v4h-2v2h-20v-2h-2v-4h2Z"/>
              {!secret && <g className="node-landmark">{GLYPHS[stop.landmark]}</g>}
              {CHEST_STOPS[index] && <g className="node-flag" transform={secret ? undefined : 'translate(-24 2)'}><path d="M-1-22h2v20h-2Z" fill="#57311f"/><path className="lm-flag" d="M1-22h11v8H1Z" stroke="#3b2418" strokeWidth="1"/></g>}
              {state === 'next' && <g transform={`translate(0 ${secret ? -34 : -64})`}><path className="node-pointer" d="M-6-6h12v4h-2v2h-2v2h-4v-2h-2v-2h-2Z" fill="#f2c453" stroke="#57311f" strokeWidth="1.5"/></g>}
            </g>
          </g>
        </g>;
      })}

      {/* Baús nas paradas 3 e 5 de cada mundo: aparecem quando encontrados */}
      {map.nodes.map(([x, y], stop) => {
        if (!CHEST_STOPS[stop] || stop >= done) return null;
        const id = `${loop}:${world}:${stop}`;
        const ready = !opened.includes(id);
        const isNew = fresh === stop;
        return <g key={`chest-${stop}`} transform={`translate(${x + 26} ${y + 4})`} className={`map-chest ${ready ? 'is-ready' : 'is-opened'} ${isNew ? 'is-new' : ''}`} shapeRendering="crispEdges"
          {...(ready ? { role: 'button', tabIndex: 0, 'aria-label': 'Abrir baú', onClick: () => onOpenChest(id), onKeyDown: (event: KeyboardEvent) => onKey(event, () => onOpenChest(id)) } : { 'aria-hidden': true })}>
          {/* Baú recém-encontrado cai do céu com uma explosão de brilhos */}
          {isNew && <g className="map-chest-burst">{Array.from({ length: 8 }, (_, spark) => <rect key={spark} x="-1.5" y="-8" width="3" height="3" fill={spark % 2 ? '#ffe38b' : '#fff6c2'} style={{ '--i': spark } as CSSProperties}/>)}</g>}
          <g className="map-chest-drop"><g className="map-chest-body">
            {ready && <ellipse cx="0" cy="-5" rx="11" ry="8" fill="#fff6c2" className="map-chest-halo"/>}
            <path d="M-7-6h14v6H-7Z" fill="#a86b35" stroke="#3b2418" strokeWidth="1.2"/><path d="M-2-6h4v4h-4Z" fill={CHEST_STOPS[stop] === 'big' ? '#f2c453' : '#c6ccd6'}/>
            {ready ? <path d="M-7-10h14v4H-7Z" fill="#8a5838" stroke="#3b2418" strokeWidth="1.2"/> : <path d="M-7-13h14v3H-7Z" fill="#8a5838" stroke="#3b2418" strokeWidth="1.2" transform="rotate(-25 -7 -10)"/>}
          </g></g>
          {ready && <g className="map-chest-prompt" transform="translate(0 -24)"><rect x="-17" y="-8" width="34" height="13" fill="#57311f"/><rect x="-15" y="-6" width="30" height="9" fill="#fff1c7"/><path d="M-2 5h4l-2 3Z" fill="#57311f"/><text x="0" y="1.5" textAnchor="middle">Abrir!</text></g>}
        </g>;
      })}

    </g>

    {/* Capitão Bússola, guia da guilda: do tamanho do gato Bigode */}
    <g className="map-guide npc-clickable" onClick={onTalk} shapeRendering="crispEdges">
      <ellipse cx="66" cy="294" rx="36" ry="6" fill="#3b2418" opacity=".22"/>
      <g className="guide-body"><foreignObject x="12" y="172" width="108" height="122"><GuideWarrior className="h-full w-full"/></foreignObject></g>
      <g className="talk-prompt"><rect x="30" y="146" width="72" height="20" fill="#57311f"/><rect x="32" y="148" width="68" height="16" fill="#fff1c7"/><rect x="62" y="166" width="8" height="4" fill="#57311f"/>
        <text x="66" y="160" textAnchor="middle" className="talk-prompt-text">Conversar</text></g>
    </g>

    {isCurrent && <Explorer x={ex - 34} y={ey + 6} heading={heading}/>}

    {/* Nome da parada só no hover */}
    {hovered !== null && (() => {
      const [x, y] = map.nodes[hovered];
      const label = hovered < done ? CHAPTERS[world].stops[hovered].name : 'Parada misteriosa';
      const width = label.length * 6.2 + 18;
      return <g className="crate-plaque" transform={`translate(${x} ${y - 72})`} pointerEvents="none" shapeRendering="crispEdges">
        <rect x={-width / 2} y="-12" width={width} height="18" fill="#57311f"/><rect x={-width / 2 + 2} y="-10" width={width - 4} height="14" fill="#fff1c7"/>
        <text x="0" y="1" textAnchor="middle" className="crate-plaque-text">{label}</text>
      </g>;
    })()}
  </svg>;
}
