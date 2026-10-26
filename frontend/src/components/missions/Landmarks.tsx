import type { ReactNode } from 'react';
import type { LandmarkId } from '../../lib/journey';

// Cada marco é desenhado com o chão em y=0 e cerca de 50 de altura, em estilo pixel (crispEdges)
const INK = '#57311f';
const s = { stroke: INK, strokeWidth: 1.5 } as const;

export const GLYPHS: Record<LandmarkId, ReactNode> = {
  // --- Vale do Sítio ---
  windmill: <>
    <path d="M-8-30h16V0H-8Z" fill="#e8c48a" {...s}/><path d="M-3-10h6V0h-6Z" fill="#8a5838"/><path d="M-11-30h22l-4-6h-14Z" fill="#bf5837" {...s}/>
    <g className="lm-spin"><path d="M-1-52h2v34h-2ZM-18-36h34v2h-34Z" fill="#fff1c7" {...s}/><path d="M1-52h5v14H1ZM-1-18h-5v-14h5ZM-18-34v-5h14v5ZM18-36v5H4v-5Z" fill="#f6e2b0" {...s}/></g>
    <path d="M-2-37h4v4h-4Z" fill={INK}/>
  </>,
  well: <>
    <path d="M-13-14h26V0h-26Z" fill="#a89a80" {...s}/><path d="M-13-9h26M-4-14v5M5-9v9" stroke="#7d705c" strokeWidth="1.5"/>
    <path d="M-12-36h3v22h-3Zm21 0h3v22H9Z" fill="#7a4a26"/><path d="M-17-40h34v5h-34Z" fill="#bf5837" {...s}/><path d="M-9-27h18" stroke={INK} strokeWidth="1.5"/>
    <g className="lm-bob"><path d="M-3-24h6v5h-6Z" fill="#b07a4c" {...s}/></g><path d="M-10-14h20v2h-20Z" fill="#7cc0dc"/>
  </>,
  bridge: <>
    <path d="M-26 0h52v5h-52Z" fill="#7cc0dc"/><path d="M-26 2h10M2 3h12" stroke="#d8f6ff" strokeWidth="1.5"/>
    <path d="M-22-8q22-12 44 0v4q-22-10-44 0Z" fill="#b07a4c" {...s}/><path d="M-22-18v12M22-18v12M-22-18q22-10 44 0" fill="none" stroke={INK} strokeWidth="2"/>
  </>,
  scarecrow: <>
    <path d="M-1-30h2V0h-2Z" fill="#7a4a26"/><path d="M-15-24h30v2h-30Z" fill="#7a4a26"/><path d="M-7-28h14v12H-7Z" fill="#bf5837" {...s}/><path d="M-3-22h2v2h-2Zm4 3h2v2H1Z" fill="#f2c453"/>
    <path d="M-5-37h10v9H-5Z" fill="#e8c48a" {...s}/><path d="M-3-34h2v2h-2Zm4 0h2v2H1Zm-3 3h4v1h-4Z" fill={INK}/><path d="M-9-39h18v2H-9Zm4-5h10v5H-5Z" fill="#8a5838" {...s}/>
    <g className="lm-hop"><path d="M11-29h6v3h-6Zm5-2h3v2h-3Z" fill="#3b2418"/><path d="M19-30h2v1h-2Z" fill="#f2a33a"/></g>
  </>,
  portal: <>
    <path d="M-24-34h11V0h-11ZM13-34h11V0H13Z" fill="#6b4426" {...s}/><path d="M-28-48h56v16h-56Z" fill="#3f7a2e" {...s}/><path d="M-22-46h14v4h-14Zm24 0h14v4H2Z" fill="#72ad32"/>
    <path d="M-13-32h26V0h-26Z" fill="#23401f"/>
    <g className="lm-firefly"><path d="M-6-20h2v2h-2Zm8-6h2v2H2Zm3 12h2v2H5Z" fill="#ffe38b"/></g>
  </>,
  // --- Floresta Sussurrante ---
  mushroom: <>
    <path d="M-5-20h10V0H-5Z" fill="#f6e2b0" {...s}/><path d="M-19-34h38v6h-4v6h-30v-6h-4Z" fill="#bf5837" {...s}/><path d="M-12-31h4v4h-4Zm10-2h4v4h-4Zm9 2h4v4H7Z" fill="#fff1c7"/>
    <path d="M11-8h4V0h-4Z" fill="#f6e2b0"/><path d="M8-12h10v4H8Z" fill="#e8ac59" {...s}/>
  </>,
  lake: <>
    <path d="M-24-6h6v-4h36v4h6v6h-48Z" fill="#4f8fb0" {...s}/><path d="M-14-6h10M4-4h8" stroke="#a9dcef" strokeWidth="1.5"/>
    <g className="lm-firefly"><path d="M-14-22h2v2h-2Zm10-8h2v2h-2Zm12 4h2v2H8Zm8-12h2v2h-2Z" fill="#ffe38b"/></g>
    <g className="lm-firefly is-late"><path d="M-20-32h2v2h-2Zm16 6h2v2h-2Zm18 6h2v2h-2Z" fill="#fff6c2"/></g>
  </>,
  elder: <>
    <path d="M-9-30h18V0H-9Z" fill="#6b4426" {...s}/><path d="M-14 0h6v-4h-6Zm22 0h6v-4H8Z" fill="#6b4426"/>
    <g className="lm-blink"><path d="M-6-22h4v3h-4Zm8 0h4v3H2Z" fill="#3b2418"/></g><path d="M-3-14h6v2h-6Z" fill="#3b2418"/>
    <path d="M-24-54h48v24h-48Z" fill="#2f6a2c" {...s}/><path d="M-18-52h16v6h-16Zm20 4h14v5H2Z" fill="#4f9a35"/>
  </>,
  cabin: <>
    <path d="M-14-22h28V0h-28Z" fill="#8a6a45" {...s}/><path d="M-19-22h38v-4h-4v-4h-4v-4h-22v4h-4v4h-4Z" fill="#6d4a8a" {...s}/>
    <path d="M-10-16h8v6h-8Z" className="lm-glow" fill="#ffd76a" {...s}/><path d="M4-14h6V0H4Z" fill="#5b3826"/>
    <path d="M8-38h5v6H8Z" fill="#7a5a44" {...s}/><g className="lm-smoke"><path d="M8-44h5v4H8Z" fill="#e9e1f5"/></g>
  </>,
  trailsign: <>
    <path d="M-2-30h3V0h-3Z" fill="#7a4a26"/><path d="M-15-30h24l5 5-5 5h-24Z" fill="#d9a05a" {...s}/><path d="M-11-26h14" stroke={INK} strokeWidth="1.5"/>
    <path d="M-10-16h-6l-3 4 3 4h6Z" fill="#e8c48a" {...s}/><path d="M-6 0h12v-4H-6Z" fill="#53922d"/>
  </>,
  // --- Montanhas Nevadas ---
  camp: <>
    <path d="M-18 0l16-26L14 0Z" fill="#e8ac59" {...s} strokeLinejoin="round"/><path d="M-6 0l4-10 4 10Z" fill="#7a4a26"/>
    <path d="M14-3h10v3H14Z" fill="#8a5838"/><g className="lm-flame"><path d="M16-12h6v9h-6Z" fill="#f2a33a"/><path d="M18-9h2v6h-2Z" fill="#ffe38b"/></g>
  </>,
  crystals: <>
    <path d="M-24 0v-20h8v-8h30v8h10V0Z" fill="#8d8aa0" {...s}/><path d="M-8 0v-14h16V0Z" fill="#2b2438"/>
    <g className="lm-sparkle"><path d="M-20-26h4v8h-4Zm32-4h4v10h-4ZM-4-8h3v6h-3Z" fill="#9fe3f2" {...s}/></g>
  </>,
  ropebridge: <>
    <path d="M-28-6q28 14 56 0" fill="none" stroke={INK} strokeWidth="2"/><path d="M-28-18q28 14 56 0" fill="none" stroke={INK} strokeWidth="1.5"/>
    {[-22, -14, -6, 2, 10, 18].map(x => <path key={x} d={`M${x} ${-4 + Math.abs(x) * -0.18 + 6}h5v3h-5Z`} fill="#b07a4c" {...s}/>)}
    <path d="M-30-22h4V0h-4Zm56 0h4V0h-4Z" fill="#7a4a26"/>
  </>,
  yeti: <>
    <path d="M-11-28h22V0h-22Z" fill="#f4f7ff" stroke="#8fa3c0" strokeWidth="1.5"/><path d="M-7-24h14v9H-7Z" fill="#bcd0ea"/>
    <path d="M-4-21h2v2h-2Zm6 0h2v2H2Z" fill="#3b2418"/><path d="M-2-17h4v1h-4Z" fill="#f2998a"/>
    <g className="lm-wave"><path d="M11-26h4v-8h4v12h-8Z" fill="#f4f7ff" stroke="#8fa3c0" strokeWidth="1.5"/></g><path d="M-15-22h4v12h-4Z" fill="#f4f7ff" stroke="#8fa3c0" strokeWidth="1.5"/>
  </>,
  lookout: <>
    <path d="M-16-6h32V0h-32Z" fill="#a89a80" {...s}/><path d="M-2-22h4v16h-4Z" fill="#7a4a26"/><path d="M-6-28h16v6H-6Z" fill="#c6a46a" {...s}/><path d="M10-27h4v4h-4Z" fill="#9fe3f2"/>
    <g opacity=".7"><path d="M14-46h20v12H14Zm-2-6h4v6h-4Zm20 0h4v6h-4Zm-10 2h4v4h-4Z" fill="#8d7aa8"/></g>
  </>,
  // --- Castelo do Dragão Sonolento ---
  gate: <>
    <path d="M-24-30h48V0h-48Z" fill="#9c8f9e" {...s}/><path d="M-24-36h8v6h-8Zm12 0h8v6h-8Zm12 0h8v6H0Zm12 0h8v6h-8Z" fill="#9c8f9e" {...s}/>
    <path d="M-9 0v-16h4v-4h10v4h4V0Z" fill="#2b2438"/><path d="M-6-16v16M0-20v20M6-16v16M-9-8h18" stroke="#6d6470" strokeWidth="1.5"/>
    <path d="M-23-48h2v12h-2Z" fill={INK}/><path className="lm-flag" d="M-21-48h10v6h-10Z" fill="#bf5837"/>
  </>,
  armor: <>
    <path d="M-5-36h10v9H-5Z" fill="#c6ccd6" {...s}/><path d="M-3-33h6v2h-6Z" fill="#3b2418"/><path d="M-8-27h16v15H-8Z" fill="#aeb6c2" {...s}/>
    <path d="M-6-12h5V0h-5Zm7 0h5V0H1Z" fill="#c6ccd6" {...s}/><path d="M12-38h2v34h-2Z" fill="#dfe4ea" {...s}/><path d="M9-8h8v2H9Z" fill="#a86d1c"/>
    <path d="M-22-40h10v20l-5-4-5 4Z" fill="#bf5837" {...s}/><path d="M-19-36h4v4h-4Z" fill="#f2c453"/>
  </>,
  dragon: <>
    <path d="M-26-14h38v14h-38Z" fill="#6aa84f" {...s}/><path d="M-20-18h4v4h-4Zm8-2h4v6h-4Zm8 2h4v4h-4Z" fill="#3f7a2e"/>
    <path d="M12-20h14v12H12Z" fill="#6aa84f" {...s}/><path d="M16-16h6v1h-6Z" fill="#3b2418"/><path d="M-26-6h-6v-4h6Z" fill="#6aa84f" {...s}/>
    <path d="M-16-4h20v4h-20Z" fill="#c9e39a"/>
    <g className="lm-zzz"><text x="26" y="-26">z</text><text x="32" y="-36" fontSize="12">Z</text></g>
    <g className="lm-smoke"><path d="M27-12h4v3h-4Z" fill="#e9e9e9"/></g>
  </>,
  tower: <>
    <path d="M-11-50h22V0h-22Z" fill="#a597b5" {...s}/><path d="M-13-56h26v6h-26Z" fill="#8d7aa8" {...s}/><path d="M-11-62h6v6h-6Zm8 0h6v6h-6Zm8 0h6v6H5Z" fill="#8d7aa8"/>
    <path d="M-7-8h6v2h-6Zm4-6h6v2h-6Zm4-6h6v2H1Zm-4-6h6v2h-6Zm-4-6h6v2h-6Z" fill="#6d6470"/><path d="M-3-46h6v8h-6Z" className="lm-glow" fill="#ffd76a" {...s}/>
  </>,
  princess: <>
    <path d="M-20-20h40v4h-40Z" fill="#a597b5" {...s}/><path d="M-18-16h4V0h-4Zm32 0h4V0h-4Z" fill="#a597b5"/>
    <path d="M-7-20l7-18 7 18Z" fill="#f29ac0" {...s} strokeLinejoin="round"/><path d="M-4-44h8v7h-8Z" fill="#f6cba5" {...s}/>
    <path d="M-5-46h10v3H-5Zm-1 3h2v8h-2Zm10 0h2v8H4Z" fill="#e8b04b"/><path d="M-4-49h2v3h-2Zm3-1h2v4h-2Zm3 1h2v3H2Z" fill="#f2c453"/>
    <g className="lm-wave"><path d="M6-34h3v-8h3v10H6Z" fill="#f6cba5" {...s}/></g>
    <g className="lm-hearts"><path d="M14-48h2v1h1v-1h2v3h-1v1h-1v1h-1v-1h-1v-1h-1Z" fill="#e8576f"/><path d="M-18-40h2v1h1v-1h2v3h-1v1h-1v1h-1v-1h-1v-1h-1Z" fill="#f29ac0"/></g>
  </>,
};
