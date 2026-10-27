import { SkyLayer } from '../home/SkyLayer';
import { SeasonParticles } from '../home/SeasonParticles';
import { Tree } from '../WorldScenery';

// Florzinhas do gramado: posição e cor (terracota, ouro e pergaminho da paleta)
const FLOWERS: [number, number, string][] = [
  [60, 236, '#b96845'], [140, 262, '#e7b84b'], [250, 228, '#fff1c7'], [330, 270, '#b96845'], [470, 248, '#e7b84b'],
  [720, 256, '#fff1c7'], [800, 232, '#b96845'], [905, 268, '#e7b84b'], [1010, 240, '#fff1c7'], [1130, 258, '#b96845'],
];
const TUFTS = [30, 110, 205, 290, 380, 520, 690, 760, 860, 950, 1060, 1170];
const FENCE_POSTS = Array.from({ length: 22 }, (_, index) => index * 60 - 40).filter(x => x < 540 || x > 650);

/**
 * Cenário da entrada: céu com nuvens e passarinhos, morros, árvores balançando, cerca e a porteira do sítio.
 * As camadas se deslocam um pouco com o mouse (variável --px, a mesma do céu da Casa) para dar profundidade.
 */
export function AuthScene() {
  return <div className="auth-backdrop" aria-hidden="true">
    <SkyLayer/>
    <svg className="auth-landscape" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges">
      {/* Morros ao longe, em degraus de pixel */}
      <g className="auth-layer-far">
        <path d="M-40 150h120v-16h70v-14h90v12h60v16h90v-20h110v-12h120v14h70v16h90v-18h120v-10h110v14h90v18h140V230H-40Z" fill="#6d9b45" opacity=".55"/>
        <path d="M-40 176h160v-12h140v10h110v-14h150v12h120v-10h130v14h120v-12h150v12h200V240H-40Z" fill="#3f6b35" opacity=".45"/>
      </g>

      {/* Gramado */}
      <path d="M0 200h1200v100H0Z" fill="#6d9b45"/>
      <path d="M0 200h1200v3H0Z" fill="#fff1c7" opacity=".25"/>

      <g className="auth-layer-mid">
        <Tree x={10} y={66} scale={1.1}/>
        <Tree x={190} y={104} scale={0.8} delay={-1.2}/>
        <Tree x={430} y={117} scale={0.7} delay={-2}/>
        <Tree x={960} y={54} scale={1.2} delay={-0.6}/>
        <Tree x={1090} y={92} scale={0.9} delay={-1.8}/>

        {/* Cerca de madeira, aberta na porteira */}
        <path d="M-40 178h590v4H-40Zm0 14h590v4H-40Zm690-14h590v4H650Zm0 14h590v4H650Z" fill="#8a5838"/>
        {FENCE_POSTS.map(x => <g key={x}><path d={`M${x} 170h8v36h-8Z`} fill="#8a5838"/><path d={`M${x} 170h8v2h-8Z`} fill="#d9a05a"/><path d={`M${x + 6} 172h2v34h-2Z`} fill="#5b3826"/></g>)}

        {/* Trilha de terra saindo da porteira */}
        <path d="M584 200h32v20h8v20h8v20h8v20h8v20H544v-20h8v-20h8v-20h8v-20h8Z" fill="#d2ac71"/>
        <path d="M596 206h8v8h-8Zm-8 30h6v6h-6Zm20 22h8v6h-8Zm-24 26h8v6h-8Z" fill="#f6dfa6"/>

        {/* Porteira com a plaquinha do sítio */}
        <path d="M556 150h12v56h-12Zm76 0h12v56h-12Z" fill="#8a5838"/>
        <path d="M564 150h4v56h-4Zm76 0h4v56h-4Z" fill="#5b3826"/>
        <path d="M548 142h104v10H548Z" fill="#5b3826"/><path d="M548 142h104v2H548Z" fill="#b07a4c"/>
        <path d="M586 152h2v6h-2Zm26 0h2v6h-2Z" fill="#3b2418"/>
        <path d="M576 156h48v20h-48Z" fill="#3b2418"/><path d="M578 158h44v16h-44Z" fill="#f6dfa6"/>
        <path d="M596 162h4v8h-4Zm-4-2h4v4h-4Zm8 2h4v4h-4Z" fill="#6d9b45"/>

        {/* Moitas ao pé da cerca */}
        <path d="M480 196h28v-8h12v8h8v10h-48Zm212 0h20v-6h14v6h10v10h-44Z" fill="#3f6b35"/>
      </g>

      {/* Tufos e flores na frente */}
      {TUFTS.map(x => <path key={x} d={`M${x} 220h2v-6h2v6h2v-4h2v6h-8Z`} fill="#3f6b35"/>)}
      {FLOWERS.map(([x, y, color]) => <g key={x}><path d={`M${x + 2} ${y + 4}h2v6h-2Z`} fill="#3f6b35"/><path d={`M${x} ${y}h6v4h-6Z`} fill={color}/><path d={`M${x + 2} ${y + 1}h2v2h-2Z`} fill="#e7b84b"/></g>)}
    </svg>
    <SeasonParticles season="autumn"/>
  </div>;
}
