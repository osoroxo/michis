import type { Vec3 } from '../../types';
import type { SpawnDefs } from '../types';
import type { MapBuilder } from '../MapBuilder';
import { WAYPOINTS, WP_Y } from './track';

const U = 8;   // altura del piso alto

/** Objetos arrojadizos: planta baja y alta, también sobre muebles y estantes. */
const THROW: Vec3[] = [
  // recibidor
  [-3, 0.6, 20], [3, 0.6, 8], [-3, 0.6, -6], [0, 0.6, 26],
  // sala
  [-30, 0.6, 26], [-14, 0.6, 12], [-9, 0.6, 14], [-20, 0.6, 5], [-38.8, 1.9, 11], [-38.8, 3.5, 20], [-24, 5.2, 13], [-17, 1.8, 24], [-9, 2.2, 22],
  // estudio
  [-36, 3.2, -25], [-22, 0.6, -20], [-12, 0.6, -6], [-28, 2.2, -27], [-20, 4.0, -27], [-30, 0.6, -2],
  // cocina
  [10, 3.5, 26.5], [30, 3.6, 26.5], [20, 5.4, 27], [22, 3.5, 14], [12, 0.6, 22], [36, 0.6, 14], [38.5, 2.9, 10],
  // lavandería
  [18, 2.4, -27.5], [20, 4.2, -27.5], [30, 3.8, -26], [25.5, 3.8, -13.5], [14, 0.6, -16], [32, 0.6, -10], [10, 0.6, -4],
  // piso alto: altillo y galería
  [-36, U + 2.4, 0], [-30, U + 0.6, -3], [-12, U + 0.6, 4], [-26, U + 0.6, 6], [-22, U + 0.6, -3],
  // dormitorio
  [-33, U + 2.4, -24], [-16, U + 3.6, -26], [-24, U + 0.6, -12], [-10, U + 0.6, -20],
  // ala este alta
  [14, U + 0.6, -12], [30, U + 2.0, -10], [14, U + 2.2, -27], [20, U + 4.0, -27], [12, U + 2.8, 6], [15, U + 2.4, 10], [28, U + 0.6, 14], [36, U + 0.6, 8], [28, U + 0.6, -22],
];

const MILK: Vec3[] = [[0, 0.6, 24], [-20, 0.6, 18], [14, 0.6, 20], [12, 0.6, -20], [-14, 0.6, -14], [-20, U + 0.6, 4], [30, U + 0.6, -14], [26, U + 0.6, 18], [10, U + 0.6, -22]];
const FISH: Vec3[] = [
  [1, 0.9, 20], [-15.5, 9.0, 10], [-39, 8 + 1.0, 14], [-22, 6.4, -27], [36, 0.9, 22], [20, 5.7, 27], [-9, U + 6.8, -26], [38, U + 0.9, 20], [30, U + 0.9, -4], [-30, U + 0.9, 2],
];

const BATTLE: Vec3[] = [
  [0, 0, 24], [-30, 0, 24], [-15, 0, 10], [-25, 0, -15], [-12, 0, -22], [-10, 0, -4], [30, 0, 14], [14, 0, 22], [20, 0, -14], [12, 0, -24], [32, 0, -8],
  [-30, U, 0], [-10, U, 2], [-25, U, -18], [-12, U, -24], [20, U, -8], [30, U, -22], [14, U, 16], [30, U, 10], [3, U, -22],
];

/** Posiciones de croquetas, pescados, leche, objetos y apariciones, todas en coordenadas del mundo. */
export function buildSpawns(b: MapBuilder): SpawnDefs {
  const k: Vec3[] = [];
  const addK = (x: number, y: number, z: number) => { if (!b.inSolid(x, y, z)) k.push([x, y, z]); };
  // Reguero de croquetas siguiendo el recorrido, pegado a la superficie (escaleras incluidas).
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i], c = WAYPOINTS[i + 1];
    const d = Math.hypot(c[0] - a[0], c[1] - a[1]), n = Math.max(1, Math.floor(d / 3.0));
    for (let q = 0; q < n; q++) {
      const u = q / n, x = a[0] + (c[0] - a[0]) * u, z = a[1] + (c[1] - a[1]) * u, yh = WP_Y[i] + (WP_Y[i + 1] - WP_Y[i]) * u;
      addK(x, b.topAt(x, z, yh) + 0.6, z);
    }
  }
  const line = (x0: number, z0: number, x1: number, z1: number, n: number, y: number) => {
    for (let i = 0; i < n; i++) { const u = i / Math.max(1, n - 1); const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u; addK(x, b.topAt(x, z, y) + 0.6, z); }
  };
  // Recompensas por explorar y trepar
  line(-39, 9.5, -39, 17.5, 4, 8);        // estantería de la sala (baldas altas)
  line(-32, 13, -20, 13, 5, 7);           // gimnasio
  line(8, 26.8, 31, 26.8, 6, 3);          // encimera
  line(18, 27, 21, 27, 2, 5);             // balda de la cocina
  line(-28, -27, -16, -27, 5, 4);         // biblioteca del estudio
  line(11, -27.2, 23, -27.2, 5, 6);       // estantería de la lavandería
  line(-36, -24, -30, -24, 3, 8);         // cama
  line(-37, -2, -37, 3, 3, 8);            // altillo
  line(-33, 4, -10, 4, 7, 8);             // galería
  line(10, -20, 30, -20, 6, 8);           // ala este alta
  const keep = (a: Vec3): Vec3 => a;
  return {
    kibbles: k,
    fish: FISH.map(keep),
    milk: MILK.map(keep),
    throwables: THROW.filter((p) => !b.inSolid(p[0], p[1], p[2])),
    battle: BATTLE.filter(([x, y, z]) => !b.inSolid(x, y + 0.5, z)),
  };
}
