import { MapBuilder, C } from '../MapBuilder';
import { holeRails } from '../common';
import { bed, chair, shelves, table, windowZ } from '../casa/furniture';

export const LEVELS = 4;
export const H = 8;                               // altura entre pisos
export const X0 = -30, X1 = 30, Z0 = -18, Z1 = 18;
export const BAND: [number, number] = [-4, 14];   // franja donde viven las escaleras

/** Tramos de escalera: columna x, hacia dónde sube, piso de partida. Los 3 primeros suben, los otros 3 bajan. */
export interface Flight { x0: number; x1: number; dir: '+z' | '-z'; fromLevel: number; hole: number }
export const UP: Flight[] = [
  { x0: -28, x1: -23, dir: '-z', fromLevel: 0, hole: 1 },
  { x0: -18, x1: -13, dir: '+z', fromLevel: 1, hole: 2 },
  { x0: -8, x1: -3, dir: '-z', fromLevel: 2, hole: 3 },
];
export const DOWN: Flight[] = [
  { x0: 3, x1: 8, dir: '-z', fromLevel: 2, hole: 3 },
  { x0: 13, x1: 18, dir: '+z', fromLevel: 1, hole: 2 },
  { x0: 23, x1: 28, dir: '-z', fromLevel: 0, hole: 1 },
];
const FLIGHTS = [...UP, ...DOWN];

type Piece = [number, number, number, number];

/** Piezas de losa de un piso: el rectángulo completo menos los huecos de sus escaleras. */
export function slabPieces(level: number): Piece[] {
  const holes = FLIGHTS.filter((f) => f.hole === level).sort((a, b) => a.x0 - b.x0);
  const pieces: Piece[] = [[X0, X1, Z0, BAND[0]], [X0, X1, BAND[1], Z1]];
  let cur = X0;
  for (const h of holes) { if (h.x0 > cur) pieces.push([cur, h.x0, BAND[0], BAND[1]]); cur = h.x1; }
  pieces.push([cur, X1, BAND[0], BAND[1]]);
  return pieces;
}

const PATTERNS: Array<[string, 'planks' | 'carpet' | 'tiles']> = [['#b98e62', 'planks'], ['#a79cc0', 'carpet'], ['#e8e0cf', 'tiles'], ['#c0925a', 'planks']];
const LABELS = ['SALÓN', 'DORMITORIOS', 'BIBLIOTECA', 'ÁTICO'];

/** Estructura de toda la torre: muros, losas con huecos, escaleras, barandas y tabiques. */
export function buildStructure(b: MapBuilder) {
  const top = H * LEVELS;
  b.box(X0 - 1, X0, 0, top, Z0 - 1, Z1 + 1, C.WALL_OUT); b.box(X1, X1 + 1, 0, top, Z0 - 1, Z1 + 1, C.WALL_OUT);
  b.box(X0 - 1, X1 + 1, 0, top, Z0 - 1, Z0, C.WALL_OUT); b.box(X0 - 1, X1 + 1, 0, top, Z1, Z1 + 1, C.WALL_OUT);
  for (let L = 0; L < LEVELS; L++) {
    const y = H * L;
    if (L > 0) for (const [a, c, d, e] of slabPieces(L)) b.box(a, c, y - 1, y, d, e, C.SLAB);
    const [base, pat] = PATTERNS[L];
    for (const [a, c, d, e] of L === 0 ? [[X0, X1, Z0, Z1] as Piece] : slabPieces(L)) b.floor(a, c, d, e, base, { y: y + 0.03, pattern: pat, label: c - a > 20 && e - d > 10 ? LABELS[L] : undefined });
    // tabiques que forman tres cuartos en la franja norte (con puerta)
    for (const x of [-10, 10]) b.wallZ(x, 1, Z0, -11, y, y + 7, C.WALL_IN, [[-16, -12]]);
    // ventanas en el muro sur
    for (const [a, c] of [[-26, -20], [-6, 0], [12, 18], [24, 28]] as const) windowZ(b, a, c, y + 2.2, y + 5.2, Z1, -1);
    windowZ(b, -6, 0, y + 2.2, y + 5.2, Z0, 1);
  }
  const col = [0xb88555, 0xa0764a, 0x9a6a44, 0x8c5f3b, 0xb88555, 0xa0764a];
  FLIGHTS.forEach((f, i) => {
    const y = f.fromLevel * H;
    b.stairs(f.x0, f.x1, BAND[0], BAND[1], f.dir, 20, 0.4, col[i], y);
    // paredes a los lados del tramo, para que nadie se caiga por el costado (las puntas quedan abiertas)
    b.box(f.x0 - 0.5, f.x0, y, y + H - 0.2, BAND[0], BAND[1], C.WALL_IN);
    b.box(f.x1, f.x1 + 0.5, y, y + H - 0.2, BAND[0], BAND[1], C.WALL_IN);
  });
  // barandas alrededor de cada hueco, abiertas por donde se sale de la escalera
  for (const f of FLIGHTS) holeRails(b, f.hole * H, f.x0, f.x1, BAND[0], BAND[1], f.dir === '-z' ? '-z' : '+z', C.WOOD2);
}

/** Amueblado de cada piso, solo en la franja norte (z ≤ -11) para dejar libres los pasillos. */
export function buildFurniture(b: MapBuilder) {
  // L0: salón, cocina y comedor
  b.box(-28, -20, 0, 1.8, -16, -12.5, C.FAB); b.box(-28, -20, 1.8, 3.6, -17.4, -16, C.FAB);   // sofá
  b.box(-17, -13, 0, 1.4, -15, -12.5, C.WOOD); b.box(-29.9, -29.3, 1.8, 4.4, -16, -12, C.BLACK);
  b.box(-8, 8, 0, 3, -17.6, -14.6, C.WHITE); b.box(8, 9, 0, 6.4, -17.6, -14.6, C.STEEL);       // cocina y nevera
  table(b, -3, 4, -13.5, -11.4, 2.8); chair(b, -1, -10.8, '-z', 0); chair(b, 2, -10.8, '-z', 0);
  b.box(16, 28, 0, 2.6, -17.5, -15, C.WOOD2); shelves(b, 22, 29.5, -17.8, -17, [1.6, 3.2], true, 3, 0.4);
  // L1: dormitorios
  bed(b, -28, -20, -17.5, -11.5, H, '-z', C.FAB2); bed(b, -6, 2, -17.5, -11.5, H, '-z', C.BLUE); bed(b, 14, 22, -17.5, -11.5, H, '-z', C.FAB3);
  b.box(-18, -14, H, H + 2.4, -17.5, -15, C.WOOD2); b.box(24, 29.5, H, H + 5, -17.5, -15, C.WOOD3);
  table(b, 3.5, 8.5, -17.5, -14.5, 2.6, H);
  // L2: biblioteca (baldas en zigzag que se suben saltando)
  const Y2 = 2 * H;
  shelves(b, -29.5, -12, -18, -16.6, [Y2 + 1.6, Y2 + 3.2, Y2 + 4.8], true, 2);
  shelves(b, -8, 8, -18, -16.6, [Y2 + 1.6, Y2 + 3.2, Y2 + 4.8], true, 5);
  shelves(b, 12, 29.5, -18, -16.6, [Y2 + 1.6, Y2 + 3.2, Y2 + 4.8], true, 8);
  table(b, -25, -18, -14, -11.8, 2.4, Y2); chair(b, -21.5, -11.4, '-z', Y2, C.GREEN); b.box(14, 20, Y2, Y2 + 1.8, -14.5, -12, C.FAB);
  // L3: ático con gimnasio de gatos
  const Y3 = 3 * H;
  for (const [x, h] of [[-28, 1.6], [-24, 3.2], [-20, 4.8]] as const) b.box(x, x + 4, Y3, Y3 + h, -17.8, -12, 0, { climb: true });
  b.box(-14, -12.8, Y3, Y3 + 5, -17, -15.8, 0, { climb: true }); b.box(12.8, 14, Y3, Y3 + 5, -17, -15.8, 0, { climb: true });
  b.box(-6, 6, Y3, Y3 + 1.2, -17.5, -14, C.BOX); b.box(18, 26, Y3, Y3 + 1.6, -17, -13, C.FAB2);
  b.deco(-28, -16, Y3 + 1.6, Y3 + 1.7, -17.8, -12, 0x8e6bb0);
}
