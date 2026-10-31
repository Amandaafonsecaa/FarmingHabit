/**
 * Ilustrações das cartas em pixel art: cada cena é um fundo em faixas, sprites (grades de caracteres, como os do mapa)
 * e pixels soltos para detalhes (gotas, estrelas, Zzz). Cartas normais têm 40×30; as lendárias (arte cheia) 40×56.
 * Os bichos e o cenário reaproveitam os sprites do mapa; os personagens e objetos novos ficam aqui.
 */
import {
  BANNER, BARN, BARREL, BLUE_FLOWER, BUSH, CASTLE, CHICKEN, COW, CROPS, DRAGON, FENCE, FLOWER, GRASS, HAY, HILL, ICE,
  PINE, ROCK, SHEEP, SNOWMAN, SNOWY, STUMP, TREE, type Sprite,
} from './pixelWorlds';

/** [sprite, x, y, escala (negativa = espelhado), classe de animação] */
export type SceneItem = [sprite: Sprite, x: number, y: number, scale?: number, className?: string];
/** [x, y, largura, altura, cor, classe de animação] */
export type SceneDot = [x: number, y: number, w: number, h: number, color: string, className?: string];
export interface Scene { tall?: boolean; bands: [y: number, color: string][]; items: SceneItem[]; dots?: SceneDot[] }

export const SCENE_W = 40;
export const sceneHeight = (scene: Scene) => scene.tall ? 56 : 30;

const withPal = (sprite: Sprite, pal: Record<string, string>): Sprite => ({ rows: sprite.rows, pal: { ...sprite.pal, ...pal } });
const dots = (color: string, points: [number, number][], className?: string, size = 1): SceneDot[] => points.map(([x, y]) => [x, y, size, size, color, className]);
/** Linha em degraus de pixel em pixel (espadas, raios) */
const line = (color: string, [x0, y0]: [number, number], [x1, y1]: [number, number]): SceneDot[] => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  return Array.from({ length: steps + 1 }, (_, i) => [Math.round(x0 + (x1 - x0) * i / steps), Math.round(y0 + (y1 - y0) * i / steps), 1, 1, color] as SceneDot);
};

// --- Personagens ---
const PERSON_ROWS = ['..HHHH..', '.HHHHHH.', '..hsss..', '..sksk..', '..ssss..', '.cccccc.', 'sccccccs', '.cccccc.', '.pppppp.', '.pp..pp.', '.bb..bb.'];
const BASE_PAL = { s: '#f6c8a0', k: '#3b2418', h: '#7a4a26', p: '#5d6382', b: '#57311f' };
const FARMER: Sprite = { pal: { ...BASE_PAL, H: '#e3b268', c: '#72ad32' }, rows: PERSON_ROWS };
/** Braços para cima: comemorando ou levantando peso */
const FARMER_UP: Sprite = { pal: FARMER.pal, rows: ['s......s', 's.HHHH.s', 'sHHHHHHs', 'c.hsss.c', 'c.sksk.c', 'cccccccc', '.cccccc.', '.cccccc.', '.pppppp.', '.pp..pp.', '.bb..bb.'] };
const KID_RED: Sprite = { pal: { ...BASE_PAL, H: '#d64d3c', c: '#bf5837', p: '#3b3f5a' }, rows: PERSON_ROWS };
const KID_BLUE: Sprite = { pal: { ...BASE_PAL, H: '#5fa8d3', c: '#3d7fa8', p: '#3b3f5a' }, rows: PERSON_ROWS };
const HELMET_ROWS = ['...RR...', '..HHHH..', '.HHHHHH.', '..sksk..', '..ssss..', '.cccccc.', 'sccccccs', '.cccccc.', '.pppppp.', '.pp..pp.', '.bb..bb.'];
const GUARD: Sprite = { pal: { ...BASE_PAL, R: '#d64d3c', H: '#a7adb5', c: '#5d6382', O: '#57311f', p: '#3b3f5a', b: '#2c2a33' }, rows: HELMET_ROWS.map((row, i) => i === 4 ? '..sOOs..' : row) };
const KNIGHT_BLUE: Sprite = { pal: { ...GUARD.pal, R: '#5fa8d3', c: '#3d7fa8' }, rows: HELMET_ROWS };
const KNIGHT_RED: Sprite = { pal: { ...GUARD.pal, R: '#f2c453', c: '#bf5837' }, rows: HELMET_ROWS };
const FAIRY: Sprite = { pal: { h: '#f2c453', s: '#f6c8a0', k: '#3b2418', w: '#d8fbff', W: '#9fd8f0', d: '#c9a4f2', D: '#a98bd4' }, rows: [
  '...hhh...', '..hhhhh..', 'wWhssshWw', 'wwhkskhww', 'wWwssswWw', '.wwdddww.', '..dDdDd..', '.ddddddd.', '.dDdDdDd.', '..ddddd..', '...s.s...',
] };

// --- Bichos ---
const OWL: Sprite = { pal: { b: '#8a6136', w: '#fff1d6', k: '#3b2418', y: '#f2a33a', B: '#c9995a' }, rows: ['b.....b', 'bbbbbbb', 'bwwbwwb', 'bwkbkwb', 'bbbybbb', 'bBBBBBb', 'bBbBbBb', '.bbbbb.', '..y.y..'] };
const SQUIRREL: Sprite = { pal: { t: '#a8582a', T: '#d98a4a', r: '#c0703a', k: '#3b2418' }, rows: ['.tt.....', 'tTtt..r.', 'tTTt.rrr', 'tTTtrrkr', '.tTtrrrr', '..ttrrr.', '...rrrr.', '...r..r.'] };
const PENGUIN: Sprite = { pal: { k: '#2c2a33', w: '#ffffff', y: '#f2a33a' }, rows: ['.kkk..', 'kkwkyy', 'kwwwk.', 'kwwwkk', 'kwwwkk', 'kwwwk.', '.kkk..', '.y.y..'] };
const YETI: Sprite = { pal: { w: '#f4f7ff', b: '#bcd0ea', k: '#3b3f5a', p: '#f2a6a6', W: '#bcd0ea' }, rows: [
  '..wwwwww..', '.wwwwwwww.', '.wbbbbbbw.', '.wbkbbkbw.', '.wpbbbbpw.', 'wwbbkkbbww', 'wwwwwwwwww', 'wwwwwwwwww', 'w.wwwwww.w', '..ww..ww..', '..WW..WW..',
] };
const FROG: Sprite = { pal: { g: '#53922d', k: '#3b2418', G: '#8cc65e' }, rows: ['.g.g.', 'gkgkg', 'gGGGg', 'g...g'] };
const MOUSE: Sprite = { pal: { g: '#a7adb5', p: '#f2a6a6', k: '#2c2a33' }, rows: ['....gp.', '.gggggg', 'ggggkgp', 'p.g..g.'] };

// --- Objetos ---
const CAN: Sprite = { pal: { h: '#6b6d80', m: '#8fb8d0' }, rows: ['..hh...', '.h..h.m', 'mmmmmm.', 'mmmmm..', 'mmmmm..'] };
const BARBELL: Sprite = { pal: { W: '#3b3f5a', m: '#a7adb5' }, rows: ['WW........WW', 'WWmmmmmmmmWW', 'WW........WW'] };
const PUMPKIN: Sprite = { pal: { s: '#53922d', o: '#f2a33a', O: '#c9752a' }, rows: [
  '.....ss.....', '..oOoooOoo..', '.oOooOooOoo.', 'oOooOooOoooo', 'oOooOooOoooo', 'oOooOooOoooo', '.oOooOooOoo.', '..oooooooo..',
] };
const EGG: Sprite = { pal: { w: '#fff6e8', W: '#e8d2a8' }, rows: ['.w.', 'www', 'wwW', '.W.'] };
const ACORN: Sprite = { pal: { b: '#5b3826', c: '#7a4a26', a: '#c48a4a' }, rows: ['.b.', 'ccc', 'aaa', '.a.'] };
const MUSH_FACE: Sprite = { pal: { r: '#d6453a', w: '#fff1d6', s: '#f6dcc0', k: '#3b2418', p: '#f2a6a6' }, rows: ['..rrr..', '.rrwrr.', 'rwrrrwr', 'rrrrrrr', '.sssss.', '.sksks.', '.psssp.', '..sss..'] };
const BLANKET: Sprite = { pal: { r: '#d64d3c', w: '#fff1d6' }, rows: ['rwrwrwrwrwrwrw', 'wrwrwrwrwrwrwr', 'rwrwrwrwrwrwrw'] };
const BASKET: Sprite = { pal: { o: '#7a4a26', b: '#a86b35', B: '#c9995a' }, rows: ['.oooo.', 'o....o', 'bbbbbb', 'bBbBbB', 'bbbbbb'] };
const MUG: Sprite = { pal: { m: '#d64d3c', c: '#7a4a26', w: '#fff6e8' }, rows: ['.ww....', 'mcwcm..', 'mmmmmmm', 'mmmmm.m', 'mmmmm.m', 'mmmmmmm', 'mmmmm..', '.mmm...'] };
const SPEAR: Sprite = { pal: { w: '#c6ccd6', p: '#7a4a26' }, rows: ['.w.', 'www', '.w.', ...Array.from({ length: 23 }, () => '.p.')] };
const CHEESE: Sprite = { pal: { y: '#f2c453', Y: '#e7a92f' }, rows: ['...yy', '..yYy', '.yyYy', 'yyyyy'] };
const TABLE: Sprite = { pal: { w: '#fff1d6', W: '#e8d2a8', l: '#7a4a26' }, rows: ['wwwwwwwwwwwwwwwwwwww', 'WWWWWWWWWWWWWWWWWWWW', '.l................l.', '.l................l.', '.l................l.'] };
const PIE: Sprite = { pal: { c: '#c9752a', y: '#f2a33a', r: '#d64d3c' }, rows: ['..rr..', '.cccc.', 'cyyyyc', 'cccccc'] };
const GRAPES: Sprite = { pal: { s: '#53922d', g: '#7b5ba8', G: '#a98bd4' }, rows: ['.s.', 'gGg', 'ggG', '.g.'] };
const GOBLET: Sprite = { pal: { y: '#f2c453', r: '#bf5837' }, rows: ['yry', 'yyy', '.y.', 'yyy'] };
const COINS: Sprite = { pal: { y: '#f2c453', Y: '#e7a92f', w: '#fff6c2' }, rows: ['.....yy.....', '...yywyyy...', '..yYyyyYyy..', '.yyyYyyyyYy.', 'yYyyyyYyyyyy'] };
const TORCH: Sprite = { pal: { f: '#f2a33a', F: '#ffe38b', p: '#7a4a26' }, rows: ['.f.', 'fFf', '.F.', 'ppp', '.p.', '.p.'] };
const MOON: Sprite = { pal: { y: '#fff6c2' }, rows: ['.yyy.', 'yy...', 'yy...', 'yy...', '.yyy.'] };
const ZZZ: Sprite = { pal: { z: '#fff1c7' }, rows: ['zzzz', '..z.', '.z..', 'zzzz'] };
const QUESTION: Sprite = { pal: { q: '#57311f' }, rows: ['.qq.', 'q..q', '..q.', '.q..', '....', '.q..'] };

// --- Fundos ---
const FARM: Scene['bands'] = [[0, '#9fd8f0'], [20, '#8fd46a'], [27, '#79c257']];
const FOREST: Scene['bands'] = [[0, '#cdebc4'], [19, '#6cbf55'], [26, '#58a845']];
const NIGHT_FOREST: Scene['bands'] = [[0, '#233a4a'], [21, '#2f6f55'], [27, '#204f3d']];
const SNOW: Scene['bands'] = [[0, '#bfe6f3'], [20, '#eef3f7'], [26, '#d3dde8']];
const HALL: Scene['bands'] = [[0, '#8d8fa0'], [23, '#6b6d80'], [27, '#57311f']];
const bricks = (color: string, rows: number[]): SceneDot[] => rows.flatMap((y, row) => Array.from({ length: 6 }, (_, i) => [i * 8 + (row % 2) * 4, y, 6, 1, color] as SceneDot));
const snowfall = (points: [number, number][]) => dots('#ffffff', points, 'card-snow');

export const SCENES: Record<string, Scene> = {
  // Vale do Sítio
  'hasty-hen': { bands: FARM, items: [[FENCE, 0, 15], [FENCE, 27, 15], [CHICKEN, 13, 8, 3], [EGG, 32, 19, 2]], dots: [
    [33, 3, 4, 4, '#ffe38b'], [3, 12, 6, 1, '#ffffff'], [1, 15, 8, 1, '#ffffff'], [4, 18, 5, 1, '#ffffff'], [10, 23, 2, 1, '#c9995a'], [7, 24, 2, 1, '#c9995a'],
  ] },
  'watering-time': { bands: FARM, items: [[CROPS, 25, 21], [FARMER, 3, 6, 2], [CAN, 17, 12, 2]], dots: [
    [33, 3, 4, 4, '#ffe38b'], ...dots('#4fa3e0', [[31, 15], [32, 18], [30, 20], [33, 21]], 'card-drip', 1),
  ] },
  'curious-cow': { bands: FARM, items: [[FENCE, 0, 16], [FENCE, 13, 16], [FENCE, 26, 16], [COW, 6, 12, 2.5], [QUESTION, 33, 3, 2]], dots: [[36, 15, 2, 1, '#f28fb0', 'card-blink']] },
  'sheep-nap': { bands: [[0, '#5d6382'], [19, '#4fa851'], [26, '#3f8a3a']], items: [[MOON, 3, 3, 2], [HAY, 30, 13], [SHEEP, 6, 11, 3], [ZZZ, 30, 4, 1, 'card-float'], [ZZZ, 34, 0, 1, 'card-float']], dots: dots('#fff6c2', [[16, 3], [24, 6], [20, 10], [37, 9], [14, 8]], 'card-blink') },
  'barn-workout': { bands: FARM, items: [[BARN, 1, 9], [HAY, 3, 21], [FARMER_UP, 20, 7, 2], [BARBELL, 16, 5, 2]], dots: dots('#4fa3e0', [[18, 13], [38, 12], [17, 16]], 'card-drip') },
  'golden-harvest': { tall: true, bands: [[0, '#f2a33a'], [9, '#f2c453'], [19, '#ffe38b'], [30, '#8fd46a'], [44, '#79c257']], items: [
    [HILL, 0, 25, 2], [HILL, 16, 26, 2], [CROPS, 0, 44], [CROPS, 26, 46], [PUMPKIN, 2, 30, 2], [FARMER_UP, 23, 29, 2],
  ], dots: [[12, 14, 16, 6, '#fff6c2'], [14, 12, 12, 2, '#fff6c2'], ...dots('#fff6c2', [[3, 27], [28, 24], [36, 33], [20, 28]], 'card-blink', 2)] },
  // Floresta Sussurrante
  'owl-watch': { bands: NIGHT_FOREST, items: [[MOON, 28, 2, 2], [PINE, 0, 10], [PINE, 33, 12], [STUMP, 14, 21, 2], [OWL, 13, 3, 2]], dots: dots('#fff6c2', [[6, 3], [22, 5], [37, 4]], 'card-blink') },
  'thief-squirrel': { bands: FOREST, items: [[TREE, 18, -1, 2], [SQUIRREL, 3, 11, 2], [ACORN, 18, 15, 2], [ACORN, 29, 24], [ACORN, 33, 25], [ACORN, 31, 22]] },
  'gossip-mushrooms': { bands: FOREST, items: [[GRASS, 0, 25], [GRASS, 35, 25], [MUSH_FACE, 2, 11, 2], [withPal(MUSH_FACE, { r: '#7b5ba8' }), 16, 19], [withPal(MUSH_FACE, { r: '#5fc6d8' }), 24, 11, 2]], dots: [
    [15, 7, 10, 5, '#fff1c7'], [16, 12, 2, 2, '#fff1c7'], ...dots('#57311f', [[17, 9], [20, 9], [23, 9]]),
  ] },
  'glade-picnic': { bands: FOREST, items: [[TREE, -2, 6], [TREE, 30, 4], [BLANKET, 6, 22, 2], [BASKET, 8, 13, 2], [FROG, 24, 15, 2]], dots: [[34, 3, 4, 4, '#ffe38b'], [21, 20, 4, 2, '#e3b268'], [21, 19, 4, 1, '#72ad32'], [6, 10, 2, 1, '#f28fb0', 'card-blink']] },
  'firefly-ball': { bands: [[0, '#1f2a3a'], [20, '#204f3d'], [26, '#163a2c']], items: [[PINE, -2, 2, 2], [PINE, 26, 4, 2], [BUSH, 16, 21]], dots: dots('#ffe38b', [
    [8, 8], [14, 4], [19, 11], [24, 6], [30, 14], [12, 16], [21, 18], [35, 8], [5, 20], [28, 22], [17, 7], [33, 19],
  ], 'card-blink') },
  'forest-fairy': { tall: true, bands: [[0, '#2a2f55'], [18, '#3b3f6a'], [38, '#2f6f55'], [48, '#204f3d']], items: [
    [MOON, 27, 3, 2], [TREE, -8, 20, 2], [TREE, 26, 18, 2], [FAIRY, 11, 16, 2], [FLOWER, 4, 46, 2], [BLUE_FLOWER, 17, 49, 2], [FLOWER, 31, 47, 2],
  ], dots: [...dots('#fff6c2', [[8, 14], [32, 30], [6, 34], [33, 16], [20, 11], [14, 42], [27, 41]], 'card-blink', 2), ...dots('#fff6e8', [[4, 5], [16, 3], [21, 8]], 'card-blink')] },
  // Montanhas Nevadas
  'snowman': { bands: SNOW, items: [[PINE, 1, 10], [PINE, 31, 9], [SNOWMAN, 13, 6, 2]], dots: snowfall([[4, 3], [10, 8], [27, 2], [34, 5], [22, 12], [7, 15], [37, 16]]) },
  'snowball-fight': { bands: SNOW, items: [[KID_RED, 1, 7, 2], [KID_BLUE, 23, 7, -2]], dots: [
    [17, 9, 2, 2, '#ffffff'], [21, 6, 2, 2, '#ffffff'], [14, 10, 2, 1, '#d3dde8'], [24, 7, 2, 1, '#d3dde8'], ...snowfall([[5, 2], [33, 3], [19, 15]]),
  ] },
  'skating-penguin': { bands: SNOW, items: [[PINE, 34, 7], [ICE, 4, 17, 2], [PENGUIN, 14, 4, 2]], dots: [[7, 22, 6, 1, '#ffffff'], [26, 24, 7, 1, '#ffffff'], [10, 26, 5, 1, '#ffffff'], ...snowfall([[4, 4], [30, 2], [24, 12]])] },
  'shy-yeti': { bands: SNOW, items: [[ROCK, 30, 22, 1], [YETI, 15, 6, 2], [PINE, 2, 3, 2]], dots: snowfall([[30, 3], [36, 10], [26, 1], [13, 2]]) },
  'hot-cocoa': { bands: [[0, '#a86b35'], [24, '#7a4a26']], items: [[MUG, 21, 9, 2]], dots: [
    [2, 3, 16, 14, '#57311f'], [3, 4, 14, 12, '#bfe6f3'], [3, 13, 14, 3, '#eef3f7'], [10, 4, 1, 12, '#57311f'], [3, 9, 14, 1, '#57311f'],
    ...snowfall([[5, 6], [13, 7], [7, 11], [15, 11]]), [5, 22, 6, 2, '#c48a4a'], [6, 22, 1, 1, '#7a4a26'], [9, 23, 1, 1, '#7a4a26'],
    ...dots('#fff6e8', [[24, 5], [26, 3], [28, 6]], 'card-float'),
  ] },
  'peak-aurora': { tall: true, bands: [[0, '#1f2240'], [24, '#2c2f55'], [44, '#eef3f7'], [50, '#d3dde8']], items: [[SNOWY, 0, 24, 2], [PINE, 1, 39], [PINE, 30, 41]], dots: [
    ...[0, 4, 8, 12, 16, 20, 24, 28, 32, 36].flatMap((x, i): SceneDot[] => [
      [x, 9 + (i % 3), 4, 3, '#72d6a0', 'card-aurora'], [x, 12 + ((i + 1) % 3), 4, 3, '#9fd8f0', 'card-aurora'], [x, 15 + ((i + 2) % 3), 4, 2, '#f28fb0', 'card-aurora'],
    ]),
    ...dots('#fff6c2', [[3, 3], [11, 5], [19, 2], [27, 4], [35, 2], [7, 21], [31, 20]], 'card-blink'),
  ] },
  // Castelo do Dragão Sonolento
  'yawning-guard': { bands: HALL, items: [[BANNER, 2, 2, 2], [TORCH, 34, 7], [SPEAR, 27, 2], [GUARD, 13, 4, 2]], dots: [...bricks('#7d838c', [6, 12, 18]), [22, 2, 3, 3, '#fff1c7', 'card-float']] },
  'pantry-mouse': { bands: HALL, items: [[BARREL, 2, 13, 2], [CHEESE, 28, 19, 2], [MOUSE, 14, 19, 2]], dots: [
    [0, 10, 40, 2, '#7a4a26'], [18, 6, 4, 4, '#bfe6f3'], [24, 7, 3, 3, '#e8c48a'], [30, 5, 4, 5, '#d64d3c'], ...dots('#e7a92f', [[26, 25], [24, 26]]),
  ] },
  'runaway-barrel': { bands: [[0, '#9fd8f0'], [18, '#a7adb5'], [27, '#7d838c']], items: [[CASTLE, 0, 4], [BARREL, 20, 12, 2, 'card-roll'], [MOUSE, 34, 23, -1]], dots: [
    [8, 15, 8, 1, '#ffffff'], [6, 19, 10, 1, '#ffffff'], [10, 23, 6, 1, '#ffffff'], [18, 26, 3, 1, '#c9c0b0'], [14, 27, 2, 1, '#c9c0b0'],
  ] },
  'courtyard-duel': { bands: [[0, '#9fd8f0'], [20, '#c9c0b0'], [26, '#a7adb5']], items: [[BANNER, 18, 0], [KNIGHT_BLUE, 0, 6, 2], [KNIGHT_RED, 24, 6, -2]], dots: [
    ...line('#e3e6ea', [15, 18], [22, 9]), ...line('#e3e6ea', [24, 18], [17, 9]), ...dots('#ffe38b', [[19, 11], [20, 12], [21, 11], [20, 10], [18, 12], [22, 12]], 'card-blink'),
  ] },
  'royal-feast': { bands: [[0, '#7b5ba8'], [24, '#57311f']], items: [[BANNER, 2, 1, 2], [BANNER, 30, 1, 2], [TABLE, 0, 18, 2], [PIE, 3, 10, 2], [GRAPES, 17, 10, 2], [GOBLET, 26, 10, 2], [TORCH, 34, 12]], dots: [] },
  'sleepy-dragon': { tall: true, bands: [[0, '#2c2f36'], [34, '#3a3f45'], [46, '#2c2a33']], items: [
    [TORCH, 3, 14, 2], [TORCH, 31, 14, 2], [COINS, 8, 26, 2], [DRAGON, 0, 32, 2], [ZZZ, 10, 23, 1, 'card-float'], [ZZZ, 13, 14, 2, 'card-float'],
  ], dots: [...bricks('#3a3f45', [6, 12, 18, 24]), ...dots('#f2c453', [[4, 50], [10, 51], [26, 50], [33, 52], [18, 53]], undefined, 2), ...dots('#fff6c2', [[13, 27], [25, 28]], 'card-blink')] },
};
