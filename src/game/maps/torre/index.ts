import { MapBuilder } from '../MapBuilder';
import type { GameMap } from '../types';
import type { Vec3 } from '../../types';
import { lineKibbles, routeKibbles, validSpawns } from '../common';
import { BAND, buildFurniture, buildStructure, H } from './floors';

/** Altura sobre un tramo de escalera de 20 peldaños de 0,4: `dir` '-z' sube hacia el norte (desde z=14), '+z' hacia el sur (desde z=-4). */
const yOn = (z: number, dir: '+z' | '-z', base: number) => {
  const i = dir === '-z' ? Math.floor((BAND[1] - z) / 0.9) : Math.floor((z - BAND[0]) / 0.9);
  return +(base + 0.4 * (Math.min(19, Math.max(0, i)) + 1)).toFixed(1);
};

// x, z, y, dispersión de los bots
const ROUTE: Array<[number, number, number, number]> = [
  [-20, 15, 0, 2],                                             // 0 salida
  [-25.5, 16, 0, 0.6], [-25.5, 8, yOn(8, '-z', 0), 0.6], [-25.5, -3, yOn(-3, '-z', 0), 0.6], [-25.5, -8, 8, 1],        // 1-4 tramo 1 (sube)
  [-15.5, -6, 8, 0.6], [-15.5, 6, yOn(6, '+z', 8), 0.6], [-15.5, 13, yOn(13, '+z', 8), 0.6], [-15.5, 16.5, 16, 1],    // 5-8 tramo 2
  [-5.5, 15.5, 16, 0.6], [-5.5, 6, yOn(6, '-z', 16), 0.6], [-5.5, -3, yOn(-3, '-z', 16), 0.6], [-5.5, -8, 24, 1],      // 9-12 tramo 3
  [5.5, -8, 24, 1], [5.5, -3, yOn(-3, '-z', 16), 0.6], [5.5, 6, yOn(6, '-z', 16), 0.6], [5.5, 13, yOn(13, '-z', 16), 0.6], [5.5, 16.5, 16, 1],   // 13-17 baja
  [15.5, 15.5, 16, 0.6], [15.5, 6, yOn(6, '+z', 8), 0.6], [15.5, -3, yOn(-3, '+z', 8), 0.6], [15.5, -8, 8, 1],        // 18-21
  [25.5, -8, 8, 1], [25.5, -3, yOn(-3, '-z', 0), 0.6], [25.5, 6, yOn(6, '-z', 0), 0.6], [25.5, 13, yOn(13, '-z', 0), 0.6], [25.5, 16, 0, 1],   // 22-26
];

/** Casa de cuatro pisos: seis tramos de escalera (sube por el lado oeste, baja por el este) y huecos con barandas. */
export function buildTorre(): GameMap {
  const b = new MapBuilder();
  buildStructure(b);
  buildFurniture(b);
  const wps = ROUTE.map(([x, z]) => [x, z] as [number, number]), wpY = ROUTE.map((r) => r[2]);
  const sp = (a: Vec3[]) => a.filter((p) => !b.inSolid(p[0], p[1], p[2]));
  const kibbles = [
    ...routeKibbles(b, wps, wpY, true, 3.2),
    ...lineKibbles(b, -28, -15, -20, -15, 3, 6), ...lineKibbles(b, -27, -15, -21, -15, 3, 30), ...lineKibbles(b, -28, -17, -12, -17, 5, 22), ...lineKibbles(b, 12, -17, 28, -17, 5, 22),
  ];
  const levels = [0, 1, 2, 3].map((l) => l * H);
  const spread = (xs: number[], zs: number[], y: number): Vec3[] => xs.flatMap((x, i) => [[x, y + 0.6, zs[i % zs.length]] as Vec3]);
  return {
    id: 'torre', name: 'Casa de cuatro pisos', sky: 0x1b2235,
    root: b.root, colliders: b.colliders,
    bounds: { x0: -29.5, x1: 29.5, z0: -17.5, z1: 17.5 },
    view: { x0: -32, x1: 32, z0: -22.7, z1: 22.7 },
    puddles: [],
    robots: [{ a: [-6, 16], b: [6, 16], u: 0, s: 0.07 }, { a: [-20, -9], b: [20, -9], u: 0.5, s: 0.04 }],
    track: {
      waypoints: wps, wpY, wpSpread: ROUTE.map((r) => r[3]),
      cpWaypoint: [13, 18, 22],
      checkpoints: [
        { x0: -30, x1: 30, z0: -18, z1: 18 }, { x0: -30, x1: 30, z0: -18, z1: 18 }, { x0: -30, x1: 30, z0: -18, z1: 18 },
      ],
      cpY: [[22, 26], [14, 18], [6, 10]], cpCenters: [[5.5, -8], [15.5, 16], [25.5, -8]],
      respawns: [[-20, 0, 15], [5.5, 24, -8], [15.5, 16, 16], [25.5, 8, -8]],
      finishZone: { x0: 20, x1: 30, z0: 10, z1: 18 },
      startGrid: [[-19, 15.5], [-16, 15.5], [-13, 15.5], [-10, 15.5], [-19, 12.5], [-16, 12.5], [-13, 12.5], [-10, 12.5]],
      startYaw: -Math.PI / 2, hint: 'Sube por las escaleras del lado oeste',
    },
    spawns: {
      kibbles,
      fish: sp([[-25, 6.6, -16], [0, 24.9, -15.5], [27, 24.9, -4], [-26, 25.9, -15], [20, 17.0, -15], [-20, 8.9, 16], [0, 0.9, 16], [26, 16.9, 16]]),
      milk: sp([...spread([-20, 0, 20], [15, 15, 15], 0), ...spread([-20, 10, 26], [-8, 16, -8], 8), ...spread([-10, 20], [-8, 16], 16), ...spread([-12, 14], [-8, -8], 24)]),
      throwables: sp([
        ...levels.flatMap((y) => [[-20, y + 0.6, 15], [0, y + 0.6, 15], [20, y + 0.6, 15], [-20, y + 0.6, -8], [0, y + 0.6, -8], [20, y + 0.6, -8], [-26, y + 0.6, 3], [28, y + 0.6, 3]] as Vec3[]),
        [-24, 2.4, -14], [0, 3.4, -13], [-20, 12, -16], [-12, 20, -17], [-24, 30.4, -14], [-10, 17, -16], [22, 18, -13], [20, 10, -15],
      ]),
      battle: validSpawns(b, levels.flatMap((y) => [[-20, y, 15], [20, y, 15], [0, y, -8], [-20, y, -8], [20, y, -8], [0, y, 8], [-10, y, 0], [10, y, 0]] as Vec3[])),
    },
    overhead: { pos: [0, 78, 48], look: [0, 14, 0] },
  };
}
