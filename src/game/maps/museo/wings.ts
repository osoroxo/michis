import { MapBuilder } from '../MapBuilder';
import { shelves } from '../casa/furniture';

const MARBLE = 0xece7dc, STONE = 0xb8b2a4, DARK = 0x3d3a48, GLASS = 0x9fd3f5, GOLD = 0xc9a96e;

const caseOf = (b: MapBuilder, x: number, z: number, w: number, d: number, y = 0) => {
  b.box(x - w / 2, x + w / 2, y, y + 1.2, z - d / 2, z + d / 2, DARK);
  b.deco(x - w / 2 + 0.1, x + w / 2 - 0.1, y + 1.2, y + 2.6, z - d / 2 + 0.1, z + d / 2 - 0.1, GLASS);
  b.deco(x - 0.3, x + 0.3, y + 1.2, y + 1.9, z - 0.3, z + 0.3, GOLD);
};

const statue = (b: MapBuilder, x: number, z: number, y = 0, col = 0xcfcfcf) => {
  b.box(x - 1, x + 1, y, y + 1.6, z - 1, z + 1, STONE);
  b.box(x - 0.5, x + 0.5, y + 1.6, y + 4.0, z - 0.5, z + 0.5, col);
  b.deco(x - 0.4, x + 0.4, y + 4.0, y + 4.8, z - 0.4, z + 0.4, col);
};

/** Ala egipcia (oeste): pirámide escalonada de piedra contra el borde del entrepiso, obelisco y sarcófagos. */
export function egyptWing(b: MapBuilder) {
  for (let k = 0; k < 5; k++) b.box(-34, -20, 0, 1.6 * (k + 1), -6, 8 - 2.8 * k, 0, { climb: true, tex: 'stone' });   // la cima (8,0) toca el entrepiso
  b.deco(-33.6, -20.4, 8, 8.06, -6, -3.2, 0xd9c08a);
  b.box(-22, -20.8, 0, 7.4, 16, 17.2, 0, { climb: true, tex: 'stone' });                  // obelisco
  for (const x of [-38, -32, -26]) { b.box(x - 1.2, x + 1.2, 0, 1.4, 20, 24, STONE); b.deco(x - 1, x + 1, 1.4, 1.9, 20.2, 23.8, GOLD); }   // sarcófagos
  for (const z of [4, 14, 22]) b.box(-39.5, -38.5, 0, 6.5, z - 0.5, z + 0.5, MARBLE);       // columnas junto al muro
  caseOf(b, -30, 14, 4, 2); caseOf(b, -36, 12, 3, 2);
  b.deco(-39.9, -39.8, 2.4, 5.6, 8, 14, 0xc9a96e); b.deco(-39.9, -39.8, 2.4, 5.6, 18, 24, 0xa77b4d);   // relieves
  b.deco(-33, -23, 0.03, 0.07, 14, 24, 0xa8452a);
}

/** Galería de arte (este): estatuas sobre pedestales, vitrinas, bancos y cuadros. */
export function artWing(b: MapBuilder) {
  for (const [x, z] of [[20, -4], [20, 6], [36, -4], [36, 6], [28, 14], [28, 24]] as const) statue(b, x, z);
  caseOf(b, 26, 0, 5, 2); caseOf(b, 32, 2, 3, 2); caseOf(b, 22, 20, 4, 2);
  for (const [x, z, ax] of [[24, 10, true], [32, 10, true], [38, 18, false]] as const) {
    if (ax) b.box(x - 1.6, x + 1.6, 0, 1.0, z - 0.5, z + 0.5, 0x8a5a3a); else b.box(x - 0.5, x + 0.5, 0, 1.0, z - 1.6, z + 1.6, 0x8a5a3a);
  }
  const cols = [0xc0392b, 0x2e86c1, 0xf1c40f, 0x27ae60, 0x8e44ad, 0xe67e22];
  cols.forEach((c, i) => { b.deco(16 + i * 4, 18.6 + i * 4, 3, 5.4, 27.85, 28, c); b.deco(16 + i * 4, 18.6 + i * 4, 3, 5.4, -28, -27.85, cols[(i + 2) % 6]); });
  for (const z of [-20, -12, 4, 12]) b.deco(39.85, 39.95, 3, 5.6, z - 2, z + 2, cols[(z + 40) % 6 | 0]);
}

/** Entrepisos: baldas de papiros (oeste), vitrinas y bancos (este), puente sobre el salón. */
export function mezzanine(b: MapBuilder) {
  const Y = 8;
  shelves(b, -38, -22, -28, -26.4, [Y + 1.6, Y + 3.2, Y + 4.8], true, 7);
  caseOf(b, -30, -16, 5, 2.4, Y); caseOf(b, -22, -10, 3, 2, Y); caseOf(b, -36, -10, 3, 2, Y);
  caseOf(b, 24, -16, 5, 2.4, Y); caseOf(b, 32, -10, 3, 2, Y); caseOf(b, 36, -20, 3, 2, Y);
  statue(b, 22, -22, Y, 0xb8a47a); statue(b, 38, -12, Y, 0xb8a47a);
  b.box(18, 21.2, Y, Y + 1.0, -9, -7.5, 0x8a5a3a);
  b.deco(-4, 4, Y + 0.03, Y + 0.07, -27, -21, 0x9a2b2b);
}
