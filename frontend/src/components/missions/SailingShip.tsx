import { GuideWarrior } from './GuideWarrior';

// Paleta: madeira e velas dos tokens do jogo, mar nos tons do riacho da Casa
const WOOD = '#8a5838';
const WOOD_DARK = '#5b3826';
const WOOD_DEEP = '#3b2418';
const WOOD_LIGHT = '#c48a55';
const SAIL = '#f6dfa6';
const SAIL_LIGHT = '#fff1c7';
const SAIL_SEAM = '#d2ac71';
const BRASS = '#c98b2e';
const FLAG = '#b96845';
const SEA = '#38a9e5';
const SEA_DEEP = '#285e8d';
const SEA_MID = '#2f86c4';
const FOAM = '#b9f2ff';

// Capitão de pé no convés (grade do navio 360×300): da altura de uma pessoa ao lado da amurada
const CAPTAIN = { x: 236, y: 106, width: 50, height: 55 };
// Escotilhas pequenas no casco, só de enfeite
const PORTHOLES = [120, 176, 232, 288];

/** Crista de onda em degraus, repetida a cada 60px: o padrão desliza de lado em loop */
function WaveCrests({ y, color, foam }: { y: number; color: string; foam: string }) {
  return <>
    <pattern id={`wave-${y}`} x="0" y={y} width="60" height="16" patternUnits="userSpaceOnUse">
      <rect x="0" y="8" width="60" height="8" fill={color}/>
      <rect x="6" y="4" width="24" height="4" fill={color}/>
      <rect x="12" y="0" width="12" height="4" fill={color}/>
      <rect x="12" y="0" width="8" height="2" fill={foam}/>
      <rect x="6" y="4" width="6" height="2" fill={foam}/>
    </pattern>
  </>;
}

/** Céu, horizonte e o mar de trás (ficam parados; só as nuvens andam) */
function SeaBack() {
  return <svg className="sea-back" viewBox="0 0 1350 430" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="1350" height="430" fill="#a9cccd"/>
    <rect width="1350" height="120" fill="#bfe0dc"/>
    <g className="sea-clouds" fill="#fff8d8">
      <rect x="140" y="60" width="96" height="16"/><rect x="164" y="44" width="48" height="16"/>
      <rect x="980" y="84" width="120" height="16"/><rect x="1012" y="68" width="56" height="16"/>
      <rect x="620" y="36" width="64" height="12"/>
    </g>
    <rect y="262" width="1350" height="168" fill={SEA_DEEP}/>
    <rect y="262" width="1350" height="4" fill={FOAM} opacity=".55"/>
    <rect y="290" width="1350" height="140" fill={SEA_MID}/>
  </svg>;
}

/** Ondas da frente: passam por cima do casco e escondem a linha d'água */
function SeaFront() {
  return <svg className="sea-front" viewBox="0 0 1350 90" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
    <defs><WaveCrests y={0} color={SEA} foam={FOAM}/></defs>
    <g className="sea-front-roll">
      <rect x="-60" y="0" width="1470" height="16" fill="url(#wave-0)"/>
      <rect x="-60" y="16" width="1470" height="74" fill={SEA}/>
      <g fill={FOAM} opacity=".7">
        <rect x="40" y="36" width="24" height="4"/><rect x="310" y="52" width="32" height="4"/>
        <rect x="760" y="40" width="20" height="4"/><rect x="1120" y="58" width="28" height="4"/>
      </g>
    </g>
  </svg>;
}

/** O navio de lado (proa para a direita), com o Capitão na escotilha */
function Ship() {
  return <svg className="ship-art" viewBox="0 0 360 300" shapeRendering="crispEdges" aria-hidden="true">
    <defs>
    </defs>

    {/* Cordame: do topo do mastro para a proa e para a popa */}
    <g stroke={WOOD_DARK} strokeWidth="2">
      <line x1="176" y1="18" x2="336" y2="160"/>
      <line x1="176" y1="18" x2="34" y2="140"/>
      <line x1="176" y1="40" x2="92" y2="148"/>
    </g>

    {/* Mastro e bandeirinha */}
    <rect x="172" y="12" width="8" height="160" fill={WOOD}/>
    <rect x="178" y="12" width="2" height="160" fill={WOOD_DARK}/>
    <g className="lm-flag"><rect x="180" y="10" width="22" height="10" fill={FLAG}/><rect x="180" y="18" width="22" height="2" fill="#7f2519"/></g>

    {/* Vela de cima e vela grande, estufadas pelo vento */}
    <path d="M132 28h88v4h4v16h-4v4h-88z" fill={SAIL}/>
    <path d="M110 58h136v6h8v12h6v40h-6v12h-8v6h-136z" fill={SAIL}/>
    <path d="M110 58h20v80h-20z" fill={SAIL_LIGHT}/>
    <g fill={SAIL_SEAM}>
      <rect x="110" y="84" width="150" height="2"/><rect x="110" y="110" width="150" height="2"/>
      <rect x="132" y="38" width="92" height="2"/>
    </g>
    <rect x="104" y="54" width="148" height="4" fill={WOOD_DARK}/>
    <rect x="126" y="24" width="100" height="4" fill={WOOD_DARK}/>

    {/* Castelo da popa */}
    <path d="M20 132h66v40h-66z" fill={WOOD}/>
    <rect x="20" y="132" width="66" height="4" fill={WOOD_LIGHT}/>
    <rect x="34" y="146" width="12" height="10" fill="#f3d27d"/>
    <rect x="58" y="146" width="12" height="10" fill="#f3d27d"/>

    {/* Casco: degraus no fundo, proa levantada */}
    <path d="M20 168H336V160H350V178H344V196H336V214H326V230H314V246H300V262H70V246H56V230H44V214H34V196H26V178H20Z" fill={WOOD}/>
    <g fill="#6b4226">
      <rect x="28" y="186" width="312" height="2"/><rect x="36" y="204" width="296" height="2"/>
      <rect x="46" y="222" width="276" height="2"/><rect x="58" y="240" width="252" height="2"/>
    </g>
    <rect x="70" y="254" width="230" height="8" fill={WOOD_DARK}/>

    {/* Capitão no convés, atrás da amurada */}
    <g className="captain-figure"><svg x={CAPTAIN.x} y={CAPTAIN.y} width={CAPTAIN.width} height={CAPTAIN.height} viewBox="0 0 80 88"><GuideWarrior/></svg></g>

    {/* Amurada com balaústres */}
    <rect x="20" y="160" width="330" height="4" fill={WOOD_LIGHT}/>
    <rect x="20" y="164" width="330" height="4" fill={WOOD_DARK}/>
    <g fill={WOOD_DARK}>{Array.from({ length: 14 }, (_, index) => <rect key={index} x={96 + index * 18} y="148" width="4" height="12"/>)}</g>
    <rect x="92" y="146" width="258" height="4" fill={WOOD_LIGHT}/>

    {/* Escotilhas de latão no casco */}
    {PORTHOLES.map(x => <g key={x}>
      <circle cx={x} cy="198" r="9" fill={BRASS}/>
      <circle cx={x} cy="198" r="6" fill={WOOD_DEEP}/>
      <rect x={x - 3} y="194" width="2" height="2" fill="#fff" opacity=".4"/>
    </g>)}
  </svg>;
}

/** Respingo pixelado que sobe na proa quando ela bate na onda */
function BowSplash() {
  return <svg className="bow-splash" viewBox="0 0 80 60" shapeRendering="crispEdges" aria-hidden="true">
    <g fill={FOAM}>
      <rect x="30" y="36" width="8" height="8"/><rect x="42" y="28" width="8" height="8"/><rect x="54" y="40" width="6" height="6"/>
      <rect x="22" y="22" width="6" height="6"/><rect x="48" y="12" width="6" height="6"/><rect x="36" y="4" width="4" height="4"/>
    </g>
    <g fill="#fff"><rect x="44" y="30" width="4" height="4"/><rect x="32" y="38" width="4" height="4"/></g>
  </svg>;
}

/**
 * Topo das Missões: navio de lado num mar com ondas. As ondas batem no casco, o navio arfa para frente e
 * para trás e a proa levanta respingo. O Capitão fica de pé no convés; clicar nele abre a conversa.
 */
export function SailingShip({ onTalk }: { onTalk: () => void }) {
  return <div className="sailing-scene">
    <SeaBack/>
    <div className="ship-rig">
      <Ship/>
      <BowSplash/>
      <button type="button" className="ship-captain" style={{ left: `${CAPTAIN.x / 360 * 100}%`, top: `${CAPTAIN.y / 300 * 100}%`, width: `${CAPTAIN.width / 360 * 100}%`, height: `${(160 - CAPTAIN.y) / 300 * 100}%` }}
        onClick={onTalk} aria-label="Conversar com o Capitão"/>
    </div>
    <SeaFront/>
  </div>;
}
