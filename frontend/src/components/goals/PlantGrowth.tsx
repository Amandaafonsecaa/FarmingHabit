import { useInView } from '../../hooks/useScrollGrowth';

// Sprites em grade 32×32: [x, y, largura, altura, cor]
type Pixel = [number, number, number, number, string];
const POT: Pixel[] = [[8, 20, 16, 1, '#5b3826'], [6, 21, 20, 3, '#d98a5c'], [6, 21, 20, 1, '#f0a97a'], [8, 24, 16, 7, '#b96845'], [8, 24, 16, 1, '#8f4a2e'], [21, 24, 3, 7, '#9c5434'], [9, 31, 14, 1, '#7a3c25']];
const MOUND: Pixel[] = [[7, 20, 18, 1, '#7d4c2a'], [4, 21, 24, 2, '#6a3f22'], [2, 23, 28, 2, '#5b3826']];
const LOW_LEAVES: Pixel[] = [[10, 15, 5, 3, '#53922d'], [11, 14, 3, 1, '#72ad32'], [17, 14, 5, 3, '#72ad32'], [19, 13, 3, 1, '#c0e36b']];
const HIGH_LEAVES: Pixel[] = [[12, 10, 3, 2, '#72ad32'], [17, 9, 3, 2, '#72ad32'], [18, 9, 1, 1, '#c0e36b']];
const STAGES: Pixel[][] = [
  [[15, 18, 2, 2, '#8a5838'], [15, 18, 1, 1, '#c08a58']],
  [[15, 15, 2, 5, '#53922d'], [12, 14, 3, 2, '#72ad32'], [13, 13, 2, 1, '#72ad32'], [17, 13, 3, 2, '#72ad32'], [17, 12, 2, 1, '#c0e36b']],
  [[15, 11, 2, 9, '#53922d'], ...LOW_LEAVES, ...HIGH_LEAVES],
  [[15, 8, 2, 12, '#53922d'], ...LOW_LEAVES, ...HIGH_LEAVES, [14, 5, 4, 4, '#6d9b45'], [15, 4, 2, 2, '#f2c453']],
  [[15, 9, 2, 11, '#53922d'], ...LOW_LEAVES, ...HIGH_LEAVES, [14, 1, 4, 3, '#f2c453'], [14, 8, 4, 2, '#f2c453'], [10, 4, 4, 4, '#f2c453'], [18, 4, 4, 4, '#f2c453'],
    [12, 2, 2, 2, '#ffe38b'], [18, 2, 2, 2, '#ffe38b'], [12, 8, 2, 2, '#e8ac59'], [18, 8, 2, 2, '#e8ac59'], [14, 4, 4, 4, '#bf5837'], [14, 4, 2, 2, '#e8ac59']],
];
const SPARKLES: Pixel[] = [[5, 3, 1, 3, '#fff1c7'], [4, 4, 3, 1, '#fff1c7'], [26, 8, 1, 3, '#fff1c7'], [25, 9, 3, 1, '#fff1c7']];
const STAGE_NAMES = ['semente', 'broto', 'muda', 'botão', 'flor'];

export const stageFor = (progress: number) => progress >= 100 ? 4 : progress >= 67 ? 3 : progress >= 34 ? 2 : progress > 0 ? 1 : 0;
const draw = (pixels: Pixel[]) => pixels.map(([x, y, width, height, fill], index) => <rect key={index} x={x} y={y} width={width} height={height} fill={fill}/>);

/**
 * Planta que acompanha o progresso: semente → broto → muda → botão → flor.
 * Só cresce quando entra na tela (efeito de rolagem) e sacode ao ser colhida.
 */
export function PlantGrowth({ progress, label, variant = 'pot', blooming = false }: { progress: number; label: string; variant?: 'pot' | 'ground'; blooming?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const stage = stageFor(progress);
  const shown = inView ? stage : 0;
  return <div ref={ref} className={`plant-growth is-${variant} ${blooming ? 'is-blooming' : ''}`} role="img" aria-label={`${label}: ${STAGE_NAMES[stage]} (${progress}%)`}>
    <svg viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
      {draw(variant === 'pot' ? POT : MOUND)}
      {/* A key por estágio remonta o grupo e dispara a animação de brotar a cada mudança */}
      <g key={shown} className="plant-stage">{draw(STAGES[shown])}</g>
      {shown === 4 && <g className="plant-sparkles">{draw(SPARKLES)}</g>}
    </svg>
  </div>;
}
