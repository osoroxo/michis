import { MapBuilder } from '../MapBuilder';
import type { GameMap } from '../types';
import type { Vec3 } from '../../types';
import { lineKibbles, routeKibbles, validSpawns } from '../common';
import { dinosaur, entrance, hallDecor } from './hall';
import { artWing, egyptWing, mezzanine } from './wings';

const WALL = 0xd8cfc0, SLAB = 0xcfc6b4, WOOD = 0x6b4a2b;
const Y = 8;

// x, z, piso, dispersión de los bots
const ROUTE: Array<[number, number, number, number]> = [
  [-6, 16, 0, 3], [-10.5, 6, 0, 2], [-11, 0.5, 0, 0.8], [-11, -8, 3.1, 0.8], [-11, -16, 6.6, 0.8], [-11, -22, 8, 1],
  [-5, -24, 8, 1.5], [5, -24, 8, 1.5], [11, -22, 8, 1], [11, -16, 6.6, 0.8], [11, -8, 3.1, 0.8], [11, 0.5, 0, 0.8],
  [20, 0, 0, 1.5], [30, 0, 0, 2.5], [30, 16, 0, 2.5], [20, 18, 0, 1.5], [8, 18, 0, 1.5],
];

/** Museo: gran salón con dinosaurio, ala egipcia con pirámide, galería de arte y entrepisos unidos por un puente. */
export function buildMuseo(): GameMap {
  const b = new MapBuilder();
  // ---- estructura ----
  b.box(-41, -40, 0, 14, -29, 29, WALL); b.box(40, 41, 0, 14, -29, 29, WALL); b.box(-41, 41, 0, 14, -29, -28, WALL); b.box(-41, 41, 0, 14, 28, 29, WALL);
  b.wallZ(-14, 1, -28, 28, 0, 7, WALL, [[-6, 6], [14, 22]]);
  b.wallZ(14, 1, -28, 28, 0, 7, WALL, [[-6, 6], [14, 22]]);
  b.floor(-14, 14, -28, 28, '#e9e3d6', { pattern: 'tiles', tint2: 'rgba(70,70,90,.16)', label: 'GRAN SALÓN' });
  b.floor(-40, -14, -28, 28, '#d9c08a', { pattern: 'tiles', tint2: 'rgba(120,80,30,.16)', label: 'EGIPTO' });
  b.floor(14, 40, -28, 28, '#8a5f3c', { pattern: 'planks', label: 'ARTE' });
  // entrepisos y puente
  b.box(-40, -14, 7, Y, -28, -6, SLAB); b.box(14, 40, 7, Y, -28, -6, SLAB); b.box(-14, 14, 7, Y, -28, -20, SLAB);
  b.floor(-40, -14, -28, -6, '#b99a62', { y: Y + 0.03, pattern: 'planks' }); b.floor(14, 40, -28, -6, '#b99a62', { y: Y + 0.03, pattern: 'planks' }); b.floor(-14, 14, -28, -20, '#8a5f3c', { y: Y + 0.03, pattern: 'planks' });
  b.stairs(-13.5, -8.5, -20, -2, '-z', 20, 0.4, 0xc9bfa8);
  b.stairs(8.5, 13.5, -20, -2, '-z', 20, 0.4, 0xc9bfa8);
  b.box(-8.5, -8, 0, 7.8, -20, -2, WALL); b.box(8, 8.5, 0, 7.8, -20, -2, WALL);              // paredes laterales de las escaleras
  const rail = (x0: number, x1: number, z0: number, z1: number) => b.box(x0, x1, Y, Y + 1.4, z0, z1, WOOD);
  rail(-40, -34, -6.3, -6); rail(-20, -14, -6.3, -6); rail(14, 40, -6.3, -6);        // bordes sobre las alas (hueco: pirámide)
  rail(-14.3, -14, -20, -6); rail(14, 14.3, -20, -6); rail(-8.5, 8.5, -20.3, -20);   // bordes sobre el salón y el puente
  dinosaur(b); hallDecor(b); entrance(b);
  egyptWing(b); artWing(b); mezzanine(b);

  const wps = ROUTE.map(([x, z]) => [x, z] as [number, number]), wpY = ROUTE.map((r) => r[2]);
  const sp = (a: Vec3[]) => a.filter((p) => !b.inSolid(p[0], p[1], p[2]));
  const kibbles = [
    ...routeKibbles(b, wps, wpY, true),
    ...lineKibbles(b, -3, -14, 0, 3, 4, 5), ...lineKibbles(b, -32, -4, -30, -4, 2, 8), ...lineKibbles(b, -30, -5, -22, -5, 4, 8),
    ...lineKibbles(b, -36, -26, -22, -26, 4, 12), ...lineKibbles(b, 18, -26, 38, -26, 5, 8), ...lineKibbles(b, -33, 14, -25, 14, 3, 1),
  ];
  return {
    id: 'museo', name: 'Museo', sky: 0x1f2433,
    root: b.root, colliders: b.colliders,
    bounds: { x0: -39.5, x1: 39.5, z0: -27.5, z1: 27.5 },
    view: { x0: -41, x1: 41, z0: -29, z1: 29 },
    puddles: [],
    robots: [{ a: [-4, 12], b: [4, 12], u: 0, s: 0.06 }, { a: [20, -4], b: [36, -4], u: 0.5, s: 0.05 }, { a: [-36, 16], b: [-20, 22], u: 0.3, s: 0.05 }],
    track: {
      waypoints: wps, wpY, wpSpread: ROUTE.map((r) => r[3]),
      cpWaypoint: [5, 13, 15],
      checkpoints: [{ x0: -14, x1: 14, z0: -28, z1: -20 }, { x0: 16, x1: 40, z0: -8, z1: 8 }, { x0: 16, x1: 40, z0: 10, z1: 28 }],
      cpY: [[6, 10], [-1, 3], [-1, 3]], cpCenters: [[0, -24], [28, 0], [28, 18]],
      respawns: [[-6, 0, 16], [0, Y, -24], [28, 0, 0], [12, 0, 18]],
      finishZone: { x0: 2, x1: 12, z0: 14, z1: 22 },
      startGrid: [[-10.5, 21], [-7.5, 21], [-4.5, 21], [-1.5, 21], [-10.5, 24.5], [-7.5, 24.5], [-4.5, 24.5], [-1.5, 24.5]],
      startYaw: Math.PI, hint: 'Sube por la escalera, cruza el puente y baja por la otra',
    },
    spawns: {
      kibbles,
      fish: sp([[0, 8.4, -2], [-27, 9.4, -4.6], [-21.5, 8.4, 16.6], [0, 8.8, -24], [-30, Y + 0.9, -16], [32, Y + 0.9, -16], [30, 0.9, 20], [-36, 0.9, 22]]),
      milk: sp([[0, 0.6, 20], [-30, 0.6, 2], [30, 0.6, 14], [-12, 0.6, -6], [20, Y + 0.6, -12], [-30, Y + 0.6, -12], [0, Y + 0.6, -24], [36, 0.6, -20]]),
      throwables: sp([
        [-6, 0.6, 14], [6, 0.6, 14], [-6, 0.6, -6], [6, 0.6, -6], [0, 4.6 + 0.6, -3], [0, 3.8, -11], [-2.5, 0.6, 12], [-26, 1.0, 4], [-26, 3.4, -3], [-26, 6.4, -4.8],
        [-34, 1.9, 22], [-28, 0.6, 18], [-36, 0.6, -2], [24, 0.6, 0], [32, 0.6, 10], [28, 0.6, 20], [20, 1.9, -4], [38, 0.6, 24], [22, 0.6, 12],
        [-30, Y + 0.6, -22], [-22, Y + 0.6, -16], [-36, Y + 3.0, -27], [30, Y + 0.6, -22], [26, Y + 0.6, -8], [36, Y + 0.6, -16], [0, Y + 0.6, -22], [-8, 4.2, -8], [8, 4.2, -8],
      ]),
      battle: validSpawns(b, [
        [-6, 0, 20], [6, 0, 14], [-6, 0, -8], [6, 0, -10], [-28, 0, 14], [-36, 0, -2], [-24, 0, 20], [28, 0, 2], [34, 0, 16], [24, 0, 22], [38, 0, -4],
        [-30, Y, -20], [-22, Y, -12], [30, Y, -20], [22, Y, -10], [0, Y, -24], [-8, 4.6, 0.5], [-27, 8, -4.5],
      ]),
    },
    overhead: { pos: [0, 100, 60], look: [0, 0, 0] },
  };
}
