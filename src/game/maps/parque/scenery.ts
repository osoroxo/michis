import { MapBuilder } from '../MapBuilder';

const GREEN = 0x4f8f4a, LEAF = 0x3f8f3f, LEAF2 = 0x58b24f, WOOD = 0xb88555, STONE = 0xcfc9bc, IRON = 0x4a4a55;

/** Árbol: tronco de corteza que se trepa hasta una cima de 6,4 de alto; la copa es solo decoración. */
export function tree(b: MapBuilder, x: number, z: number, h = 6.4) {
  b.box(x - 0.9, x + 0.9, 0, h, z - 0.9, z + 0.9, 0, { climb: true, tex: 'bark' });
  b.deco(x - 3.4, x + 3.4, h + 0.5, h + 2.8, z - 3.4, z + 3.4, LEAF);
  b.deco(x - 2.2, x + 2.2, h + 2.8, h + 4.2, z - 2.2, z + 2.2, LEAF2);
}

export function bush(b: MapBuilder, x: number, z: number, s = 1.8) {
  b.box(x - s / 2, x + s / 2, 0, 1.4, z - s / 2, z + s / 2, GREEN);
  b.deco(x - s / 2 + 0.2, x + s / 2 - 0.2, 1.4, 1.9, z - s / 2 + 0.2, z + s / 2 - 0.2, LEAF2);
}

/** Banca: `facing` indica hacia dónde mira el asiento. */
export function bench(b: MapBuilder, x: number, z: number, alongX: boolean) {
  const [a, c] = alongX ? [1.6, 0.5] : [0.5, 1.6];
  b.box(x - a, x + a, 0, 1.1, z - c, z + c, WOOD);
  if (alongX) b.box(x - a, x + a, 1.1, 2.1, z + c - 0.25, z + c, WOOD); else b.box(x + a - 0.25, x + a, 1.1, 2.1, z - c, z + c, WOOD);
  b.deco(x - a, x - a + 0.3, 0, 0.1, z - c, z + c, IRON);
}

export function lamp(b: MapBuilder, x: number, z: number) {
  b.box(x - 0.2, x + 0.2, 0, 6, z - 0.2, z + 0.2, IRON);
  b.deco(x - 0.6, x + 0.6, 6, 6.8, z - 0.6, z + 0.6, 0xffe9a0);
}

/** Estanque con fuente: ralentiza (zona `puddle` del mapa). */
export function pond(b: MapBuilder) {
  b.deco(-14, 14, 0.03, 0.1, -9, 9, 0x6fc3e8);
  for (const [x0, x1, z0, z1] of [[-14.6, 14.6, -9.6, -9], [-14.6, 14.6, 9, 9.6], [-14.6, -14, -9, 9], [14, 14.6, -9, 9]] as const) b.deco(x0, x1, 0, 0.5, z0, z1, STONE);
  b.box(-1, 1, 0, 2.4, -1, 1, STONE);                         // fuente
  b.deco(-3, 3, 0, 0.9, -3, 3, 0xb8b2a4);
  b.deco(-0.3, 0.3, 2.4, 3.6, -0.3, 0.3, 0x9fe3ff);
  for (const [x, z] of [[-8, -4], [6, 5], [9, -5], [-6, 6]] as const) b.deco(x - 0.8, x + 0.8, 0.1, 0.16, z - 0.8, z + 0.8, 0x4aa24a);   // nenúfares
}

/** Colina de terrazas de 0,4 de alto cada una: se sube andando. */
export function hill(b: MapBuilder, cx: number, cz: number) {
  const cols = [0x5a9c4e, 0x62a755, 0x6bb35c, 0x74bf64, 0x7fca6e];
  for (let i = 0; i < 5; i++) {
    const w = 8 - 1.6 * i, d = 18 - 1.6 * i;
    b.box(cx - w / 2, cx + w / 2, 0, 0.4 * (i + 1), cz - d / 2, cz + d / 2, cols[i]);
  }
  b.deco(cx - 0.1, cx + 0.1, 2.0, 4.0, cz - 0.1, cz + 0.1, 0xeeeeee); b.deco(cx + 0.1, cx + 1.3, 3.2, 4.0, cz - 0.1, cz + 0.1, 0xe0527a);   // bandera
}

/** Glorieta de madera con tejado transitable: se trepa por los pilares de piedra. */
export function gazebo(b: MapBuilder, x0: number, z0: number) {
  b.box(x0, x0 + 7, 0, 1.2, z0, z0 + 7, WOOD);
  b.stairs(x0 - 2.4, x0, z0 + 2, z0 + 5, '+x', 3, 0.4, 0x9a6a44);
  for (const [px, pz] of [[0, 0], [6.2, 0], [0, 6.2], [6.2, 6.2]] as const) b.box(x0 + px, x0 + px + 0.8, 1.2, 5.4, z0 + pz, z0 + pz + 0.8, 0, { climb: true, tex: 'stone' });
  b.box(x0, x0 + 7, 5.0, 5.4, z0, z0 + 7, 0xa0522d);          // tejado
  b.deco(x0 + 2, x0 + 5, 5.4, 6.6, z0 + 2, z0 + 5, 0x8b4513);
}

export function picnic(b: MapBuilder, x: number, z: number) {
  b.box(x - 2.5, x + 2.5, 0, 1.8, z - 1.3, z + 1.3, WOOD);
  b.box(x - 2.5, x + 2.5, 0, 1.0, z - 2.8, z - 1.6, WOOD); b.box(x - 2.5, x + 2.5, 0, 1.0, z + 1.6, z + 2.8, WOOD);
  b.deco(x - 1, x + 1, 1.8, 1.95, z - 0.6, z + 0.6, 0xd9534f);
}
