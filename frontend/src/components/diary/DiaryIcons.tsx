import type { Mood, Sticker } from '../../lib/diary';

// Ícones pixelados 16×16: [caminho, cor]
const MOOD_ART: Record<Mood, [string, string][]> = {
  sunny: [['M6 4h4v2h2v4h-2v2H6v-2H4V6h2Z', '#f2c453'], ['M7 0h2v2H7Zm0 14h2v2H7ZM0 7h2v2H0Zm14 0h2v2h-2ZM2 2h2v2H2Zm10 0h2v2h-2ZM2 12h2v2H2Zm10 0h2v2h-2Z', '#e8ac59'], ['M6 5h2v2H6Z', '#fff6c2']],
  cloudy: [['M4 6h3V4h4v2h2v2h2v4H1V8h3Z', '#c9cfd8'], ['M5 7h2v1H5Zm4-2h2v1H9Z', '#f4f7ff'], ['M1 11h14v1H1Z', '#9aa3b2']],
  rainy: [['M4 3h3V1h4v2h2v2h2v4H1V5h3Z', '#9aa3b2'], ['M3 11h1v2H3Zm4 1h1v2H7Zm4-1h1v2h-1Zm-6 3h1v2H5Zm4 0h1v2H9Z', '#5fa8d3']],
  stormy: [['M4 3h3V1h4v2h2v2h2v4H1V5h3Z', '#6d7385'], ['M8 9h3l-2 3h2l-4 4 1-3H6Z', '#f2c453']],
  rainbow: [['M2 12V8h1V6h1V5h2V4h4v1h2v1h1v2h1v4h-2V8h-1V7h-1V6H6v1H5v1H4v4Z', '#e8576f'], ['M4 12V9h1V8h1V7h4v1h1v1h1v3h-2V9H6v3Z', '#f2c453'], ['M6 12v-2h4v2H8v-1H8v1Z', '#72ad32'], ['M0 12h4v2H0Zm12 0h4v2h-4Z', '#fff']],
};

const STICKER_ART: Record<Sticker, [string, string][]> = {
  flower: [['M7 9h2v7H7Z', '#3f6b35'], ['M9 12h3v2H9Z', '#72ad32'], ['M6 1h4v2h2v4h-2v2H6V7H4V3h2Z', '#ee6996'], ['M7 4h2v2H7Z', '#f2c453']],
  cat: [['M2 3h2v2h1v1h6V5h1V3h2v10H2Z', '#e8954a'], ['M4 7h2v2H4Zm6 0h2v2h-2Z', '#3b2418'], ['M7 9h2v1H7Z', '#e8576f'], ['M2 3h2v2H2Zm10 0h2v2h-2Z', '#f6c08a'], ['M3 11h10v2H3Z', '#fff1d6']],
  star: [['M7 1h2v4h5v2h-2v2h1v4h-2v-1H9v-1H7v1H5v1H3V9h1V7H2V5h5Z', '#f2c453'], ['M7 4h1v3H7Z', '#fff6c2']],
  heart: [['M2 3h4v1h1v1h2V4h1V3h4v1h1v5h-1v1h-1v1h-1v1h-1v1H9v1H7v-1H6v-1H5v-1H4v-1H3V9H2V8H1V4h1Z', '#e8576f'], ['M3 5h2v2H3Z', '#f7a5b3']],
  mushroom: [['M6 10h4v5H6Z', '#f6e2b0'], ['M2 5h2V3h2V2h4v1h2v2h2v4H2Z', '#bf5837'], ['M5 4h2v2H5Zm5 1h2v2h-2Z', '#fff1c7']],
  chicken: [['M5 3h4v2h2v2h3v5h-2v2H4v-2H3V8h2Z', '#fff8ec'], ['M6 1h2v2H6Z', '#e8576f'], ['M4 5h1v1H4Z', '#3b2418'], ['M2 6h2v1H2Z', '#f2a33a'], ['M6 14h1v2H6Zm3 0h1v2H9Z', '#f2a33a']],
};

const draw = (art: [string, string][]) => art.map(([d, fill], index) => <path key={index} d={d} fill={fill}/>);

export function MoodIcon({ mood, className = 'size-6' }: { mood: Mood; className?: string }) {
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">{draw(MOOD_ART[mood])}</svg>;
}

export function StickerIcon({ sticker, className = 'size-6' }: { sticker: Sticker; className?: string }) {
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">{draw(STICKER_ART[sticker])}</svg>;
}
