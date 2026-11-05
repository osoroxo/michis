import type * as THREE from 'three';
import type { Collider, Vec2, Vec3, Zone } from '../types';

export interface RobotDef { a: Vec2; b: Vec2; u: number; s: number }

/** Todo lo que una carrera necesita saber del recorrido por la casa. */
export interface TrackDef {
  waypoints: Vec2[];
  /** Altura del piso de cada waypoint: un waypoint solo cuenta si el gato está a su altura. */
  wpY: number[];
  /** Dispersión lateral máxima de los bots en cada waypoint. */
  wpSpread: number[];
  /** Waypoint al que salta el gato al cruzar cada checkpoint. */
  cpWaypoint: number[];
  checkpoints: Zone[];
  /** Rango de altura [min, max] en el que cuenta cada checkpoint (null = cualquiera). */
  cpY: Array<[number, number] | null>;
  /** Punto de referencia de cada checkpoint (para medir progreso). */
  cpCenters: Vec2[];
  /** Dónde reaparece el gato según cuántos checkpoints lleva (x, y, z). */
  respawns: Vec3[];
  finishZone: Zone;
  startGrid: Vec2[];
  startYaw: number;
  /** Pista que se muestra al principio de la carrera. */
  hint?: string;
}

export interface SpawnDefs {
  kibbles: Vec3[];
  fish: Vec3[];
  milk: Vec3[];
  throwables: Vec3[];
  /** Puntos de aparición de la batalla (x, y, z). */
  battle: Vec3[];
}

export interface GameMap {
  id: string;
  name: string;
  /** Color de cielo / fondo. */
  sky: number;
  root: THREE.Group;
  colliders: Collider[];
  bounds: Zone;
  /** Encuadre del minimapa. */
  view: Zone;
  puddles: Zone[];
  robots: RobotDef[];
  track: TrackDef;
  spawns: SpawnDefs;
  overhead: { pos: Vec3; look: Vec3 };
}
