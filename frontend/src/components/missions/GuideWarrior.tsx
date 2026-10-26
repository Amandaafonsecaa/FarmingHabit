// Paleta do guerreiro: bronze grego, crista e capa vermelhas
const BRONZE = '#c98b2e';
const BRONZE_LIGHT = '#e8b450';
const BRONZE_DARK = '#8a5a1c';
const RED = '#b83a2c';
const RED_DARK = '#7f2519';
const SKIN = '#d9a066';
const BEARD = '#6b4426';
const LEATHER = '#8a5838';
const LEATHER_DARK = '#5b3826';

/**
 * Capitão Bússola: guerreiro grego de armadura, à moda da Odisseia (elmo coríntio com crista,
 * couraça de bronze, escudo redondo e lança). Mesma grade 80×88 da PixelAvatar, então cabe nos mesmos lugares.
 */
export function GuideWarrior({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 80 88" className={className} shapeRendering="crispEdges" role="img" aria-label="Capitão Bússola">
    <ellipse cx="40" cy="82" rx="26" ry="5" fill="#3b2418" opacity=".2"/>

    {/* Capa atrás do corpo */}
    <path d="M21 42h38v34h-4v-3h-4v3H29v-3h-4v3h-4Z" fill={RED_DARK}/>

    {/* Lança: haste e ponta */}
    <path d="M64 8h3v74h-3Z" fill="#7a4a26"/><path d="M65 8h1v74h-1Z" fill="#9a6538"/>
    <path d="M64 0h3v2h2v5h-2v2h-3V7h-2V2h2Z" fill="#c6ccd6"/><path d="M65 1h1v6h-1Z" fill="#eef1f4"/>

    {/* Pernas: joelhos, caneleiras de bronze e sandálias */}
    <path d="M27 62h9v4h-9Zm17 0h9v4h-9Z" fill={SKIN}/>
    <path d="M27 66h9v12h-9Zm17 0h9v12h-9Z" fill={BRONZE}/><path d="M28 67h2v10h-2Zm17 0h2v10h-2Z" fill={BRONZE_LIGHT}/>
    <path d="M25 78h12v4H25Zm18 0h12v4H43Z" fill={LEATHER_DARK}/>

    {/* Saiote de tiras de couro */}
    <path d="M24 55h32v9H24Z" fill={LEATHER}/>
    <path d="M28 57h2v7h-2Zm6 0h2v7h-2Zm6 0h2v7h-2Zm6 0h2v7h-2Zm6 0h2v7h-2Z" fill={LEATHER_DARK}/>

    {/* Couraça de bronze com os "músculos" marcados e cinto */}
    <path d="M24 40h32v16H24Z" fill={BRONZE}/>
    <path d="M28 43h9v2h-9Zm15 0h9v2h-9Z M28 48h8v1h-8Zm16 0h8v1h-8Z" fill={BRONZE_LIGHT}/>
    <path d="M39 44h2v10h-2Z" fill={BRONZE_DARK}/><path d="M24 54h32v3H24Z" fill={BRONZE_DARK}/><path d="M38 54h4v3h-4Z" fill={BRONZE_LIGHT}/>

    {/* Braço da lança com ombreira */}
    <path d="M55 45h7v11h-7Z" fill={SKIN}/><path d="M53 40h9v6h-9Z" fill={BRONZE_DARK}/><path d="M54 41h7v2h-7Z" fill={BRONZE}/>
    <path d="M61 48h7v6h-7Z" fill={SKIN}/>

    {/* Escudo redondo (aspis): aro de bronze, campo azul e sol dourado */}
    <path d="M14 41h12v2h4v2h2v3h2v16h-2v3h-2v2h-4v2H14v-2h-4v-2H8v-3H6V48h2v-3h2v-2h4Z" fill={BRONZE_DARK}/>
    <path d="M14 43h12v2h3v3h2v16h-2v3h-3v2H14v-2h-3v-3H9V48h2v-3h3Z" fill={BRONZE}/>
    <path d="M15 46h10v2h3v15h-3v2H15v-2h-3V48h3Z" fill="#2c4a7a"/>
    <path d="M19 49h2v3h-2Zm0 8h2v3h-2Zm-5-3h3v2h-3Zm9 0h3v2h-3Z M18 52h4v5h-4Z" fill={BRONZE_LIGHT}/>
    <path d="M15 44h6v1h-6Z" fill={BRONZE_LIGHT}/>

    {/* Pescoço, rosto e barba de quem já atravessou muitos mares */}
    <path d="M35 38h10v3H35Z" fill={SKIN}/>
    <path d="M31 23h18v14H31Z" fill={SKIN}/>
    <path d="M34 28h3v3h-3Zm9 0h3v3h-3Z" fill="#3b2418"/>
    <path d="M31 33h18v8h-2v2H33v-2h-2Z" fill={BEARD}/><path d="M37 35h6v2h-6Z" fill="#8c4a3a"/>

    {/* Elmo coríntio: cúpula, protetores de bochecha e de nariz */}
    <path d="M28 12h24v11H28Z" fill={BRONZE}/>
    <path d="M27 22h5v14h-5Zm21 0h5v14h-5Z" fill={BRONZE}/><path d="M39 23h2v7h-2Z" fill={BRONZE}/>
    <path d="M27 22h26v2H27Z" fill={BRONZE_DARK}/><path d="M30 14h8v2h-8Z" fill={BRONZE_LIGHT}/><path d="M28 24h2v10h-2Z" fill={BRONZE_LIGHT}/>
    <path d="M51 13h1v9h-1Zm0 14h2v9h-2Z" fill={BRONZE_DARK}/>

    {/* Crista de crina vermelha */}
    <path d="M36 9h8v3h-8Z" fill={BRONZE_DARK}/>
    <path d="M24 3h32v7H24Z M20 6h4v7h-4Z" fill={RED}/><path d="M26 3h28v2H26Z" fill="#e0594a"/><path d="M24 9h32v1H24Z" fill={RED_DARK}/>
  </svg>;
}
