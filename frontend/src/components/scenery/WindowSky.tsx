import { useId } from 'react';
import { SKY_PALETTES, type DayPhase } from '../../lib/timeOfDay';

/** Céu limitado à abertura da janela: a moldura e os objetos do interior ficam intactos. */
export function WindowSky({ x, y, width, height, phase }: { x: number; y: number; width: number; height: number; phase: DayPhase }) {
  const gradient = `window-sky-${useId().replace(/:/g, '')}`;
  const palette = SKY_PALETTES[phase];
  return <svg x={x} y={y} width={width} height={height} viewBox="0 0 256 146" preserveAspectRatio="none" overflow="hidden" aria-hidden="true" className="scenery-window-sky" shapeRendering="crispEdges">
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={palette.top}/><stop offset={`${palette.stop}%`} stopColor={palette.middle}/><stop offset="100%" stopColor={palette.bottom}/>
    </linearGradient></defs>
    <rect width="256" height="146" fill={`url(#${gradient})`}/>
  </svg>;
}
