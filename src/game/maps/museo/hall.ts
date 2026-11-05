import { MapBuilder } from '../MapBuilder';

const BONE = 0xe8dfc8, BONE2 = 0xd8cdb0, STONE = 0xb8b2a4, MARBLE = 0xece7dc;

/** Esqueleto de dinosaurio en el centro del gran salón: cola en escalones, espinazo transitable y costillas. */
export function dinosaur(b: MapBuilder) {
  b.box(-0.4, 0.4, 0, 1.2, -17, -14.6, BONE2);   // cola (se sube saltando)
  b.box(-0.4, 0.4, 0, 2.4, -14.6, -12.2, BONE2);
  b.box(-0.4, 0.4, 0, 3.6, -12.2, -9.8, BONE2);
  b.box(-0.7, 0.7, 3.0, 4.6, -9.8, 4, BONE);       // espinazo (y = 4,6 arriba)
  for (const [z0, z1] of [[-4, -2.4], [0.6, 2.2]] as const) { b.box(-1.5, -0.7, 0, 4.6, z0, z1, BONE2); b.box(0.7, 1.5, 0, 4.6, z0, z1, BONE2); }   // patas
  for (const z of [-7, -5.5, -4, -2.5, -1]) {      // costillas
    b.box(-1.7, -1.3, 4.6, 7.0, z, z + 0.3, BONE); b.box(1.3, 1.7, 4.6, 7.0, z, z + 0.3, BONE);
    b.deco(-1.7, 1.7, 7.0, 7.3, z, z + 0.3, BONE);
  }
  b.box(-0.4, 0.4, 4.0, 5.6, 4, 5.4, BONE); b.box(-0.4, 0.4, 4.4, 6.4, 5.4, 6.8, BONE);   // cuello
  b.box(-1.0, 1.0, 5.4, 7.6, 6.8, 10, BONE);        // cráneo
  b.deco(-1.1, -0.6, 6.6, 7.0, 9.9, 10.05, 0x222222); b.deco(0.6, 1.1, 6.6, 7.0, 9.9, 10.05, 0x222222);
  b.box(-3.2, 3.2, 0, 0.5, -18, -8.5, STONE);      // peana con placa
  b.deco(-1.5, 1.5, 0.5, 0.9, 10.5, 11.2, 0xc9a96e);
}

/** Decoración del gran salón: bancos, mostrador de información, plantas, pedestales y columnas. */
export function hallDecor(b: MapBuilder) {
  for (const z of [18, 24]) { b.box(-12.8, -10, 0, 1.0, z - 0.5, z + 0.5, 0x8a5a3a); }
  b.box(8, 12.6, 0, 2.6, 22, 26, 0x6b4a2b); b.deco(8, 12.6, 2.6, 2.75, 22, 26, 0xd9d1c0);   // mostrador
  for (const [x, z] of [[-12.5, 4], [12.5, 4], [-12.5, 11], [12.5, 11]] as const) { b.box(x - 0.7, x + 0.7, 0, 1.2, z - 0.7, z + 0.7, 0x8a5a3a); b.deco(x - 0.5, x + 0.5, 1.2, 2.8, z - 0.5, z + 0.5, 0x4aa24a); }
  for (const x of [-9.5, 9.5]) for (const z of [8, 20]) b.box(x - 0.7, x + 0.7, 0, 7, z - 0.7, z + 0.7, MARBLE, {});   // columnas
  b.deco(-0.6, 0.6, 0.03, 0.07, 12, 28, 0x9a2b2b);   // alfombra roja de entrada
}

export function entrance(b: MapBuilder) {
  b.deco(-4, 4, 0, 6, 27.88, 28, 0x5a3a22); b.deco(-4.4, 4.4, 6, 6.6, 27.85, 28, 0xc9a96e);
  for (const x of [-30, -20, 20, 30]) { b.deco(x - 2, x + 2, 2.6, 5.4, 27.88, 28, 0x9fd3f5); b.deco(x - 2, x + 2, 2.6, 5.4, -28, -27.88, 0x9fd3f5); }
}
