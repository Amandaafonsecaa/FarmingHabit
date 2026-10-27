/** Pote de mel em pixel (7 × 9), usado na prateleira e na cabeça do ratinho */
function HoneyJar() {
  return <>
    <path d="M0 0h7v2H0Z" fill="#b96845"/>
    <path d="M0 2h7v7H0Z" fill="#e7b84b"/>
    <path d="M1 3h1v5H1Z" fill="#ffe38b"/>
    <path d="M2 5h4v2H2Z" fill="#fff1c7"/>
  </>;
}

/**
 * Carregando a vitrine: um ratinho leva um pote de mel equilibrado na cabeça de um lado da prateleira
 * para o outro e depois de volta, sem parar. Com movimento reduzido fica só a prateleira arrumada.
 */
export function ShelfLoading() {
  return <div className="quest-board-note shelf-loading" role="status">
    <svg className="shelf-loading-art" viewBox="0 0 160 96" shapeRendering="crispEdges" aria-hidden="true">
      {/* Parede e chão do armazém */}
      <path d="M0 80h160v16H0Z" fill="#b07a4c"/>
      <path d="M0 80h160v2H0Z" fill="#d9a05a"/>
      <path d="M40 86h2v2h-2Zm56 4h2v2h-2Zm36-6h2v2h-2Z" fill="#8a5838"/>

      {/* Prateleira com mãos-francesas */}
      <path d="M24 50h4v10h-4Zm108 0h4v10h-4Z" fill="#5b3826"/>
      <path d="M10 44h140v6H10Z" fill="#8a5838"/>
      <path d="M10 44h140v2H10Z" fill="#b07a4c"/>

      {/* O que já está arrumado: caixinha, vasinho e livros */}
      <path d="M56 34h10v10H56Z" fill="#b96845"/><path d="M56 34h10v2H56Z" fill="#d99568"/>
      <path d="M78 38h8v6h-8Z" fill="#b96845"/><path d="M79 30h2v8h-2Zm-3 0h3v2h-3Zm5-2h3v2h-3Z" fill="#6d9b45"/>
      <path d="M124 32h4v12h-4Z" fill="#3f6b35"/><path d="M128 34h4v10h-4Z" fill="#e7b84b"/><path d="M132 31h4v13h-4Z" fill="#765337"/>

      {/* Os dois lugares do pote na prateleira */}
      <g className="shelf-slot is-a" transform="translate(39 35)"><HoneyJar/></g>
      <g className="shelf-slot is-b" transform="translate(109 35)"><HoneyJar/></g>

      {/* Ratinho: anda entre os dois lugares, vira de lado na volta e dá um pulinho para pegar e guardar o pote */}
      <g className="shelf-mouse-walk">
        <g transform="translate(32 64)">
          <g className="shelf-mouse-face">
            <g className="shelf-mouse-hop">
              <path className="shelf-mouse-tail" d="M-4 9h4v1h-4Zm-2-1h2v1h-2Z" fill="#e8a3a3"/>
              <path d="M2 6h10v8H2Z" fill="#a89d92"/>
              <path d="M5 10h6v4H5Z" fill="#d8cfc4"/>
              <path d="M9 2h7v7H9Zm7 3h2v3h-2Z" fill="#a89d92"/>
              <path d="M18 5h1v2h-1Z" fill="#e8576f"/>
              <path d="M9 0h4v3H9Z" fill="#a89d92"/><path d="M10 1h2v2h-2Z" fill="#f2a6a6"/>
              <path d="M13 4h1v2h-1Z" fill="#3b2418"/>
              <path d="M17 8h3v1h-3Z" fill="#fff1c7"/>
              <g className="shelf-mouse-legs is-a"><path d="M4 14h2v2H4Zm6 0h2v2h-2Z" fill="#8a7f74"/></g>
              <g className="shelf-mouse-legs is-b"><path d="M3 14h2v2H3Zm8 0h2v2h-2Z" fill="#8a7f74"/></g>
              <g className="shelf-carried" transform="translate(7 -9)"><HoneyJar/></g>
            </g>
          </g>
        </g>
      </g>
    </svg>
    <p>Arrumando as prateleiras…</p>
  </div>;
}
