/**
 * A jornada das missões: cada missão cumprida é um passo no mapa e a exploradora nunca volta atrás.
 * 4 capítulos × 5 paradas = 20 missões por volta; depois da princesa, uma nova jornada recomeça (em loop).
 */
export type LandmarkId =
  | 'windmill' | 'well' | 'bridge' | 'scarecrow' | 'portal'
  | 'mushroom' | 'lake' | 'elder' | 'cabin' | 'trailsign'
  | 'camp' | 'crystals' | 'ropebridge' | 'yeti' | 'lookout'
  | 'gate' | 'armor' | 'dragon' | 'tower' | 'princess';
export type ChapterTheme = 'valley' | 'forest' | 'mountain' | 'castle';
type Point = [number, number];

export interface Chapter { name: string; theme: ChapterTheme; start: Point; exit: Point; stops: { at: Point; landmark: LandmarkId; name: string }[] }

export const STOPS_PER_CHAPTER = 5;

export const CHAPTERS: Chapter[] = [
  { name: 'Vale do Sítio', theme: 'valley', start: [70, 252], exit: [965, 236], stops: [
    { at: [190, 222], landmark: 'windmill', name: 'Moinho de vento' },
    { at: [330, 262], landmark: 'well', name: 'Poço dos desejos' },
    { at: [480, 214], landmark: 'bridge', name: 'Ponte do riacho' },
    { at: [640, 252], landmark: 'scarecrow', name: 'Espantalho amigo' },
    { at: [800, 208], landmark: 'portal', name: 'Portal da floresta' },
  ] },
  { name: 'Floresta Sussurrante', theme: 'forest', start: [50, 228], exit: [965, 214], stops: [
    { at: [180, 258], landmark: 'mushroom', name: 'Cogumelo gigante' },
    { at: [330, 208], landmark: 'lake', name: 'Lago dos vaga-lumes' },
    { at: [490, 252], landmark: 'elder', name: 'Árvore anciã' },
    { at: [650, 202], landmark: 'cabin', name: 'Cabana da bruxa gentil' },
    { at: [810, 248], landmark: 'trailsign', name: 'Trilha da montanha' },
  ] },
  { name: 'Montanhas Nevadas', theme: 'mountain', start: [50, 256], exit: [965, 240], stops: [
    { at: [200, 216], landmark: 'camp', name: 'Acampamento' },
    { at: [350, 254], landmark: 'crystals', name: 'Caverna de cristais' },
    { at: [510, 204], landmark: 'ropebridge', name: 'Ponte suspensa' },
    { at: [670, 248], landmark: 'yeti', name: 'O Yeti fofinho' },
    { at: [820, 206], landmark: 'lookout', name: 'Vista do castelo' },
  ] },
  { name: 'Castelo do Dragão Sonolento', theme: 'castle', start: [50, 242], exit: [965, 228], stops: [
    { at: [190, 256], landmark: 'gate', name: 'Portão do castelo' },
    { at: [340, 214], landmark: 'armor', name: 'Salão das armaduras' },
    { at: [500, 256], landmark: 'dragon', name: 'Dragão dormindo' },
    { at: [660, 210], landmark: 'tower', name: 'Escadaria da torre' },
    { at: [840, 238], landmark: 'princess', name: 'A princesa!' },
  ] },
];

export const JOURNEY_LENGTH = CHAPTERS.length * STOPS_PER_CHAPTER;

/** Onde a exploradora está, a partir do total de missões cumpridas */
export function journeyState(completed: number) {
  const within = completed % JOURNEY_LENGTH;
  return {
    loop: Math.floor(completed / JOURNEY_LENGTH) + 1,
    chapter: Math.floor(within / STOPS_PER_CHAPTER),
    reached: within % STOPS_PER_CHAPTER,
  };
}

/** Caminho suave (Catmull-Rom → Bézier) passando por todos os pontos */
export function smoothPath(points: Point[]) {
  return points.reduce((path, [x, y], index) => {
    if (index === 0) return `M${x} ${y}`;
    const [x0, y0] = points[index - 2] ?? points[index - 1];
    const [x1, y1] = points[index - 1];
    const [x3, y3] = points[index + 1] ?? [x, y];
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6], c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6];
    return `${path} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${x} ${y}`;
  }, '');
}
