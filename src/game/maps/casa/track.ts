import type { Vec2, Vec3, Zone } from '../../types';

/**
 * Recorrido de carrera: sube por la escalera principal, cruza el piso alto, baja por la escalera de
 * servicio, atraviesa lavandería y cocina y vuelve al recibidor.  [x, z, y]
 */
export const ROUTE: Array<[number, number, number, number]> = [
  // x, z, y(piso), dispersión lateral de los bots
  [1, 12, 0, 3],      // 0 recibidor
  [3, 6, 0, 0.8],     // 1 pie de la escalera principal
  [3, -6, 4.4, 0.8],  // 2
  [3, -13, 7.6, 0.8], // 3 cima
  [3, -22, 8, 1.5],   // 4 descansillo
  [10, -22, 8, 1.2],  // 5 puerta al ala este
  [22, -22, 8, 2.5],  // 6
  [36.5, -22, 8, 1.5],// 7 descansillo de servicio
  [36.5, -16, 6.8, 0.7], // 8
  [36.5, -8, 3.2, 0.7],  // 9
  [36.5, 0.2, 0, 0.7],   // 10 pie de la escalera de servicio
  [30, 0.2, 0, 0.5],     // 11
  [23, 0.5, 0, 0.8],     // 12 puerta a la cocina
  [23, 6, 0, 1.2],       // 13 charco de leche
  [14, 14, 0, 2.5],      // 14
  [8, 15, 0, 1.0],       // 15 puerta al recibidor
  [0, 15, 0, 1.5],       // 16 meta
];
export const WAYPOINTS: Vec2[] = ROUTE.map(([x, z]) => [x, z]);
export const WP_Y = ROUTE.map((r) => r[2]);
export const WP_SPREAD = ROUTE.map((r) => r[3]);

export const CHECKPOINTS: Zone[] = [
  { x0: -5.5, x1: 40, z0: -28, z1: -14 },   // 0: piso alto (descansillo y ala este)
  { x0: 6.5, x1: 40, z0: -28, z1: 2 },      // 1: lavandería (planta baja)
  { x0: 6.5, x1: 40, z0: 2.5, z1: 28 },     // 2: cocina
];
export const CP_Y: Array<[number, number] | null> = [[6, 16], [-1, 3], [-1, 3]];
export const CP_WAYPOINT = [5, 11, 15];
export const CP_CENTERS: Vec2[] = [[3, -18], [30, -3], [14, 14]];
export const RESPAWNS: Vec3[] = [[1, 0, 14], [3, 8, -22], [30, 0, 0.5], [10, 0, 15]];
export const FINISH_ZONE: Zone = { x0: -5.5, x1: 5.5, z0: 12, z1: 18 };
export const START_GRID: Vec2[] = [[-4.2, 22.5], [-1.4, 22.5], [1.4, 22.5], [4.2, 22.5], [-4.2, 25.7], [-1.4, 25.7], [1.4, 25.7], [4.2, 25.7]];
export const START_YAW = Math.PI;   // mirando hacia -z
