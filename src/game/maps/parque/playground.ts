import { MapBuilder } from '../MapBuilder';

const WOOD = 0xb88555, RED = 0xd9534f, BLUE = 0x4f9bd9, YEL = 0xf1c40f;

/** Parque infantil: castillo con escalera y tobogán, postes de escalada, columpios y arenero. */
export function playground(b: MapBuilder) {
  // Castillo: escalera de 10 peldaños (0,4) hasta una plataforma de 4 de alto y tobogán de bajada
  b.box(40, 46, 0, 4, 12, 18, WOOD);
  b.stairs(31, 40, 14, 17, '+x', 10, 0.4, 0x9a6a44);
  b.stairs(41, 44, 18, 24.5, '-z', 10, 0.4, RED);
  b.deco(40, 46, 4, 5.2, 12, 12.3, BLUE); b.deco(40, 46, 4, 5.2, 17.7, 18, BLUE); b.deco(45.7, 46, 4, 5.2, 12, 18, BLUE);
  b.box(41.5, 44.5, 4, 7.4, 13.5, 16.5, YEL);                  // torreta (3,4 más arriba)
  // Postes de escalada de sisal
  for (const [x, h] of [[34, 3], [38, 5], [42, 7]] as const) b.box(x, x + 1.2, 0, h, -12, -10.8, 0, { climb: true });
  // Columpios: dos pórticos de corteza con viga transitable arriba
  for (const x of [38, 47]) b.box(x, x + 0.9, 0, 6.5, -26, -25.1, 0, { climb: true, tex: 'bark' });
  b.box(38, 47.9, 6.0, 6.5, -26, -25.1, 0x7c5236);
  for (const x of [40, 43.5]) { b.deco(x, x + 0.1, 2, 6, -25.8, -25.7, 0x333333); b.deco(x - 0.6, x + 0.8, 1.6, 2.0, -26, -25, RED); }
  b.deco(36, 50, 0.03, 0.07, -29, -21, 0xe8d6a0);              // arena
  // Arenero
  b.deco(33, 39, 0.03, 0.07, 24, 30, 0xe8d6a0);
  for (const [x0, x1, z0, z1] of [[33, 39, 23.6, 24], [33, 39, 30, 30.4], [32.6, 33, 24, 30], [39, 39.4, 24, 30]] as const) b.box(x0, x1, 0, 0.8, z0, z1, WOOD);
}
