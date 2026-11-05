import { MapBuilder } from '../MapBuilder';
import type { GameMap } from '../types';
import type { Vec2, Vec3, Zone } from '../../types';
import { lineKibbles, routeKibbles, validSpawns } from '../common';
import { bench, bush, gazebo, hill, lamp, picnic, pond, tree } from './scenery';
import { playground } from './playground';

const PUDDLE: Zone = { x0: -14, x1: 14, z0: -9, z1: 9 };
const ROUTE: Array<[number, number]> = [
  [-6, 19], [10, 19], [27, 19], [27, 6], [27, -6], [27, -19], [10, -19], [-10, -19], [-27, -19], [-27, -6], [-27, 6], [-27, 19], [4, 19],
];
const TREES: Vec2[] = [
  [-19, -13], [19, -13], [-19, 13], [19, 13], [0, -13.5], [0, 13.5],
  [-42, -28], [-42, -14], [-42, 0], [-42, 14], [-42, 28], [-36, -30], [-12, -30], [0, -30], [12, -30], [24, -30],
  [-12, 30], [0, 30], [12, 30], [24, 30], [38, -12], [44, -2],
];
const BUSHES: Vec2[] = [[-10, 12], [10, -12], [10, 12], [-10, -12], [-35, 20], [-35, -20], [34, 22], [-26, 28], [26, -28], [-6, -28], [6, 28], [-45, 5], [46, 18], [-34, 10]];

/** Parque: anillo de caminos alrededor de un estanque, con árboles trepables, colina, glorieta y parque infantil. */
export function buildParque(): GameMap {
  const b = new MapBuilder();
  b.floor(-50, 50, -35, 35, '#5fa55a', { pattern: 'grass', y: 0.02 });
  // caminos (decoración): anillo y ramal al parque infantil
  const path = (x0: number, x1: number, z0: number, z1: number) => b.floor(x0, x1, z0, z1, '#d9c9a0', { pattern: 'concrete', y: 0.04 });
  path(-30, 30, 16, 22); path(-30, 30, -22, -16); path(24, 30, -22, 22); path(-30, -24, -22, 22); path(30, 40, 14, 18);
  // seto perimetral
  const hedge = 0x3f7f3f;
  b.box(-51, -50, 0, 3.2, -36, 36, hedge); b.box(50, 51, 0, 3.2, -36, 36, hedge); b.box(-51, 51, 0, 3.2, -36, -35, hedge); b.box(-51, 51, 0, 3.2, 35, 36, hedge);
  pond(b);
  hill(b, -19.5, 0);
  gazebo(b, 16, -3.5);
  playground(b);
  for (const [x, z] of TREES) tree(b, x, z);
  for (const [x, z] of BUSHES) bush(b, x, z);
  for (const [x, z, ax] of [[-15, 23.2, true], [15, 23.2, true], [-15, -23.2, true], [15, -23.2, true], [31.4, -10, false], [31.4, 10, false], [-31.4, -10, false], [-31.4, 10, false]] as const) bench(b, x, z, ax);
  for (const [x, z] of [[23.5, 10], [23.5, -10], [-23.5, 10], [-23.5, -10], [12, 15.5], [-12, 15.5], [12, -15.5], [-12, -15.5]] as const) lamp(b, x, z);
  picnic(b, -40, 22);
  b.box(-46, -40, 0, 4.6, -24, -18, 0xd9c9a8); b.deco(-46.5, -39.5, 3.2, 3.6, -25, -17, 0xd9534f);   // quiosco

  const wpY = ROUTE.map(() => 0);
  const sp = (a: Vec3[]) => a.filter((p) => !b.inSolid(p[0], p[1], p[2]));
  const kibbles = [...routeKibbles(b, ROUTE, wpY, true), ...lineKibbles(b, -23, -6, -17, -6, 3, 3), ...lineKibbles(b, 16.6, 0, 22.4, 0, 3, 6), ...lineKibbles(b, 41.5, 14.5, 44, 15.5, 3, 8)];
  const treeTop = (i: number): Vec3 => [TREES[i][0], 7.3, TREES[i][1]];
  return {
    id: 'parque', name: 'Parque', sky: 0x7fc4f0,
    root: b.root, colliders: b.colliders,
    bounds: { x0: -49.3, x1: 49.3, z0: -34.3, z1: 34.3 },
    view: { x0: -51, x1: 51, z0: -36, z1: 36 },
    puddles: [PUDDLE],
    robots: [
      { a: [-46, -30], b: [-46, 30], u: 0, s: 0.03 },
      { a: [-5, -27], b: [-5, -12], u: 0.4, s: 0.06 },
      { a: [30, 28], b: [48, 28], u: 0.2, s: 0.05 },
    ],
    track: {
      waypoints: ROUTE, wpY, wpSpread: ROUTE.map(() => 2.2),
      cpWaypoint: [4, 7, 10],
      checkpoints: [{ x0: 24, x1: 31, z0: -8, z1: 8 }, { x0: -12, x1: 12, z0: -23, z1: -15 }, { x0: -31, x1: -24, z0: -8, z1: 8 }],
      cpY: [null, null, null], cpCenters: [[27, 0], [0, -19], [-27, 0]],
      respawns: [[-12, 0, 19], [27, 0, 0], [0, 0, -19], [-27, 0, 0]],
      finishZone: { x0: 0, x1: 8, z0: 14, z1: 24 },
      startGrid: [[-20, 17.5], [-17, 17.5], [-14, 17.5], [-11, 17.5], [-20, 20.5], [-17, 20.5], [-14, 20.5], [-11, 20.5]],
      startYaw: Math.PI / 2, hint: 'Sigue el camino alrededor del estanque',
    },
    spawns: {
      kibbles,
      fish: sp([[-19.5, 2.9, 0], [19.5, 6.3, 0], [43, 8.3, 15], [43, 7.4, -25.6], treeTop(0), treeTop(7), treeTop(15), [-43, 5.5, -21]]),
      milk: sp([[0, 0.6, 14], [-20, 0.6, 14], [20, 0.6, -14], [-38, 0.6, 22], [38, 0.6, 0], [0, 0.6, -26], [30, 0.6, 26], [-30, 0.6, -28]]),
      throwables: sp([
        [-8, 0.6, 19], [12, 0.6, 19], [27, 0.6, 8], [27, 0.6, -10], [10, 0.6, -19], [-12, 0.6, -19], [-27, 0.6, -8], [-27, 0.6, 12],
        [-19.5, 2.4, 0], [-22, 1.0, 5], [19.5, 5.8, 0], [19.5, 1.8, 2], [43, 4.6, 15], [43, 7.6, 15], [36, 3.6, -11], [43, 7.1, -25.6],
        [-40, 2.4, 22], [-43, 5.2, -21], [-14, 0.6, 12], [14, 0.6, -12], [-30, 0.6, 28], [30, 0.6, -28], [38, 0.6, 5], [44, 0.6, 28],
        [0, 0.6, 26], [0, 0.6, -26], [-40, 0.6, -5], [-6, 0.6, -13], [8, 0.6, 12], [46, 0.6, -20],
      ]),
      battle: validSpawns(b, [
        [0, 0, 26], [-40, 0, 0], [40, 0, 0], [0, 0, -28], [-27, 0, 19], [27, 0, 19], [27, 0, -19], [-27, 0, -19], [-12, 0, 8], [12, 0, -8],
        [-19.5, 2.0, 0], [19.5, 5.4, 0], [43, 4, 15], [43, 6.5, -25.6], [-35, 0, 28], [36, 0, -20], [10, 0, 24], [-10, 0, -24],
      ]),
    },
    overhead: { pos: [0, 100, 60], look: [0, 0, 0] },
  };
}
