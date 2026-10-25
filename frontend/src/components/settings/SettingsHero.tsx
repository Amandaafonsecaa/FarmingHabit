import type { CSSProperties } from 'react';

/** Engrenagem com dentes quadradinhos, centrada em (0,0) */
function gearPath(teeth: number, outer: number, inner: number) {
  const step = (Math.PI * 2) / (teeth * 4);
  const points = Array.from({ length: teeth * 4 }, (_, index) => {
    const radius = index % 4 === 1 || index % 4 === 2 ? outer : inner;
    return `${(Math.cos(index * step) * radius).toFixed(1)} ${(Math.sin(index * step) * radius).toFixed(1)}`;
  });
  return `M${points.join('L')}Z`;
}

const TOOL = { stroke: '#3b2418', strokeWidth: 2 } as const;

/** Galpão de ferramentas: ferramentas balançando no painel, engrenagens girando, lampião e uma galinha curiosa */
export function SettingsHero({ playerName, farmName }: { playerName: string; farmName: string }) {
  return <section className="settings-hero" aria-labelledby="settings-title">
    <svg className="shed-scene" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="1000" height="250" fill="#9c6b3f"/>
      {Array.from({ length: 26 }, (_, i) => <g key={i} shapeRendering="crispEdges"><rect x={i * 40} width="2" height="250" fill="#6b4426"/><rect x={i * 40 + 2} width="1" height="250" fill="#b9814a"/></g>)}
      <rect y="250" width="1000" height="70" fill="#7a5233"/>{[266, 284, 302].map(y => <rect key={y} y={y} width="1000" height="2" fill="#5b3a22" shapeRendering="crispEdges"/>)}

      {/* Janelinha com raio de sol e poeirinha flutuando */}
      <g shapeRendering="crispEdges"><rect x="70" y="50" width="110" height="90" fill="#6b4426"/><rect x="80" y="60" width="90" height="70" fill="#9fd8f0"/><rect x="123" y="60" width="4" height="70" fill="#6b4426"/><rect x="80" y="93" width="90" height="4" fill="#6b4426"/></g>
      <path d="M80 130L180 130L330 260L160 260Z" fill="#fff6c2" opacity=".16"/>
      <g className="shed-dust" fill="#fff6c2">{[[180, 220], [210, 190], [240, 235], [200, 160], [260, 205], [150, 200]].map(([x, y], i) => <rect key={i} x={x} y={y} width="2" height="2" style={{ animationDelay: `${-i * 1.1}s` }}/>)}</g>

      {/* Painel de ferramentas penduradas */}
      <rect x="240" y="40" width="320" height="160" fill="#c9a46a" stroke="#6b4426" strokeWidth="4"/>
      <g fill="#8a6a45">{Array.from({ length: 60 }, (_, i) => <rect key={i} x={256 + (i % 15) * 20} y={54 + Math.floor(i / 15) * 36} width="3" height="3"/>)}</g>
      <g className="tool-sway" style={{ '--tool-delay': '0s' } as CSSProperties}>
        <rect x="288" y="56" width="5" height="120" fill="#a0673c" {...TOOL}/><path d="M276 56h30v12h-30Z" fill="#aeb6c2" {...TOOL}/>
      </g>
      <g className="tool-sway" style={{ '--tool-delay': '-1.2s' } as CSSProperties}>
        <path d="M344 92h44v34h-44Z" fill="#7cc0dc" {...TOOL}/><path d="M388 98h22l8-8v8l-8 10h-22Z" fill="#7cc0dc" {...TOOL}/><path d="M350 78h32v14h-4v-8h-24v8h-4Z" fill="#5fa8d3" {...TOOL}/><path d="M350 100h10v4h-10Z" fill="#d8f6ff"/>
      </g>
      <g className="tool-sway" style={{ '--tool-delay': '-2.1s' } as CSSProperties}>
        <rect x="448" y="56" width="5" height="110" fill="#a0673c" {...TOOL}/><path d="M453 62h22v8h-4v14h-18Z" fill="#c6ccd6" {...TOOL}/>
      </g>
      <g className="tool-sway" style={{ '--tool-delay': '-0.6s' } as CSSProperties}>
        <rect x="512" y="56" width="5" height="100" fill="#a0673c" {...TOOL}/><path d="M492 62q22-12 46 0l-4 6q-18-8-38 0Z" fill="#aeb6c2" {...TOOL}/>
      </g>

      {/* Bancada com engrenagens, caixa de ferramentas, potes de sementes e lampião */}
      <rect x="600" y="206" width="340" height="14" fill="#8a5838" stroke="#3b2418" strokeWidth="2"/><rect x="612" y="220" width="12" height="40" fill="#6b4426"/><rect x="916" y="220" width="12" height="40" fill="#6b4426"/>
      <g transform="translate(700 160)"><g className="gear-spin"><path d={gearPath(10, 40, 32)} fill="#a89a80" stroke="#57311f" strokeWidth="3"/><circle r="14" fill="#c9bfa8" stroke="#57311f" strokeWidth="3"/><circle r="5" fill="#57311f"/></g></g>
      <g transform="translate(762 128)"><g className="gear-spin is-reverse"><path d={gearPath(7, 26, 20)} fill="#e8ac59" stroke="#57311f" strokeWidth="3"/><circle r="8" fill="#f6d27a" stroke="#57311f" strokeWidth="2"/></g></g>
      <g transform="translate(790 182)"><g className="gear-spin"><path d={gearPath(6, 18, 13)} fill="#bfc6cf" stroke="#57311f" strokeWidth="2"/><circle r="5" fill="#57311f"/></g></g>
      <g shapeRendering="crispEdges">
        <rect x="830" y="178" width="70" height="28" fill="#bf5837" stroke="#3b2418" strokeWidth="2"/><rect x="852" y="170" width="26" height="8" fill="none" stroke="#3b2418" strokeWidth="3"/><rect x="830" y="188" width="70" height="3" fill="#7a2e17"/>
        {[[624, '#f2c453'], [646, '#72ad32'], [668, '#ee6996']].map(([x, color]) => <g key={x as number}><rect x={x as number} y="186" width="16" height="20" fill="#d8f0f6" opacity=".7" stroke="#3b2418" strokeWidth="1.5"/><rect x={(x as number) + 2} y="194" width="12" height="10" fill={color as string}/><rect x={(x as number) - 1} y="182" width="18" height="5" fill="#8a5838"/></g>)}
      </g>
      <g transform="translate(920 150)"><rect x="-8" y="0" width="16" height="22" fill="#3b2418"/><rect x="-6" y="3" width="12" height="16" fill="#ffd76a" className="lamp-flicker"/><rect x="-10" y="-4" width="20" height="4" fill="#2b1a10"/><path d="M-1-14h2v10h-2Z" fill="#2b1a10"/></g>

      {/* Galinha atravessando o galpão */}
      <g className="shed-chicken"><g transform="translate(0 288)" shapeRendering="crispEdges"><g className="evo-peck">
        <path d="M-8-12h14v12H-8Z" fill="#fff8ec" stroke="#3b2418" strokeWidth="1.5"/><path d="M2-19h8v8H2Z" fill="#fff8ec" stroke="#3b2418" strokeWidth="1.5"/>
        <path d="M4-22h4v3H4Z" fill="#e8576f"/><path d="M10-16h4v3h-4Z" fill="#f2a33a"/><path d="M6-16h2v2H6Z" fill="#3b2418"/><path d="M-3 0h2v5h-2Zm5 0h2v5H2Z" fill="#f2a33a"/>
      </g></g></g>
    </svg>

    <div className="settings-hero-top">
      <div className="settings-sign pixel-frame">
        <p className="eyebrow">Galpão de ferramentas</p>
        <h1 id="settings-title">Configurações</h1>
        <p className="missions-motto">Ajuste o sítio do seu jeitinho.</p>
        <p className="settings-chips"><span>🧑‍🌾 {playerName}</span><span>🌻 {farmName}</span></p>
      </div>
    </div>
  </section>;
}
