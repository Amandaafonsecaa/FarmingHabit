// Oito quadradinhos dourados em volta de um brotinho (grade 24 × 24); o brilho passa de um para o outro
const DOTS = [[10, 1], [16, 3], [19, 10], [16, 16], [10, 19], [3, 16], [1, 10], [3, 3]];

/** Carregando no estilo do sítio: anel de moedinhas em pixel girando em volta de um broto */
export function PixelSpinner({ label }: { label: string }) {
  return <div className="pixel-spinner" role="status">
    <svg viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
      {DOTS.map(([x, y], index) => <g key={index} className="pixel-spinner-dot" style={{ animationDelay: `${index * 0.1}s` }}>
        <rect x={x} y={y} width="4" height="4" fill="#e7b84b"/>
        <rect x={x + 3} y={y + 1} width="1" height="3" fill="#b8862f"/>
        <rect x={x + 1} y={y + 3} width="3" height="1" fill="#b8862f"/>
        <rect x={x} y={y} width="1" height="1" fill="#ffe38b"/>
      </g>)}
      <path d="M11 11h2v4h-2Z" fill="#3f6b35"/>
      <path d="M8 9h3v2H8Zm5-1h3v2h-3Z" fill="#6d9b45"/>
    </svg>
    <span className="sr-only">{label}</span>
  </div>;
}
