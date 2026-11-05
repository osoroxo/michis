import { MapBuilder, C } from '../MapBuilder';

const BOOK_COLORS = [0xc0392b, 0x2e86c1, 0x27ae60, 0xf1c40f, 0x8e44ad, 0xe67e22, 0xecf0f1];

/** Libros decorativos (sin colisión) sobre una balda. */
function books(b: MapBuilder, x0: number, x1: number, y: number, z0: number, z1: number, alongX: boolean, seed: number) {
  const len = alongX ? x1 - x0 : z1 - z0;
  for (let t = 0.2, i = 0; t < len - 0.5; i++) {
    const w = 0.3 + ((seed + i * 7) % 4) * 0.12, h = 0.7 + ((seed + i * 3) % 5) * 0.12;
    const col = BOOK_COLORS[(seed + i) % BOOK_COLORS.length];
    if ((i + seed) % 5 !== 0) {
      if (alongX) b.deco(x0 + t, x0 + t + w, y, y + h, z0 + 0.2, z1 - 0.2, col);
      else b.deco(x0 + 0.2, x1 - 0.2, y, y + h, z0 + t, z0 + t + w, col);
    }
    t += w + 0.05 + ((seed + i) % 3 === 0 ? 0.6 : 0);
  }
}

/**
 * Estantería de baldas saltables. `tops` son las alturas de cada balda; las baldas son sólidas
 * (se puede subir de una a otra saltando) y los laterales llegan hasta la balda más alta.
 * `alongX`: la estantería se extiende en X (pegada a un muro Z); si no, en Z (pegada a un muro X).
 */
export function shelves(b: MapBuilder, x0: number, x1: number, z0: number, z1: number, tops: number[], alongX: boolean, seed = 1, side = 0.5, thick = 0.4) {
  const hi = Math.max(...tops);
  // Baldas en zigzag: las pares ocupan la mitad baja y las impares la alta (con solape), así cada balda
  // deja libre un hueco por encima de la anterior y se puede subir saltando de una a otra.
  const [a0, a1] = alongX ? [x0, x1] : [z0, z1], span = a1 - a0;
  tops.forEach((t, i) => {
    const [p0, p1] = i % 2 === 0 ? [a0, a0 + span * 0.58] : [a0 + span * 0.42, a1];
    if (alongX) { b.box(p0, p1, t - thick, t, z0, z1, C.WOOD3); if (t < hi || tops.length < 3) books(b, p0, p1, t, z0, z1, true, seed + i * 3); }
    else { b.box(x0, x1, t - thick, t, p0, p1, C.WOOD3); if (t < hi || tops.length < 3) books(b, x0, x1, t, p0, p1, false, seed + i * 3); }
  });
  if (alongX) { b.box(x0, x0 + side, 0, hi, z0, z1, C.WOOD2); b.box(x1 - side, x1, 0, hi, z0, z1, C.WOOD2); }
  else { b.box(x0, x1, 0, hi, z0, z0 + side, C.WOOD2); b.box(x0, x1, 0, hi, z1 - side, z1, C.WOOD2); }
}

/** Mesa con cuatro patas. */
export function table(b: MapBuilder, x0: number, x1: number, z0: number, z1: number, h: number, y = 0, top = C.WOOD, leg = C.WOOD2) {
  b.box(x0, x1, y + h - 0.4, y + h, z0, z1, top);
  for (const [x, z] of [[x0, z0], [x1 - 0.5, z0], [x0, z1 - 0.5], [x1 - 0.5, z1 - 0.5]] as const) b.box(x, x + 0.5, y, y + h - 0.4, z, z + 0.5, leg);
}

/** Silla: asiento + respaldo. `back` = lado del respaldo (+z, -z, +x, -x). */
export function chair(b: MapBuilder, cx: number, cz: number, back: '+z' | '-z' | '+x' | '-x', y = 0, col: number = C.FAB3) {
  b.box(cx - 0.9, cx + 0.9, y, y + 1.5, cz - 0.9, cz + 0.9, col);
  const t = 0.3, h = 3.2;
  if (back === '+z') b.box(cx - 0.9, cx + 0.9, y + 1.5, y + h, cz + 0.9 - t, cz + 0.9, col);
  if (back === '-z') b.box(cx - 0.9, cx + 0.9, y + 1.5, y + h, cz - 0.9, cz - 0.9 + t, col);
  if (back === '+x') b.box(cx + 0.9 - t, cx + 0.9, y + 1.5, y + h, cz - 0.9, cz + 0.9, col);
  if (back === '-x') b.box(cx - 0.9, cx - 0.9 + t, y + 1.5, y + h, cz - 0.9, cz + 0.9, col);
}

/** Cama: base, colchón, almohadas y cabecero contra el muro `head`. */
export function bed(b: MapBuilder, x0: number, x1: number, z0: number, z1: number, y: number, head: '+z' | '-z' | '+x' | '-x', sheet: number) {
  b.box(x0, x1, y, y + 1.0, z0, z1, C.WOOD2);
  b.box(x0 + 0.2, x1 - 0.2, y + 1.0, y + 1.9, z0 + 0.2, z1 - 0.2, sheet);
  const hb = 3.0, t = 0.4;
  if (head === '-z') { b.box(x0, x1, y, y + hb, z0, z0 + t, C.WOOD); b.deco(x0 + 0.6, x0 + 2.4, y + 1.9, y + 2.4, z0 + t, z0 + t + 1.4, C.WHITE); b.deco(x1 - 2.4, x1 - 0.6, y + 1.9, y + 2.4, z0 + t, z0 + t + 1.4, C.WHITE); }
  if (head === '+z') { b.box(x0, x1, y, y + hb, z1 - t, z1, C.WOOD); b.deco(x0 + 0.6, x0 + 2.4, y + 1.9, y + 2.4, z1 - t - 1.4, z1 - t, C.WHITE); b.deco(x1 - 2.4, x1 - 0.6, y + 1.9, y + 2.4, z1 - t - 1.4, z1 - t, C.WHITE); }
  if (head === '-x') { b.box(x0, x0 + t, y, y + hb, z0, z1, C.WOOD); b.deco(x0 + t, x0 + t + 1.4, y + 1.9, y + 2.4, z0 + 0.6, z0 + 2.4, C.WHITE); b.deco(x0 + t, x0 + t + 1.4, y + 1.9, y + 2.4, z1 - 2.4, z1 - 0.6, C.WHITE); }
  if (head === '+x') { b.box(x1 - t, x1, y, y + hb, z0, z1, C.WOOD); b.deco(x1 - t - 1.4, x1 - t, y + 1.9, y + 2.4, z0 + 0.6, z0 + 2.4, C.WHITE); b.deco(x1 - t - 1.4, x1 - t, y + 1.9, y + 2.4, z1 - 2.4, z1 - 0.6, C.WHITE); }
}

/** Ventana decorativa en un muro (marco + vidrio), pegada a la cara interior. */
export function windowZ(b: MapBuilder, x0: number, x1: number, y0: number, y1: number, zFace: number, inward: 1 | -1) {
  const a = zFace, c = zFace + 0.12 * inward;
  b.deco(x0 - 0.2, x1 + 0.2, y0 - 0.2, y1 + 0.2, Math.min(a, c), Math.max(a, c), C.TRIM);
  const g1 = zFace + 0.2 * inward;
  b.deco(x0, x1, y0, y1, Math.min(a, g1), Math.max(a, g1), C.GLASS);
  b.deco((x0 + x1) / 2 - 0.08, (x0 + x1) / 2 + 0.08, y0, y1, Math.min(a, g1), Math.max(a, g1) + 0.02 * inward, C.TRIM);
}

export function windowX(b: MapBuilder, z0: number, z1: number, y0: number, y1: number, xFace: number, inward: 1 | -1) {
  const a = xFace, c = xFace + 0.12 * inward;
  b.deco(Math.min(a, c), Math.max(a, c), y0 - 0.2, y1 + 0.2, z0 - 0.2, z1 + 0.2, C.TRIM);
  const g1 = xFace + 0.2 * inward;
  b.deco(Math.min(a, g1), Math.max(a, g1), y0, y1, z0, z1, C.GLASS);
}
