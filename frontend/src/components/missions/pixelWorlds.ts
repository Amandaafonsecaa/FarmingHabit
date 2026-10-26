/**
 * Os 4 mundos da jornada em pixel art: chão, água e enfeites de cada mapa (as construções das paradas vêm de Landmarks).
 * Os sprites são grades de caracteres; cada letra é uma cor da paleta e "." é transparente.
 * Coordenadas no mapa MAP_W×MAP_H; cada sprite é ancorado pelo pé (centro de baixo).
 */
type Point = [number, number];
export interface Sprite { rows: string[]; pal: Record<string, string> }
export interface Placed { sprite: Sprite; x: number; y: number; scale: number }
export interface PixelWorld {
  ground: string; speck: string; water: string[]; foam: Point[];
  start: Point; nodes: Point[]; exit: Point;
  items: Placed[];
}

export const MAP_W = 1350;
export const MAP_H = 300;

// --- Natureza ---
const TREE: Sprite = { pal: { o: '#1f4d2e', l: '#7fcf6a', g: '#4fa851', d: '#2f7a3f', t: '#7a4a26' }, rows: [
  '...ooooo...', '..ollllgo..', '.ollllgggo.', 'ollllggggdo', 'olllgggggdo', 'ogggggggddo', 'oggggggdddo', '.odgggdddo.', '..oddddoo..', '....oto....', '....oto....', '....ooo....',
] };
const PINE: Sprite = { pal: { o: '#163a2c', l: '#4f9a72', g: '#2f6f55', d: '#204f3d', t: '#6b4426' }, rows: [
  '....o....', '...olo...', '...olo...', '..olggo..', '..olggo..', '.olgggdo.', '.olgggdo.', 'olggggddo', 'olgggggdo', '.ooggdoo.', '...oto...', '...ooo...',
] };
const BUSH: Sprite = { pal: { o: '#1f4d2e', g: '#4fa851', l: '#7fcf6a', d: '#2f7a3f' }, rows: ['..oooo..', '.ollggo.', 'olggggdo', 'oggggddo', 'oooooooo'] };
const MOUNTAIN_ROWS = [
  '.........oo.........', '........olbo........', '.......ollbbo.......', '......ollbbbdo......', '.....ollbbbbddo.....', '....ollbbbbbbddo....',
  '...ollbbbbbbbbddo...', '..ollbbbbbbbbbbddo..', '.ollbbbbbbbbbbbbddo.', 'ollbbbbbbbbbbbbbbddo', 'oooooooooooooooooooo',
];
const MOUNTAIN: Sprite = { pal: { o: '#4a3426', l: '#c4a283', b: '#9a7a62', d: '#76584a' }, rows: MOUNTAIN_ROWS };
// Montanha nevada: o topo vira neve
const SNOWY: Sprite = { pal: { ...MOUNTAIN.pal, s: '#ffffff', S: '#d6e2ee', b: '#8d8fa0', l: '#b3b6c6', d: '#6b6d80' }, rows: MOUNTAIN_ROWS.map((row, index) => index < 4 ? row.replace(/[lb]/g, 's').replace(/d/g, 'S') : row) };
const HILL: Sprite = { pal: { o: '#2f6b35', l: '#a6e07a', g: '#78c05a' }, rows: ['....oooooo....', '..oollllllgo..', '.olllllllgggo.', 'ollllllggggggo'] };
const ROCK: Sprite = { pal: { o: '#3b3640', l: '#b9b0a4', b: '#8f857a', d: '#6b625a' }, rows: ['..ooo...', '.olbbo..', 'olbbbdo.', 'oooooooo'] };
const FLOWER: Sprite = { pal: { p: '#f28fb0', y: '#ffe38b' }, rows: ['.p.', 'pyp', '.p.'] };
const BLUE_FLOWER: Sprite = { pal: { p: '#8fb8f2', y: '#fff6c2' }, rows: ['.p.', 'pyp', '.p.'] };
const MUSHROOM: Sprite = { pal: { o: '#3b2418', r: '#d6453a', w: '#fff1d6', s: '#f2e2c0' }, rows: ['..ooo..', '.orwro.', 'orrrwro', 'ooooooo', '..oso..', '..ooo..'] };
const LOG: Sprite = { pal: { o: '#3b2418', b: '#8a5838', r: '#e3b268' }, rows: ['.oooooooo.', 'obbbbbbbro', 'obbbbbbbro', '.oooooooo.'] };
const STUMP: Sprite = { pal: { o: '#3b2418', l: '#e3b268', r: '#c9995a', b: '#8a5838' }, rows: ['oooooo', 'olrrlo', 'obbbbo', 'oooooo'] };
const TUFT: Sprite = { pal: { x: '#4f9a42' }, rows: ['x.x', 'x.x'] };
const SNOW_TUFT: Sprite = { pal: { x: '#b9c7d6' }, rows: ['x.x', 'x.x'] };
const ICE: Sprite = { pal: { o: '#8fb8f2', i: '#d6eefc', I: '#ffffff' }, rows: ['...oooooooooo...', '.ooiiiIiiiiiioo.', 'oiiIiiiiiiIiiiio', 'oiiiiiiIiiiiiiio', '.ooiiiiiiiiiioo.', '...oooooooooo...'] };

// --- Bichos ---
const SHEEP: Sprite = { pal: { o: '#3b3f5a', w: '#ffffff', W: '#e3e6ea', k: '#3b2418' }, rows: ['..oooo..', '.owwwwok', 'owwWwwok', '.owwwwo.', '..k..k..'] };
const COW: Sprite = { pal: { o: '#2c2a33', w: '#ffffff', b: '#3b2418', p: '#f2a6a6', k: '#2c2a33' }, rows: ['.ooooooo...', 'owwbbwwwooo', 'owbbwwwbbwo', 'owwwwwwwwpo', '.oooooooo..', '.k.k..k.k..'] };
const CHICKEN: Sprite = { pal: { w: '#ffffff', r: '#d64d3c', y: '#f2a33a' }, rows: ['.r...', 'wwy..', 'wwww.', '.www.', '.y.y.'] };
const DUCK: Sprite = { pal: { w: '#ffffff', k: '#2c2a33', y: '#f2a33a' }, rows: ['...ww.', '...wky', 'wwwww.', '.www..'] };
const DRAGON: Sprite = { pal: { o: '#233a2e', w: '#3f7a5f', g: '#5aa080', b: '#e8c48a', k: '#233a2e' }, rows: [
  '........oooo........', '.......owwwwo.......', '.oooo.owwwwwwo......', 'oggggoowwwwwwooo....', 'ogkggggggggggggggo..', 'oggggbbbbbbbbbbggggo', '.oooooooooooooooooggo', '..................oo',
] };

// --- Construções e objetos ---
const HOUSE_ROWS = [
  '...oooooooooo...', '..oRRRRRRRRRRo..', '.oRrrrrrrrrrrro.', 'orrrrrrrrrrrrrro', 'oooooooooooooooo', '.owwwwwwwwwwwwo.',
  '.ownnwwwwwwnnwo.', '.ownnwwddwwnnwo.', '.owwwwwddwwwwwo.', '.oWWWWWddWWWWWo.', '.oooooooooooooo.',
];
const HOUSE: Sprite = { pal: { o: '#2c2a33', R: '#8a90b0', r: '#5d6382', w: '#f0dcb2', W: '#cfb184', d: '#7a4a26', n: '#3b3f5a' }, rows: HOUSE_ROWS };
const BARN: Sprite = { pal: { ...HOUSE.pal, R: '#e07a5a', r: '#bf5837' }, rows: HOUSE_ROWS };
const CASTLE: Sprite = { pal: { o: '#3a3f45', G: '#d3d8de', g: '#a7adb5', d: '#7d838c', n: '#2c2f36', p: '#57311f', f: '#d64d3c' }, rows: [
  '..pff.....pff.....pff', '..p.......p.......p..', 'ogogo...ogogo...ogogo', 'ogggo...ogggo...ogggo', 'oGggo...oGngo...oGggo', 'oGngo...oGngo...oGngo',
  'oGggoo.ooGggoo.ooGggo', 'oGggoooooGggoooooGggo', 'oGgggggdgggggdgggggdo', 'oGggggggggggggggggggo', 'oGggggggonnnoggggggdo', 'oGggggggonnnoggggggdo',
  'oGggggggonnnoggggggdo', 'ooooooooooooooooooooo',
] };
const HAY: Sprite = { pal: { o: '#4a3020', l: '#e3b268', b: '#c0843e', d: '#8a5828' }, rows: ['...oo...', '..olbo..', '..olbbo.', '.ollbbo.', '.olbbbdo', 'ollbbbdo', 'oooooooo'] };
const FENCE: Sprite = { pal: { w: '#a86b35' }, rows: ['w...w...w...w', 'wwwwwwwwwwwww', 'w...w...w...w', 'wwwwwwwwwwwww', 'w...w...w...w'] };
const CROPS: Sprite = { pal: { g: '#4fa851', p: '#f2a33a', P: '#c9752a', s: '#8a5838' }, rows: [
  '..g...g...g...', '.pPp.pPp.pPp..', '.PpP.PpP.PpP..', 'ssssssssssssss', '..g...g...g...', '.pPp.pPp.pPp..', '.PpP.PpP.PpP..', 'ssssssssssssss',
] };
const SIGN: Sprite = { pal: { o: '#3b2418', w: '#c9995a', W: '#e3b268', p: '#6b4426' }, rows: ['ooooooo', 'oWWWWWo', 'owwwwwo', 'ooooooo', '...p...', '...p...', '...p...', '..ooo..'] };
const SNOWMAN: Sprite = { pal: { w: '#ffffff', W: '#d6e2ee', o: '#3b3f5a', n: '#f2a33a', h: '#2c2a33', s: '#d64d3c' }, rows: [
  '..hhh..', '.hhhhh.', '..www..', '.wowow.', '.wwwnw.', '.sssss.', 'wwwowww', 'wwWwwWw', 'wwwowww', '.wwwww.', '..WWW..',
] };
const BARREL: Sprite = { pal: { o: '#3b2418', b: '#a86b35', B: '#c9995a', m: '#6b6d80' }, rows: ['.oooo.', 'obBbbo', 'ommmmo', 'obBbbo', 'ommmmo', 'obBbbo', '.oooo.'] };
const BANNER: Sprite = { pal: { p: '#57311f', r: '#7b5ba8', R: '#a98bd4', y: '#f2c453' }, rows: ['p....', 'prrr.', 'pRyr.', 'prrr.', 'pr.r.', 'p....', 'p....', 'p....', 'p....', 'p....'] };
const DOCK: Sprite = { pal: { o: '#57311f', w: '#a86b35' }, rows: ['oooooooooooooooo', 'wwwwwwwwwwwwwwww', 'oooooooooooooooo', '.o....o....o...o', '.o....o....o...o'] };
const BOAT: Sprite = { pal: { o: '#3b2418', s: '#fff1d6', h: '#8a5838', H: '#a86b35' }, rows: [
  '......o.....', '......os....', '......oss...', '......osss..', '......ossss.', '......o.....', 'ohhhhhhhhhho', '.oHHHHHHHHo.', '..oooooooo..',
] };

const at = (sprite: Sprite, x: number, y: number, scale = 2): Placed => ({ sprite, x, y, scale });

/** Pontos ao longo da trilha, para os enfeites não caírem em cima dela */
function trailSamples(points: Point[]): Point[] {
  return points.slice(1).flatMap((point, index) => {
    const [ax, ay] = points[index];
    return Array.from({ length: 16 }, (_, step) => [ax + (point[0] - ax) * step / 16, ay + (point[1] - ay) * step / 16] as Point);
  });
}

type Scatter = [sprites: Sprite[], area: [number, number, number, number], count: number, seed: number];

/** Monta um mundo: posiciona os enfeites fixos e espalha os demais (sorteio fixo) longe da trilha, das paradas e uns dos outros */
function makeWorld(base: Omit<PixelWorld, 'items'>, fixed: Placed[], scatters: Scatter[]): PixelWorld {
  const keepOut: Point[] = [...trailSamples([base.start, ...base.nodes, base.exit]), [65, 260], [65, 215], [110, 285]];
  // As construções das paradas têm ~50 de altura: reserva o espaço delas também
  const taken: Point[] = [...fixed.map(item => [item.x, item.y - 8] as Point), ...base.nodes.flatMap(([x, y]) => [[x, y - 20], [x, y - 42], [x - 20, y - 16], [x + 20, y - 16]] as Point[])];
  const items = [...fixed];
  for (const [sprites, [x0, y0, x1, y1], count, seed] of scatters) {
    let s = seed, added = 0;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let tries = 0; added < count && tries < count * 30; tries += 1) {
      const x = Math.round(x0 + rand() * (x1 - x0)), y = Math.round(y0 + rand() * (y1 - y0));
      // A copa fica acima do pé: mede a distância pelo meio do sprite
      if (keepOut.every(([px, py]) => Math.hypot(px - x, py - (y - 10)) > 30) && taken.every(([px, py]) => Math.hypot(px - x, py - (y - 8)) > 22)) {
        items.push(at(sprites[Math.floor(rand() * sprites.length)], x, y)); taken.push([x, y - 8]); added += 1;
      }
    }
  }
  return { ...base, items: items.sort((a, b) => a.y - b.y) };
}

/** Contorno de água em degraus (cara de pixel): segue os pontos [y, x] de cima para baixo e fecha pela direita */
const coastRight = (edge: [number, number][]) => `M3000 -400H${edge[0][1]}${edge.map(([y, x]) => `V${y}H${x}`).join('')}V800H3000Z`;
/** Lago em degraus: pontos da elipse ligados só por traços retos */
const pond = (cx: number, cy: number, rx: number, ry: number) => {
  const points = Array.from({ length: 16 }, (_, i) => [Math.round((cx + rx * Math.cos(i * Math.PI / 8)) / 4) * 4, Math.round((cy + ry * Math.sin(i * Math.PI / 8)) / 4) * 4]);
  return `M${points[0][0]} ${points[0][1]}${points.slice(1).map(([x, y]) => `H${x}V${y}`).join('')}H${points[0][0]}Z`;
};

const START: Point = [160, 262];

// Mundo 1: o vale do sítio, com o mar à direita
const valleyNodes: Point[] = [[270, 250], [410, 192], [560, 248], [720, 190], [880, 246]];
const valley = makeWorld({
  ground: '#8fd46a', speck: '#79c257', start: START, nodes: valleyNodes, exit: [1080, 252],
  water: [coastRight([[-40, 1160], [20, 1150], [50, 1158], [80, 1144], [110, 1136], [140, 1144], [170, 1154], [200, 1142], [230, 1132], [260, 1124], [340, 1120]])],
  foam: [[1190, 60], [1250, 110], [1210, 170], [1280, 220], [1200, 280], [1300, 40]],
}, [
  at(HILL, 90, 120, 3), at(HILL, 200, 108, 2), at(HILL, 1010, 120, 3),
  at(HOUSE, 300, 96), at(BARN, 352, 84), at(HOUSE, 470, 100), at(CHICKEN, 384, 124), at(CHICKEN, 398, 132), at(CHICKEN, 372, 136),
  at(CROPS, 572, 112), at(CROPS, 612, 112), at(FENCE, 548, 146), at(FENCE, 588, 146), at(FENCE, 628, 146),
  at(SHEEP, 512, 176), at(SHEEP, 538, 182), at(SHEEP, 566, 172), at(COW, 820, 140), at(COW, 856, 150),
  at(HAY, 950, 96), at(HAY, 970, 90), at(HAY, 988, 100), at(SIGN, 196, 240),
  at(DOCK, 1100, 262), at(BOAT, 1240, 150, 3), at(ROCK, 1200, 230), at(ROCK, 1300, 120), at(ROCK, 1270, 290), at(DUCK, 1180, 110),
], [
  [[TREE, TREE, BUSH], [140, 20, 1100, 300], 22, 3],
  [[FLOWER, TUFT, TUFT, BLUE_FLOWER], [140, 20, 1110, 300], 30, 11],
]);

// Mundo 2: a floresta, com um lago grande
const forestNodes: Point[] = [[270, 240], [410, 270], [560, 214], [720, 264], [880, 220]];
const woods = makeWorld({
  ground: '#6cbf55', speck: '#58a845', start: START, nodes: forestNodes, exit: [1080, 252],
  water: [pond(1210, 120, 92, 46), 'M1198 160h26V420h-26Z'],
  foam: [[1170, 110], [1230, 130], [1206, 240]],
}, [
  at(DUCK, 1180, 112), at(DUCK, 1236, 124), at(LOG, 640, 160), at(STUMP, 500, 286), at(STUMP, 980, 180), at(LOG, 960, 296),
  at(MUSHROOM, 470, 300), at(MUSHROOM, 482, 304), at(MUSHROOM, 820, 170), at(SIGN, 196, 240), at(ROCK, 1060, 200),
], [
  [[PINE, PINE, TREE], [140, 10, 1120, 170], 46, 7],
  [[PINE, TREE, BUSH], [140, 180, 1150, 300], 18, 21],
  [[PINE, TREE], [1120, 180, 1350, 300], 8, 5],
  [[TUFT, FLOWER, TUFT, MUSHROOM], [140, 160, 1120, 300], 22, 17],
]);

// Mundo 3: montanhas nevadas
const mountainNodes: Point[] = [[270, 262], [410, 214], [560, 262], [720, 216], [880, 262]];
const PEAKS: [number, number, number][] = [[140, 118, 4], [240, 104, 5], [350, 122, 4], [460, 100, 5], [580, 120, 4], [690, 102, 5], [810, 120, 4], [930, 98, 5], [1050, 118, 4], [1160, 102, 5], [1270, 120, 4]];
const peaks = makeWorld({
  ground: '#eef3f7', speck: '#d3dde8', start: START, nodes: mountainNodes, exit: [1080, 248],
  water: [], foam: [],
}, [
  ...PEAKS.map(([x, y, scale]) => at(SNOWY, x, y, scale)),
  at(ICE, 1000, 186, 3), at(SNOWMAN, 500, 186), at(SNOWMAN, 1200, 270), at(LOG, 640, 290), at(SIGN, 196, 240),
], [
  [[PINE, PINE, ROCK], [140, 130, 1340, 300], 26, 13],
  [[SNOW_TUFT, SNOW_TUFT, BLUE_FLOWER], [140, 130, 1340, 300], 20, 29],
]);

// Mundo 4: o castelo, com o dragão dormindo no caminho
const castleNodes: Point[] = [[270, 255], [410, 205], [560, 255], [720, 205], [880, 250]];
const dragonCastle = makeWorld({
  ground: '#9cc072', speck: '#86aa5e', start: START, nodes: castleNodes, exit: [1118, 266],
  water: [coastRight([[200, 1310], [220, 1290], [244, 1272], [270, 1262], [340, 1256]])],
  foam: [[1300, 280]],
}, [
  at(MOUNTAIN, 140, 110, 4), at(MOUNTAIN, 240, 96, 3), at(HILL, 920, 110, 3),
  at(DRAGON, 600, 182, 4), at(CASTLE, 1180, 268, 5), at(BANNER, 1100, 236), at(BANNER, 1262, 236),
  at(BARREL, 1010, 262), at(BARREL, 1024, 270), at(HAY, 980, 150), at(HAY, 1000, 144), at(SIGN, 196, 240),
], [
  [[TREE, PINE, TREE, BUSH], [140, 20, 1120, 300], 30, 41],
  [[TUFT, FLOWER, TUFT, ROCK], [140, 120, 1150, 300], 22, 43],
]);

export const PIXEL_WORLDS: PixelWorld[] = [valley, woods, peaks, dragonCastle];

/** Converte um sprite em um <path> por cor, juntando pixels vizinhos da mesma linha */
const cache = new Map<Sprite, { fill: string; d: string }[]>();
export function spritePaths(sprite: Sprite) {
  const cached = cache.get(sprite);
  if (cached) return cached;
  const byColor = new Map<string, string[]>();
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const key = row[x];
      let end = x;
      while (end < row.length && row[end] === key) end += 1;
      if (key !== '.' && sprite.pal[key]) byColor.set(key, [...(byColor.get(key) ?? []), `M${x} ${y}h${end - x}v1h${x - end}Z`]);
      x = end;
    }
  });
  const paths = [...byColor].map(([key, parts]) => ({ fill: sprite.pal[key], d: parts.join('') }));
  cache.set(sprite, paths);
  return paths;
}
