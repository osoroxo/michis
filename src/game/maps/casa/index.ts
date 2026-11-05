import { MapBuilder, LV } from '../MapBuilder';
import type { GameMap } from '../types';
import { buildShell } from './shell';
import { buildSala } from './sala';
import { buildCocina, PUDDLE } from './cocina';
import { buildEstudio } from './estudio';
import { buildLavanderia } from './lavanderia';
import { buildUpstairs } from './upstairs';
import { buildSpawns } from './spawns';
import { CHECKPOINTS, CP_CENTERS, CP_WAYPOINT, CP_Y, FINISH_ZONE, RESPAWNS, START_GRID, START_YAW, WAYPOINTS, WP_SPREAD, WP_Y } from './track';

/** Casa de dos plantas: recibidor con escalera, sala de doble altura con gimnasio de gatos, cocina, estudio, lavandería. */
export function buildCasa(): GameMap {
  const b = new MapBuilder();
  buildShell(b);
  buildSala(b);
  buildCocina(b);
  buildEstudio(b);
  buildLavanderia(b);
  buildUpstairs(b);
  return {
    id: 'casa',
    sky: 0x241d33,
    name: 'Casa de dos pisos',
    root: b.root,
    colliders: b.colliders,
    bounds: { x0: -39.5, x1: 39.5, z0: -27.5, z1: 27.5 },
    view: { x0: -41, x1: 41, z0: -29, z1: 29 },
    puddles: [PUDDLE],
    robots: [
      { a: [-36, 6], b: [-10, 24], u: 0, s: 0.035 },
      { a: [30, 6], b: [10, 22], u: 0.5, s: 0.045 },
      { a: [10, -24], b: [30, -6], u: 0.2, s: 0.04 },
    ],
    track: {
      waypoints: WAYPOINTS, wpY: WP_Y, wpSpread: WP_SPREAD,
      cpWaypoint: CP_WAYPOINT, checkpoints: CHECKPOINTS, cpY: CP_Y, cpCenters: CP_CENTERS,
      respawns: RESPAWNS, finishZone: FINISH_ZONE, startGrid: START_GRID, startYaw: START_YAW, hint: 'Sube por la escalera del recibidor',
    },
    spawns: buildSpawns(b),
    overhead: { pos: [0, 84, 70], look: [0, 0, 0] },
  };
}
export const FLOOR2 = LV.slabTop;
