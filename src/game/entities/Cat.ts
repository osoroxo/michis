import type { Collider, CatSpec, Ctl } from '../types';
import { neutralCtl } from '../types';
import { breedOf, type BreedDef } from '../config/breeds';
import { T } from '../config/tuning';
import type { ThrowId } from '../config/throwables';
import { CatModel } from './cat/CatModel';

export interface ClimbState { k: Collider; nx: number; nz: number }

/** Estado de simulación de un gato (humano o CPU). La malla vive en `model`. */
export class Cat {
  readonly breed: BreedDef;
  readonly model: CatModel;
  readonly hpMax: number;
  active = true;
  human = false;
  /** Dispositivo de entrada ('k1' | 'k2' | 'g0'…) si es humano. */
  dev = '';
  name: string;
  /** Color de jugador en CSS (#rrggbb) y en hexadecimal numérico. */
  css: string;
  hex: number;

  x = 0; y = 0; z = 0; vx = 0; vy = 0; vz = 0; yaw = 0;
  onGround = true;
  climb: ClimbState | null = null;
  climbCd = 0;
  wallHit = false;
  jumpsUsed = 0;
  peakY = 0;

  hp: number;
  down = false;       // derribado, esperando reaparecer (batalla)
  respawnT = 0;
  stun = 0; inv = 0; ultra = 0;
  slowT = 0; bleedT = 0;
  lastAttacker: Cat | null = null;
  lastAttackT = 0;

  dodgeT = 0; dodgeCd = 0;
  clawCd = 0; clawAnim = 0; clawLevel = 0; sharpenT = 0; sharpening = false;
  ballN = 2; ballT = 0;
  held: ThrowId | null = null;

  // carrera
  score = 0; bonus = 0; lap = 1; cp = 0; wp = 0;
  finished = false; finishRank = 0; finishT = 0;
  climbed = false;
  // batalla
  kills = 0; deaths = 0;

  walk = 0; tier = 0;
  msg = ''; msgT = 0;

  // cámara
  camYaw = 0; camOff = 0; cx = 0; cy = 0; cz = 0; camInit = false; look = 0;

  ctl: Ctl = neutralCtl();
  prev = { jump: false, claw: false, throw: false, dodge: false, back: false };

  // IA
  botT = 0; botX = 0; botY = 0; botZ = 0; stuck = 0; botPace = 1;
  offs: Array<[number, number]> = [];
  targetId = -1; targetT = 0; strafe = 1; strafeT = 0; aiGoal: [number, number] | null = null;

  constructor(readonly i: number, readonly spec: CatSpec) {
    this.breed = breedOf(spec.breed);
    this.hpMax = Math.round(T.maxHp * this.breed.stats.hp);
    this.hp = this.hpMax;
    this.name = spec.name;
    this.css = spec.accent;
    this.hex = parseInt(spec.accent.replace('#', ''), 16);
    this.model = new CatModel(spec);
    this.model.setLabel(spec.name, spec.accent);
  }

  get dodgeReady() { return this.dodgeCd <= 0 ? 1 : 1 - this.dodgeCd / T.dodge.cd; }
  get speedMul() { return this.breed.stats.speed; }
  get jumpMul() { return this.breed.stats.jump; }
  get clawDamage() { return T.clawDamage * this.breed.stats.claw * (1 + T.sharpenDmg * this.clawLevel); }
  get clawReach() { return T.clawReach + T.sharpenReach * this.clawLevel; }

  say(msg: string, t = 1.2) { this.msg = msg; this.msgT = t; }
}
