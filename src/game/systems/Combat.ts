import { T } from '../config/tuning';
import { THROWABLES, type ThrowDef } from '../config/throwables';
import type { Cat } from '../entities/Cat';
import type { Ctx } from './ctx';

export interface HitOpts {
  from: { x: number; z: number };
  attacker: Cat | null;
  dmg: number; stun: number; knock: number;
  kibbles?: number;
  effect?: 'slow' | 'bleed';
  msg?: string;
}

const CLAW_COLORS = [0xffffff, 0xffe28a, 0xff9a3c, 0xff4d4d];
export const clawColor = (lvl: number) => CLAW_COLORS[Math.min(lvl, CLAW_COLORS.length - 1)];

/** Daño, empujones, estados (sangrado, lentitud), garras y lanzamientos. */
export class Combat {
  constructor(private g: Ctx) {}

  /** Golpe con empujón y aturdimiento. Devuelve false si lo evitó la invulnerabilidad. */
  hit(v: Cat, o: HitOpts): boolean {
    if (!this.g.live || v.down) return false;
    if (v.dodgeT > 0) {                       // esquivado: no pasa nada
      if (v.msgT <= 0) v.say('¡Esquivó!', 0.6);
      return false;
    }
    if (v.inv > 0) return false;
    const dx = v.x - o.from.x, dz = v.z - o.from.z, d = Math.hypot(dx, dz) || 1;
    v.climb = null; v.climbCd = 0.6;
    v.stun = Math.max(v.stun, o.stun); v.inv = T.invuln;
    v.vx = (dx / d) * o.knock; v.vz = (dz / d) * o.knock; v.vy = 6; v.onGround = false;
    v.sharpening = false; v.sharpenT = 0;
    if (o.attacker) { v.lastAttacker = o.attacker; v.lastAttackT = 5; }
    if (o.effect === 'slow') v.slowT = Math.max(v.slowT, 3);
    if (o.effect === 'bleed') v.bleedT = Math.max(v.bleedT, T.fall.bleedTime);
    if (o.kibbles && this.g.config.mode === 'race') this.g.pickups.dropKibble(v, o.kibbles);
    if (o.msg) v.say(o.msg, 1.1);
    this.g.audio.sfx(160, 0.14, 'sawtooth', 0.08);
    this.g.effects.ring(v.x, v.y, v.z, 2, 0xffffff, 0.25);
    this.hurt(v, o.dmg, o.attacker);
    return true;
  }

  /** Daño sin empujón (sangrado, caídas). */
  hurt(v: Cat, dmg: number, attacker: Cat | null) {
    if (!this.g.live || v.down || dmg <= 0) return;
    v.hp = Math.max(0, v.hp - dmg);
    if (v.hp <= 0) this.g.mode.onKO(v, attacker ?? (v.lastAttackT > 0 ? v.lastAttacker : null));
  }

  /** Aterrizaje desde `drop` unidades de altura: daño, lentitud y sangrado. */
  fall(c: Cat, drop: number) {
    const F = T.fall;
    if (drop <= F.safe) return;
    const over = drop - F.safe, dmg = Math.round(over * F.dmgPerUnit);
    c.slowT = Math.max(c.slowT, Math.min(F.slowMax, F.slowBase + over * F.slowPerUnit));
    if (drop >= F.bleedFrom) c.bleedT = Math.max(c.bleedT, F.bleedTime);
    if (drop >= F.hardLandFrom) { c.stun = Math.max(c.stun, F.hardStun); c.vx = c.vz = 0; }
    c.say(`¡Caída! −${dmg}`, 1.5);
    this.g.audio.sfx(110, 0.2, 'sawtooth', 0.09);
    this.g.effects.ring(c.x, c.y, c.z, 2.6, 0xff6b4a, 0.4);
    this.hurt(c, dmg, null);
  }

  /** Estados periódicos: sangrado. */
  tickStatus(c: Cat, dt: number) {
    if (c.bleedT > 0) {
      const before = Math.floor(c.bleedT * 3);
      c.bleedT = Math.max(0, c.bleedT - dt);
      this.hurt(c, T.bleedDps * dt, null);
      if (Math.floor(c.bleedT * 3) !== before) this.g.effects.ring(c.x, c.y + 0.4, c.z, 0.9, 0xc0182a, 0.3);
    }
  }

  /** Zarpazo. En el aire es un picado: más daño y alcance. */
  claw(c: Cat) {
    const air = !c.onGround && !c.climb;
    c.clawCd = T.clawCd; c.clawAnim = T.clawAnim;
    this.g.audio.sfx(900 + c.clawLevel * 120, 0.05, 'sawtooth', 0.04);
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    const reach = c.clawReach * (air ? 1.15 : 1), dmg = c.clawDamage * (air ? T.pounceMul : 1);
    for (const o of this.g.fighters()) {
      if (o === c) continue;
      const dx = o.x - c.x, dy = o.y - c.y, dz = o.z - c.z, d = Math.hypot(dx, dz);
      if (d < reach && Math.abs(dy) < 1.6 && (d < 0.8 || (dx * fx + dz * fz) / d > 0.35)) {
        this.hit(o, {
          from: c, attacker: c, dmg, stun: T.stun * 0.8, knock: 13 + 2 * c.clawLevel + (air ? 4 : 0),
          kibbles: T.clawDrop, msg: c.clawLevel > 0 ? '¡Zarpazo afilado!' : '¡Zarpazo!',
        });
      }
    }
  }

  /** Lanza el objeto que lleva el gato, o una bola de pelo si no lleva ninguno. */
  throwObject(c: Cat): boolean {
    let def: ThrowDef;
    if (c.held) { def = THROWABLES[c.held]; c.held = null; }
    else if (c.ballN > 0) { def = THROWABLES.hairball; c.ballN--; c.ballT = 0; }
    else return false;
    let fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), up = 0.08, best = 0.93;
    for (const o of this.g.fighters()) {     // puntería asistida
      if (o === c) continue;
      const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz);
      if (d > 30 || d < 0.1) continue;
      const dot = (dx * fx + dz * fz) / d;
      if (dot > best) { best = dot; up = (o.y - c.y) / d + 0.06 + (0.5 * def.gravity * d) / (def.speed * def.speed); fx = dx / d; fz = dz / d; }
    }
    this.g.projectiles.spawn(def, c, c.x + fx * 0.9, c.y + 0.9 * c.breed.look.scale + 0.1, c.z + fz * 0.9, fx * def.speed, up * def.speed + 1.5, fz * def.speed);
    this.g.audio.sfx(240, 0.09, 'triangle', 0.07);
    return true;
  }
}
