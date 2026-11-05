import { MapBuilder, C, LV } from '../MapBuilder';
import { windowX, windowZ } from './furniture';

/** Estructura de la casa: muros exteriores e interiores, losa del piso 2, escaleras, barandillas y suelos. */
export function buildShell(b: MapBuilder) {
  const { ceil, slabTop: F2, roof } = LV;
  // ---- Muros exteriores (dos plantas) ----
  b.box(-41, -40, 0, roof, -29, 29, C.WALL_OUT); b.box(40, 41, 0, roof, -29, 29, C.WALL_OUT);
  b.box(-41, 41, 0, roof, -29, -28, C.WALL_OUT); b.box(-41, 41, 0, roof, 28, 29, C.WALL_OUT);
  // zócalo exterior a modo de adorno
  b.deco(-41.2, 41.2, 0, 0.8, 28, 29.2, C.TRIM); b.deco(-41.2, 41.2, 0, 0.8, -29.2, -28, C.TRIM);
  // Puerta de entrada y ventanas (planta baja y alta)
  b.deco(-2.8, 2.8, 0, 6, 27.88, 28, C.WOOD2); b.deco(-3.2, 3.2, 6, 6.4, 27.85, 28, C.TRIM); b.deco(1.6, 2.1, 2.8, 3.3, 27.8, 27.88, C.STEEL);
  for (const [a, b2] of [[-36, -30], [-26, -20], [-14, -9], [10, 16], [22, 28], [32, 38]] as const) windowZ(b, a, b2, 2.2, 5.2, 28, -1);
  for (const [a, b2] of [[-36, -30], [10, 16], [28, 34]] as const) windowZ(b, a, b2, 10.2, 13.2, 28, -1);
  for (const [a, b2] of [[-34, -28], [-20, -14], [12, 18], [26, 32]] as const) { windowZ(b, a, b2, 2.2, 5.2, -28, 1); }
  for (const [a, b2] of [[-34, -28], [-20, -14], [12, 18], [26, 30]] as const) windowZ(b, a, b2, 10.2, 13.2, -28, 1);
  windowX(b, 22, 26, 2.2, 5.2, -40, 1); windowX(b, -20, -14, 2.2, 5.2, -40, 1); windowX(b, -20, -14, 10.2, 13.2, -40, 1); windowX(b, -2, 4, 10.2, 13.2, -40, 1);
  windowX(b, 8, 14, 2.2, 5.2, 40, -1); windowX(b, -16, -10, 2.2, 5.2, 40, -1); windowX(b, 8, 14, 10.2, 13.2, 40, -1); windowX(b, 18, 24, 10.2, 13.2, 40, -1);

  // ---- Muros interiores, planta baja ----
  b.wallZ(-6, 1, -28, 28, 0, ceil, C.WALL_IN, [[12, 18], [-16, -10]]);       // recibidor | sala y estudio
  b.wallZ(6, 1, -28, 28, 0, ceil, C.WALL_IN, [[12, 18], [-26, -18]]);        // recibidor | cocina y lavandería
  b.wallX(2, 1, -40, -6.5, 0, ceil, C.WALL_IN, [[-24, -18]]);                // sala | estudio
  b.wallX(2, 1, 6.5, 40, 0, ceil, C.WALL_IN, [[20, 26]]);                    // cocina | lavandería
  // ---- Losa del piso 2 (hueco para las dos escaleras y vacío sobre sala y recibidor) ----
  const slab = (x0: number, x1: number, z0: number, z1: number) => b.box(x0, x1, ceil, F2, z0, z1, C.SLAB);
  slab(-40, 0.5, -28, 8);          // dormitorio, altillo y pasillo oeste
  slab(0.5, 5.5, -28, -14);        // descansillo de la escalera principal
  slab(5.5, 34, -28, 28);          // ala este
  slab(34, 40, -28, -19); slab(34, 40, -1, 28); slab(39, 40, -19, -1);
  b.box(39, 40, 0, ceil, -19, -1, C.WALL_IN);                                // lateral de la escalera de servicio
  // ---- Escaleras: 20 peldaños de 0,4 (se suben andando) ----
  b.stairs(0.5, 5.5, -14, 4, '-z', 20, 0.4, C.WOOD3);                        // principal, junto al recibidor
  b.stairs(34, 39, -19, -1, '-z', 20, 0.4, C.WOOD3);                         // de servicio, en la lavandería
  // paredes laterales para que nadie se caiga por el costado de las escaleras
  b.box(0.2, 0.5, 0, F2 - 0.2, -14, 4, C.WALL_IN);
  b.box(33.7, 34, 0, F2 - 0.2, -19, -1, C.WALL_IN);
  // ---- Muros interiores, planta alta ----
  b.wallZ(-6, 1, -28, -6, F2, roof, C.WALL_IN, [[-20, -14]]);                // dormitorio | pasillo
  b.wallX(-6, 1, -40, -6.5, F2, roof, C.WALL_IN, [[-26, -20]]);              // dormitorio | altillo
  b.wallZ(6, 1, -28, 28, F2, roof, C.WALL_IN, [[-26, -18]]);                 // pasillo | ala este (y borde del vacío)
  b.wallX(2, 1, 6.5, 40, F2, roof, C.WALL_IN, [[10, 16], [28, 34]]);          // costura | cuarto y baño
  b.wallZ(22, 1, 2.5, 28, F2, roof, C.WALL_IN);                              // cuarto | baño
  // ---- Barandillas del piso 2 ----
  const rail = (x0: number, x1: number, z0: number, z1: number) => b.box(x0, x1, F2, F2 + 1.4, z0, z1, C.WOOD2);
  rail(-37.4, -20, 7.7, 8.1); rail(-12, 0.5, 7.7, 8.1);                    // galería sobre la sala (huecos: estantería y gimnasio)
  rail(0.3, 0.7, -14, 8);                                                    // borde de la escalera principal
  rail(34, 34.4, -19, -1); rail(34, 40, -1.4, -1);                           // escalera de servicio
  // ---- Suelos ----
  const y2 = F2 + 0.03;
  b.floor(-5.5, 5.5, -28, 28, '#b98e62', { pattern: 'planks' });
  b.floor(-40, -6.5, 2.5, 28, '#a5927b', { pattern: 'carpet', label: 'SALA' });
  b.floor(-40, -6.5, -28, 1.5, '#8c6a4a', { pattern: 'planks', label: 'ESTUDIO' });
  b.floor(6.5, 40, 2.5, 28, '#eee7d6', { pattern: 'tiles', tint2: 'rgba(70,120,130,.28)', label: 'COCINA' });
  b.floor(6.5, 40, -28, 1.5, '#b5b0a8', { pattern: 'concrete', label: 'LAVANDERÍA' });
  b.floor(-40, -6.5, -28, -6, '#9b88b5', { y: y2, pattern: 'carpet', label: 'DORMITORIO' });
  b.floor(-40, 0.5, -6, 8, '#c0925a', { y: y2, pattern: 'planks', label: 'ALTILLO' });
  b.floor(-5.5, 0.5, -28, -6, '#c0925a', { y: y2, pattern: 'planks' });
  b.floor(0.5, 5.5, -28, -14, '#c0925a', { y: y2, pattern: 'planks' });
  b.floor(6.5, 34, -28, 1.5, '#b88555', { y: y2, pattern: 'planks', label: 'COSTURA' });
  b.floor(34, 40, -28, -19, '#b88555', { y: y2, pattern: 'planks' });
  b.floor(34, 40, -1, 1.5, '#b88555', { y: y2, pattern: 'planks' });
  b.floor(6.5, 22, 2.5, 28, '#d9a0a0', { y: y2, pattern: 'carpet', label: 'CUARTO' });
  b.floor(22, 40, 2.5, 28, '#cfe3e0', { y: y2, pattern: 'tiles', tint2: 'rgba(60,110,140,.22)', label: 'BAÑO' });
}
