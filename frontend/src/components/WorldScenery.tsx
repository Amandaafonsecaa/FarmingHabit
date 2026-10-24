import type { CSSProperties } from 'react';
import { FarmHouse } from './FarmHouse';
import { CharacterScene } from './CharacterScene';
function Tree({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M24 122h46v4h15v7H39v-4H24Z" fill="#345e29" opacity=".3"/><path d="M36 65h19v61H32v-9h4Z" fill="#785031"/><path d="M44 68h7v54h-7Z" fill="#ad7846"/><g className="tree-canopy" style={{ animationDelay: `${delay}s` }}><path d="M8 22h18V9h39v13h19v17h10v46H78v16H14V87H0V42h8Z" fill="#286237" stroke="#234a2a" strokeWidth="3"/><path d="M13 23h18V12h31v14h17v17h10v27H74v17H19V72H6V44h7Z" fill="#459b36"/><path d="M23 26h11V16h24v13h14v21H57v13H25V52H12V36h11Z" fill="#80c63c"/><path d="M15 62h13v7H15Zm42 11h15v7H57Zm10-36h12v6H67Z" fill="#b4de54"/><path d="M23 48h6v7h-6Zm42 9h6v7h-6Z" fill="#d6a16b"/></g></g>;
}
/** Muda da horta em 4 estágios: cova com semente, broto, folhas, folhas com fruto */
function GardenCrop({ stage, fruit }: { stage: number; fruit: string }) {
  return <g className="crop-stage">
    <path d="M-8 7h17v4H-8Z" fill="#8f6b47"/>
    {stage === 0 && <path d="M-1 5h3v2h-3Z" fill="#5b3826"/>}
    {stage === 1 && <><path d="M0 1h2v7H0Z" fill="#658447"/><path d="M-4 0h4v3h-4Zm6-2h4v3H2Z" fill="#62ae32"/></>}
    {stage >= 2 && <><path d="M-2 1h5v9h-5Z" fill="#658447"/><path d="M-2 3h-7v-8h5v4h5v-7h7v8H3v5Z" fill={stage === 2 ? '#62ae32' : '#398530'}/></>}
    {stage === 3 && <><path d="M-2 3h6v6h-6Z" fill={fruit}/><path d="M-1 4h2v2h-2Z" fill="#fff3b0"/></>}
  </g>;
}

/** Planta dos canteiros grandes: amadurece com o nível do jogador (e brilha a partir do nível 5) */
function BedCrop({ stage, row, golden }: { stage: number; row: number; golden: boolean }) {
  return <g className="crop-stage">
    <path d="M-8 13H9v4H-8Z" fill="#794525"/>
    {stage === 1 && <><path d="M-1 6h3v7h-3Z" fill="#4f8a2e"/><path d="M-5 4h4v3h-4Zm6-2h4v3H1Z" fill="#80c43d"/></>}
    {stage >= 2 && <><path d="M-2-4h4v17h-4Zm-7-2h6v7h-6Zm9-5h7v8H0Z" fill="#28592a"/><path d="M-6-1h5v5h-5Zm8-8h5v6H2Z" fill="#80c43d"/></>}
    {stage === 3 && <><path d="M-5 5h10v9H-5Z" fill={row ? '#e7b52e' : '#df5438'}/><path d="M-3 6h3v3h-3Z" fill={row ? '#fff087' : '#ff9970'}/></>}
    {stage === 3 && golden && <path className="crop-sparkle" d="M6 0h2v2H6Zm1-3h1v1H7Zm2 2h1v1H9Z" fill="#fff6c2"/>}
  </g>;
}

// Linha central do riacho, de montante (esquerda) para jusante (descendo): as correntezas seguem esse caminho
const STREAM_CENTER = 'M-2000 361H-240L-170 364L-110 369L-60 375L-15 386L25 400L48 418L50 438L38 458L24 480L10 505L-6 530L-20 556L-28 582L-26 612L-38 645L-60 690';
const CURRENTS = [{ offset: 0, dash: '14 30', speed: 2.4, width: 2 }, { offset: -5, dash: '8 40', speed: 3.1, width: 2 }, { offset: 5, dash: '20 46', speed: 2.8, width: 1 }];

/** Peixinho que pula de vez em quando, com respingo na saída e na volta para a água */
function JumpingFish({ x, y, color, delay, flip = false }: { x: number; y: number; color: string; delay: number; flip?: boolean }) {
  return <g transform={`translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}`} aria-hidden="true">
    <g className="fish-jump" style={{ animationDelay: `${delay}s` }}>
      <path d="M-6-2h9v1h2v2h-2v1h-9Z" fill={color}/><path d="M-9-3h3v6h-3Z" fill={color} opacity=".8"/>
      <path d="M-4-2h6v1h-6Z" fill="#fff6c2" opacity=".7"/><path d="M3-1h1v1H3Z" fill="#1b2a3a"/>
    </g>
    <g className="fish-splash" style={{ animationDelay: `${delay}s` }}>
      <path d="M-12 2h3v2h-3Zm-2-4h2v2h-2Zm6-2h2v2h-2Zm10 6h3v2H2Zm6-4h2v2H8Zm-4-3h2v2H4Z" fill="#d8f6ff"/>
    </g>
  </g>;
}

function Butterfly({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return <g transform={`translate(${x} ${y})`}><g className="butterfly" style={{ animationDelay: `${delay}s` }}>
    <g className="butterfly-wings"><path d="M-6-4h5v4h-5Zm7 0h5v4H1Z" fill={color}/><path d="M-5 0h4v3h-4Zm6 0h4v3H1Z" fill={color} opacity=".75"/></g>
    <path d="M-1-4h2v8h-2Z" fill="#3b2418"/>
  </g></g>;
}

/** Fazenda da Casa. A horta cresce com o progresso de hoje (0–1) e os canteiros amadurecem com o nível. */
export function WorldScenery({ dailyProgress, level }: { dailyProgress: number; level: number }) {
  // Cada uma das 15 mudas da horta precisa de 1/15 do dia cumprido para amadurecer
  const gardenStage = (index: number) => { const grown = dailyProgress * 15 - index; return grown >= 1 ? 3 : grown >= .5 ? 2 : grown > 0 ? 1 : 0; };
  const bedStage = level >= 3 ? 3 : level === 2 ? 2 : 1;
  // Ground contact determines painter order. Tree artwork ends at local y=126.
  const trees = [
    [-68,210,.82],[60,195,.84],[190,210,.82],[300,240,.80],
    [290,300,.86],[100,300,.84],[210,320,.82],
    [985,155,.82],[1105,158,.84],[1220,160,.82],
    [1130,330,.86],[1240,330,.84],
    [1010,487,.84],[1180,490,.84],[108,507,.96],
    [1120,550,.94],[1230,555,.96],
  ];
  // Small, deliberate clusters on clear grass, outside roads, beds and trunks.
  const flowers = [
    [270,363],[282,368],[292,358],[270,389],
    [425,423],[437,412],[448,417],
    [470,502],[484,510],[496,501],
    [707,482],[720,490],[733,480],
    [972,507],[983,516],[991,505],
    [352,520],[365,526],[377,517],
  ];
  const sceneObjects = [
    ...trees.map(([x,y,scale],index)=>({ id: `tree-${index}`, depth: y+126*scale, node: <Tree x={x} y={y} scale={scale} delay={-(index * 0.7) % 5}/> })),
    ...flowers.map(([x,y],index)=>({ id: `flower-${index}`, depth: y+11, node: <g transform={`translate(${x} ${y})`}><g className="flower-sway" style={{ animationDelay: `${-(index % 5) * 0.6}s` }}>
      <path d="M-3 10h9v2h-9Z" fill="#345e29" opacity=".2"/>
      <path d="M0 0h3v11h-3Zm-4 6h4v3h-4Z" fill="#34712b"/>
      <path d="M-3-4h3v-3h4v3h3v4H4v3H0V0h-3Z" fill={['#ffcf39','#fff2b0','#ee6996','#a67bed'][index%4]}/>
      <path d="M0-3h3v3H0Z" fill="#a75b24"/>
    </g></g> })),
    ...[[598,391],[622,411],[604,435],[658,456],[700,451]].map(([x,y])=>({ id: `stone-${x}`, depth: y+12, node: <path d={`M${x} ${y}h14v4h4v8h-22v-8h4Z`} fill="#a18e69" stroke="#756043" strokeWidth="2"/> })),
    ...[0,1].map(row=>({ id: `crop-bed-${row}`, depth: 468+row*43+34, node: <g key={row} transform={`translate(777 ${468+row*43})`}>
        <path d="M-4-4h166v38H-4Z" fill="#543723"/><path d="M0 0h158v28H0Z" fill="#a76532"/>
        {[0,1,2,3,4,5].map(col=><g key={col} transform={`translate(${12+col*26} 9)`}><g className="crop-sway" style={{ animationDelay: `${-(col + row * 3) * 0.4}s` }}>
          {/* key por estágio: a planta "brota" de novo quando muda de fase */}
          <BedCrop key={bedStage} stage={bedStage} row={row} golden={level >= 5}/>
        </g></g>)}
      </g> })),
    { id: "bridge", depth: 524, node: (
<g aria-label="Ponte de madeira sobre o riacho">
      <path d="M-96 517H43v8H-90v-3h-6Z" fill="#543b26" opacity=".24"/>
      <path d="M-93 516H41v11H-93Z" fill="#204c68" opacity=".3" clipPath="url(#farm-stream-clip)"/>
      <path d="M-96 484H38v36H-96Z" fill="#543222"/>
      <path d="M-93 487H35v29H-93Z" fill="#b77a3c"/>
      {Array.from({length:13},(_,i)=><g key={`bridge-plank-${i}`}>
        <path d={`M${-93+i*10} 487h8v29h-8Z`} fill={i%3===0?'#d4a05a':'#c28b47'}/>
        <path d={`M${-93+i*10} 488h2v26h-2Z`} fill="#e8b96d"/>
        <path d={`M${-89+i*10} ${i%2?501:493}v7`} stroke="#a56934" strokeWidth="1"/>
      </g>)}
      <path d="M-98 481H40v5H-98Zm0 35H40v5H-98Z" fill="#694025"/>
      <path d="M-96 481H38v2H-96Zm0 35H38v2H-96Z" fill="#e4ad5a"/>
      <path d="M-98 479h6v10h-6Zm132 0h6v10h-6Zm-132 35h6v10h-6Zm132 0h6v10h-6Z" fill="#754326"/>
      <path d="M-97 479h4v2h-4Zm132 0h4v2h-4Zm-132 35h4v2h-4Zm132 0h4v2h-4Z" fill="#edc17a"/>
      <path d="M-56 528h9v2h-9Zm61-4h8v2H5Z" fill="#b9f2ff" clipPath="url(#farm-stream-clip)"/>
    </g>
    ) },
    { id: "fence", depth: 321, node: (
<g aria-hidden="true">
      <path d="M709 319h2491v5H709Z" fill="#345e29" opacity=".24"/>
      <g fill="#efe0b6" stroke="#b8a27c" strokeWidth="2">
        <path d="M711 287h2489v6H711Zm0 18h2489v6H711Z"/>
        {Array.from({length:84},(_,i)=>714+i*30).map(x=><g key={x}>
          <path d={`M${x} 278v43h7v-43l-3-4Z`}/>
          <path d={`M${x+1} 280v39`} stroke="#fff8d8"/>
        </g>)}
      </g>
    </g>
    ) },
    { id: "house", depth: 384, node: (
<FarmHouse/>
    ) },
    { id: "garden", depth: 423, node: (
<g transform="translate(776 329)"><path d="M-5-5h170v104H-5Z" fill="#c3ac75"/><path d="M0 0h160v94H0Z" fill="#653d27"/><path d="M4 4h152v86H4Z" fill="#a96b35"/><path d="M4 4h152v86H4Z" fill="url(#soil)"/>{[0,1,2].flatMap(row=>[0,1,2,3,4].map(col=>{ const index = row*5+col; const stage = gardenStage(index); return <g key={`${row}-${col}`} transform={`translate(${18+col*30} ${17+row*29})`}><g className="crop-sway" style={{ animationDelay: `${-index * 0.3}s` }}><GardenCrop key={stage} stage={stage} fruit={['#f6aa30','#df5438','#e7b52e'][index%3]}/></g></g>; }))}</g>
    ) },
    { id: "mailbox", depth: 406, node: (
<g transform="translate(729 361)"><path d="M0 0h5v45H0Z" fill="#927453"/><path d="M-12-5h31v22h-31Z" fill="#b98662"/><path d="M-9-2h23v14H-9Z" fill="#d5ad7b"/><path d="M4 0h4v7H4Z" fill="#f0d59a"/></g>
    ) },
    { id: "garden-sign", depth: 541, node: (
<g transform="translate(690 505)"><path d="M0 0h5v36H0Zm51 0h5v36h-5Z" fill="#684c31"/><path d="M-7-8h70v26H-7Z" fill="#573e29"/><path d="M-4-5h64v20H-4Z" fill="#d8a76a"/><path d="M-2-3h59v3H-2Z" fill="#f1cd8c"/><text x="28" y="9" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#4c321f">Horta</text></g>
    ) },
    { id: "barrel", depth: 373, node: (
<g transform="translate(396 343)"><path d="M-2 0h25v30H-2Z" fill="#624429"/><path d="M1 2h19v25H1Z" fill="#b27c42"/><path d="M1 8h19v3H1Zm0 13h19v3H1Z" fill="#604c36"/><path d="M6 3v23m8-23v23" stroke="#d2a05c" strokeWidth="2"/></g>
    ) },
    { id: "player", depth: 437, node: (
<CharacterScene/>
    ) },
    { id: "flower-pot", depth: 421, node: (
<g transform="translate(353 393)"><path d="M0 5h29v23H0Z" fill="#b7855f"/><path d="M-3 3h35v6H-3Z" fill="#cb9a6d"/><path d="M5 0v-12h6v15H5Zm12 2v-20h5V2Z" fill="#66864c"/><path d="M1-15h13v8H1Zm13-9h13v10H14Z" fill="#d9b77a"/></g>
    ) },
    ...[[300,352,'#fff2b0',0],[720,462,'#ee6996',-5],[455,402,'#a67bed',-9]].map(([x,y,color,delay])=>({ id: `butterfly-${x}`, depth: 9999, node: <Butterfly x={x as number} y={y as number} color={color as string} delay={delay as number}/> })),
    { id: "bushes", depth: 570, node: (
<g><g fill="#688a3d" stroke="#496b32" strokeWidth="2"><path d="M130 546h19v-13h28v7h25v-12h35v10h20v32H130Z"/><path d="M929 548h20v-13h32v7h26v-10h25v16h17v22H929Z"/></g>
    <g fill="#9fbb54"><path d="M143 543h28v7h-28Zm63-6h27v7h-27Zm751 9h19v7h-19Zm40-8h25v7h-25Z"/></g>
    </g>) },
  ];

  return <svg viewBox="-80 -60 1360 630" preserveAspectRatio="xMidYMax meet" className="world-scenery" role="img" aria-label={`Seu pequeno sítio: casa com chaminé fumegando, árvores ao vento, borboletas e uma horta com ${Math.round(dailyProgress * 100)}% das mudas crescidas hoje`} shapeRendering="crispEdges">
    <defs><pattern id="world-grass" width="49" height="39" patternUnits="userSpaceOnUse"><path d="M11 18v-4h3v7h-8v-4h3v1Z M37 33h5v2h-5Z" fill="#438e2d" opacity=".4"/></pattern><pattern id="roof-tiles" width="22" height="13" patternUnits="userSpaceOnUse"><path d="M0 11h22M10 0v11" stroke="#953c28" strokeWidth="2"/></pattern><pattern id="soil" width="19" height="18" patternUnits="userSpaceOnUse"><path d="M3 9h8M13 3h4" stroke="#ac8158" strokeWidth="2"/></pattern></defs>
    <path d="M-2000 256h5200v1744H-2000Z" fill="#79bd38"/>
    <path d="M-2000 256h5200v1744H-2000Z" fill="url(#world-grass)"/>
    <path d="M-2000 143H-600v-18h140v25h140v-31h120v24H49v-17h65v-21h67v18h42v-13h64v-28h88v25h70v24h60v-13h82v-21h95v19h57v-13h80v-24h83v25h73v20h58v-16h72v-22h60v37h60v-17h35v-14h110v22h130v-31h140v23H3200V2000H-2000Z" fill="#65a991"/>
    <path d="M-2000 190H-650v-15h180v22h150v-29h160v22H54v-18h90v17h71v-23h75v-22h80v23h82v27h71v-19h90v-32h77v13h67v25h102v-20h76v-24h95v20h84v26h96v-16h130v25h140v-29h150v20H3200V2000H-2000Z" fill="#428955"/>
    <path d="M-2000 255h2100v-20h140v-12h180v13h164v-8h150v-8h130v16h124v-11h114v19h98H3200V2000H-2000Z" fill="#79bd38"/>
    <path d="M-2000 256h5200v1744H-2000Z" fill="url(#world-grass)"/>
    <g fill="#529c2c">{Array.from({ length: 48 }, (_, i) => { const x = (i * 197 + 19) % 1200; const y = 275 + (i * 71) % 270; return <path key={i} d={`M${x} ${y}h5v-5h3v8h5v-4h3v7h-19Z`}/>; })}</g>
    <g fill="#b4d951">{Array.from({ length: 34 }, (_, i) => <path key={i} d={`M${(i*113+48)%1200} ${265+(i*59)%280}h5v3h-5Z`}/>)}</g>
    <path d="M-2000 481h2180v-25h150v-20h193v-23h70v-68h57v113h-96v20H341v22H197v24H-2000Z M619 436h206v-12h240v22h2135v35h-2140v-21H829v16H619Z" fill="#c79a57"/>
    <path d="M-2000 484h2186v-24h150v-18h196v-23h70v-62h37v96h-91v20H337v21H191v25H-2000Z" fill="#e3bb72"/>
    <path d="M899 453h59V2000H894V519h-39v-32h44Z" fill="#d7ae68"/>
    {/* Only the stream changes: stepped meanders and short, clipped water ripples. */}
    <defs><path id="farm-stream-shape" d="M-2000 354H-240v-8h72v8h55v12h43v-6h52v10h39v13h34v17h20v25H62v25H46v24H22v24H6v24h-24v26h-16v26h10v30h18v32h-12v35h-22v35h-72v-35h15v-35h-9v-30h-14v-34h8v-29h18v-30h15v-26h21v-23h17v-23h16v-23h-8v-13h-27v-9h-37v6h-46v-9h-57v-7h-82v8H-2000Z"/>
      <clipPath id="farm-stream-clip"><use href="#farm-stream-shape"/></clipPath>
    </defs>
    <use href="#farm-stream-shape" fill="#38a9e5" stroke="#547d31" strokeWidth="18" strokeLinejoin="miter"/>
    <use href="#farm-stream-shape" fill="#38a9e5" stroke="#d1b567" strokeWidth="10" strokeLinejoin="miter"/>
    <use href="#farm-stream-shape" fill="#38a9e5" stroke="#285e8d" strokeWidth="4" strokeLinejoin="miter"/>
    <g clipPath="url(#farm-stream-clip)">
      <path d="M-2000 361H-241v-5h65v5h56v6h-64v-4h-1816Z M37 408h21v14H47v23H31v22H14v-5h10v-23h15v-19h-2Z M-55 546h7v26h11v29h-5v-25h-13Z" fill="#62c9ef"/>
      <g className="pond-ripples" fill="#b9f2ff">
        {Array.from({length:76},(_,i)=>{
          const x = -1950 + (i * 71) % 2030;
          const y = 365 + (i * 37) % 240;
          const width = 8 + (i % 4) * 4;
          return <path key={i} d={`M${x} ${y}h${width}v2h-${width}Zm${width+3} -2h4v2h-4Z`}/>;
        })}
        <path d="M-32 391h13v2h-13Zm55 24h12v2H23Zm-16 38h10v2H7Zm-41 37h14v2h-14Zm-36 49h10v2h-10Zm-10 43h13v2h-13Z"/>
      </g>
    </g>
    {/* Correntezas descendo o riacho (presas ao formato da água) */}
    <g clipPath="url(#farm-stream-clip)" fill="none" strokeLinejoin="miter">
      {CURRENTS.map((current, index) => <path key={index} className="river-current" d={STREAM_CENTER} transform={`translate(${current.offset * 0.6} ${current.offset})`}
        stroke={index === 1 ? '#e6fbff' : '#b9f2ff'} strokeWidth={current.width} strokeDasharray={current.dash}
        style={{ animationDuration: `${current.speed}s`, '--dash-cycle': `-${current.dash.split(' ').map(Number).reduce((a, b) => a + b, 0)}px` } as CSSProperties}/>)}
    </g>
    <JumpingFish x={-60} y={372} color="#f08a3c" delay={-1}/>
    <JumpingFish x={34} y={428} color="#e7e2c8" delay={-5} flip/>
    <JumpingFish x={-14} y={540} color="#f2c453" delay={-8.5}/>
    {/* A darker forest floor separates the rear woodland from the open farm. */}
    <path d="M-2000 253h2308v13h81v13H238v17H100v18H-2000Z M980 236H3200V331H1191v-13h-81v-17h-68v-20h-62Z" fill="#569630"/>
    <g fill="#ffe0a0" opacity=".65"><path d="M267 462h9v3h-9Zm146-8h7v3h-7Zm220-56h8v3h-8Zm129 48h10v3h-10Zm275-6h7v3h-7Z"/></g>
    {sceneObjects.sort((a,b)=>a.depth-b.depth).map(object=><g key={object.id} data-depth={object.depth}>{object.node}</g>)}
  </svg>;
}
