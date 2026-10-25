import { SkyLayer } from '../home/SkyLayer';

const INK = '#57311f';

function Tent() {
  return <g className="evo-building">
    <path d="M478 252l42-62 42 62Z" fill="#e8ac59" stroke={INK} strokeWidth="2" strokeLinejoin="round"/><path d="M520 190l-12 62h24Z" fill="#d18f3e"/>
    <path d="M510 252l10-24 10 24Z" fill="#7a4a26"/><path d="M519 176h2v14h-2Z" fill={INK}/><path className="lm-flag" d="M521 176h12v6h-12Z" fill="#bf5837"/>
    <g transform="translate(596 252)"><path d="M-12-3h24v3h-24Z" fill="#7a4a26"/><g className="lm-flame"><path d="M-6-16h12v13H-6Z" fill="#f2a33a"/><path d="M-3-12h6v9h-6Z" fill="#ffe38b"/></g></g>
  </g>;
}

function Cabin() {
  return <g className="evo-building">
    <path d="M466 200h108v52H466Z" fill="#a86b35" stroke={INK} strokeWidth="2"/>{[210, 222, 234, 246].map(y => <path key={y} d={`M468 ${y}h104`} stroke="#7a4a26" strokeWidth="2"/>)}
    <path d="M456 202l64-42 64 42Z" fill="#7a4a26" stroke={INK} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M510 222h20v30h-20Z" fill="#5b3826"/><path d="M482 214h16v14h-16Z" className="lm-glow" fill="#ffd76a" stroke={INK} strokeWidth="2"/>
    <path d="M550 168h10v20h-10Z" fill="#8a6a45" stroke={INK} strokeWidth="1.5"/><g className="chimney-smoke">{[0, 1].map(puff => <rect key={puff} className="smoke-puff" x="550" y="158" width="10" height="8" fill="#fff3ce" style={{ animationDelay: `${puff * 1.6}s` }}/>)}</g>
  </g>;
}

function House() {
  return <g className="evo-building">
    <path d="M450 190h140v62H450Z" fill="#d99848" stroke={INK} strokeWidth="2"/>{[204, 218, 232].map(y => <path key={y} d={`M452 ${y}h136`} stroke="#a46330" strokeWidth="2"/>)}
    <path d="M436 194V182h8v-10h8v-10h8v-10h120v10h8v10h8v10h8v12Z" fill="#bd4c2c" stroke={INK} strokeWidth="2"/>
    <path d="M462 156h116v4H462Zm-8 10h132v3H454Zm-8 10h148v3H446Z" fill="#ed8b48"/>
    <path d="M556 132h18v26h-18Z" fill="#b96f4b" stroke={INK} strokeWidth="2"/>
    <g className="chimney-smoke">{[0, 1, 2].map(puff => <rect key={puff} className="smoke-puff" x="558" y="120" width="12" height="10" fill="#fff3ce" style={{ animationDelay: `${puff * 1.4}s` }}/>)}</g>
    <path d="M508 214h24v38h-24Z" fill="#a96530" stroke={INK} strokeWidth="2"/><path d="M526 232h3v3h-3Z" fill="#ffe38a"/>
    {[466, 550].map(x => <g key={x}><path d={`M${x} 204h26v22h-26Z`} fill="#4c8eab" stroke={INK} strokeWidth="2"/><path d={`M${x + 12} 204v22M${x} 215h26`} stroke="#e9bf73" strokeWidth="2"/><path d={`M${x - 2} 226h30v6h-30Z`} fill="#ba7839"/><path d={`M${x + 2} 222h5v4h-5Zm10 0h5v4h-5Z`} fill="#f07891"/></g>)}
  </g>;
}

function Barn() {
  return <g className="evo-building">
    <path d="M660 196h90v56h-90Z" fill="#bf5837" stroke={INK} strokeWidth="2"/><path d="M650 198l20-26h70l20 26Z" fill="#7a2e17" stroke={INK} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M690 214h30v38h-30Z" fill="#fff1d6" stroke={INK} strokeWidth="2"/><path d="M692 216l26 34M718 216l-26 34" stroke="#bf5837" strokeWidth="3"/>
    <path d="M697 182h16v10h-16Z" fill="#fff1d6" stroke={INK} strokeWidth="1.5"/>
    <g stroke="#efe0b6" strokeWidth="3">{[620, 640, 760, 780].map(x => <path key={x} d={`M${x} 248v18`}/>)}<path d="M616 254h28M756 254h28"/></g>
  </g>;
}

function Chicken({ x, y, delay }: { x: number; y: number; delay: number }) {
  return <g transform={`translate(${x} ${y})`}><g className="evo-peck" style={{ animationDelay: `${delay}s` }} shapeRendering="crispEdges">
    <path d="M-6-8h10v8H-6Z" fill="#fff8ec" stroke={INK} strokeWidth="1"/><path d="M2-13h6v6H2Z" fill="#fff8ec" stroke={INK} strokeWidth="1"/>
    <path d="M4-15h3v2H4Z" fill="#e8576f"/><path d="M8-11h3v2H8Z" fill="#f2a33a"/><path d="M5-11h1v1H5Z" fill="#3b2418"/><path d="M-2 0h1v3h-1Zm3 0h1v3H1Z" fill="#f2a33a"/>
  </g></g>;
}

function DreamFarm() {
  return <>
    <g className="evo-building">
      <path d="M842 252v-66h20v66Z" fill="#e8c48a" stroke={INK} strokeWidth="2"/><path d="M838 186l14-14 14 14Z" fill="#bf5837" stroke={INK} strokeWidth="2"/>
      <g transform="translate(852 184)"><g className="lm-spin"><path d="M-2-30h4v60h-4ZM-30-2h60v4h-60Z" fill="#fff1c7" stroke={INK} strokeWidth="1.5"/><path d="M2-30h8v24H2ZM-2 30h-8V6h8ZM-30 2v8H-6V2ZM30-2v-8H6v8Z" fill="#f6e2b0" stroke={INK} strokeWidth="1.5"/></g><path d="M-3-3h6v6h-6Z" fill={INK}/></g>
    </g>
    <g className="evo-building">
      <path d="M310 218h80v34h-80Z" fill="#bfe6f3" stroke={INK} strokeWidth="2"/><path d="M306 220l14-16h60l14 16Z" fill="#d8f0f6" stroke={INK} strokeWidth="2"/>
      <path d="M330 218v34M350 218v34M370 218v34M310 234h80" stroke="#8aa8b3" strokeWidth="2"/><path d="M318 242h6v8h-6Zm40-4h6v12h-6Z" fill="#53922d"/><path d="M318 238h6v4h-6Z" fill="#ee6996"/>
    </g>
    <g transform="translate(770 286)" className="evo-building"><g className="evo-graze" shapeRendering="crispEdges">
      <path d="M-18-16h30v14h-30Z" fill="#fff8ec" stroke={INK} strokeWidth="1.5"/><path d="M-12-14h8v6h-8Zm12 4h6v6H0Z" fill="#3b2418"/>
      <path d="M12-18h10v10H12Z" fill="#fff8ec" stroke={INK} strokeWidth="1.5"/><path d="M18-12h4v3h-4Z" fill="#f2a6a6"/><path d="M14-21h2v3h-2Zm5 0h2v3h-2Z" fill="#e8c48a"/>
      <path d="M-16-2h3v6h-3Zm6 0h3v6h-3Zm12 0h3v6H2Zm6 0h3v6H8Z" fill="#fff8ec" stroke={INK} strokeWidth="1"/>
    </g></g>
  </>;
}

/** O sítio que cresce com o nível: barraca → cabana → casinha → celeiro com galinhas → fazenda dos sonhos */
export function FarmEvolution({ stage }: { stage: number }) {
  return <>
    <SkyLayer/>
    <svg className="evo-scene" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 214q120-40 260-14t260-6 260 4 220-8V320H0Z" fill="#65a991"/>
      <path d="M0 236q160-26 320-6t340-4 340 2V320H0Z" fill="#79bd38"/>
      <g fill="#529c2c">{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${(i * 137) % 1000} ${262 + (i * 29) % 50}h5v-5h3v8h5v-4h3v7h-19Z`}/>)}</g>
      <path d="M520 252q-20 30-90 68h60q40-40 40-68Z" fill="#e3bb72" opacity=".9"/>
      {/* key por fase: as construções novas aparecem com um "pop" */}
      <g key={stage} shapeRendering="crispEdges">
        {stage === 0 && <Tent/>}
        {stage === 1 && <Cabin/>}
        {stage >= 2 && <House/>}
        {stage >= 3 && <><Barn/><Chicken x={612} y={286} delay={0}/><Chicken x={642} y={296} delay={-0.7}/><Chicken x={680} y={284} delay={-1.3}/></>}
        {stage >= 4 && <DreamFarm/>}
      </g>
      <g className="butterfly-wrap" transform="translate(400 220)"><g className="butterfly"><g className="butterfly-wings"><path d="M-6-4h5v4h-5Zm7 0h5v4H1Z" fill="#fff2b0"/></g><path d="M-1-4h2v7h-2Z" fill="#3b2418"/></g></g>
    </svg>
  </>;
}
