import { T } from '../config/tuning';
import type { Cat } from '../entities/Cat';
import type { Ctx } from './ctx';

const inZone = (z: { x0: number; x1: number; z0: number; z1: number }, x: number, c: number) => x >= z.x0 && x <= z.x1 && c >= z.z0 && c <= z.z1;

/** Un paso de simulación de un gato: movimiento, salto doble, escalada, afilado, acciones. */
export class CatController {
  constructor(private g: Ctx) {}

  step(c: Cat, dt: number) {
    const { motion: M, combat, audio } = this.g;
    const C = c.ctl;
    for (const k of ['climbCd', 'clawCd', 'clawAnim', 'stun', 'inv', 'ultra', 'slowT', 'lastAttackT', 'dodgeT', 'dodgeCd'] as const) if (c[k] > 0) c[k] = Math.max(0, c[k] - dt);
    if (c.ballN < T.ballMax) { c.ballT += dt; if (c.ballT >= T.ballRegen) { c.ballT = 0; c.ballN++; } }
    combat.tickStatus(c, dt);
    c.wallHit = false;
    const stunned = c.stun > 0;
    if (stunned) { C.mx = C.mz = 0; C.jump = C.claw = C.throw = C.sharpen = false; }
    this.sharpen(c, dt);
    if (C.dodge && c.dodgeCd <= 0 && !stunned && !c.climb && !c.finished) this.startDodge(c);

    const mag = Math.min(1, Math.hypot(C.mx, C.mz));
    const inPuddle = this.g.map.puddles.some((z) => inZone(z, c.x, c.z)) && c.y < 0.3;
    const base = c.ultra > 0 ? T.ultra : C.run ? T.run : T.walk;
    c.tier = mag < 0.05 ? 0 : c.ultra > 0 ? 3 : C.run ? 2 : 1;
    const slow = (inPuddle ? T.puddleSlow : 1) * (c.slowT > 0 ? T.fall.slowMul : 1);
    const speed = base * c.speedMul * slow * c.botPace;
    const jumpV = T.jump * c.jumpMul;
    const airBefore = !c.onGround && !c.climb;

    if (c.climb) {
      const cl = c.climb, k = cl.k;
      c.yaw = Math.atan2(-cl.nx, -cl.nz);
      const into = -(C.mx * cl.nx + C.mz * cl.nz);
      const tx = -cl.nz, tz = cl.nx, lateral = C.mx * tx + C.mz * tz;
      if (C.jump) {
        c.climb = null; c.climbCd = 0.4; c.vx = cl.nx * 9; c.vz = cl.nz * 9; c.vy = jumpV * 0.92; c.jumpsUsed = 1;
        c.yaw = Math.atan2(cl.nx, cl.nz);
        audio.sfx(620, 0.06, 'square', 0.05);
      } else if (into < -0.3 || stunned) { c.climb = null; c.climbCd = 0.5; }
      else {
        const v = into > 0.2 ? (c.ultra > 0 ? T.climbUltra : C.run ? T.climbRun : T.climb) * (c.slowT > 0 ? 0.7 : 1) : 0;
        c.vy = 0;
        M.moveV(c, v * dt);
        c.onGround = false;
        if (cl.nx) M.moveH(c, 'z', tz * lateral * 3 * dt); else M.moveH(c, 'x', tx * lateral * 3 * dt);
        const off = cl.nx ? c.z < k.z0 - T.halfW || c.z > k.z1 + T.halfW : c.x < k.x0 - T.halfW || c.x > k.x1 + T.halfW;
        if (off) { c.climb = null; c.climbCd = 0.3; }
        else if (c.y >= k.y1 - 0.1) {                    // coronar la cima
          c.y = k.y1 + 0.02; c.x -= cl.nx * 0.95; c.z -= cl.nz * 0.95;
          c.climb = null; c.climbCd = 0.3; c.onGround = true; c.vy = 0;
        }
      }
    } else {
      const tx = C.mx * speed, tz = C.mz * speed, a = (c.onGround ? T.accelGround : T.accelAir) * dt;
      const dx = tx - c.vx, dz = tz - c.vz, dl = Math.hypot(dx, dz);
      if (c.dodgeT > 0) { /* en plena esquiva: se conserva el impulso */ }
      else if (dl <= a) { c.vx = tx; c.vz = tz; } else { c.vx += (dx / dl) * a; c.vz += (dz / dl) * a; }
      if (C.jump) {
        if (c.onGround) { c.vy = jumpV; c.onGround = false; c.jumpsUsed = 1; audio.sfx(520, 0.07, 'square', 0.04); }
        else if (c.jumpsUsed < 2) {                      // doble salto
          c.vy = T.jump2 * c.jumpMul; c.jumpsUsed = 2; c.peakY = Math.max(c.peakY, c.y);
          audio.sfx(780, 0.08, 'square', 0.04);
          this.g.effects.ring(c.x, c.y + 0.1, c.z, 1.4, 0xffffff, 0.25);
        }
      }
      c.vy -= T.gravity * dt;
      M.moveH(c, 'x', c.vx * dt);
      M.moveH(c, 'z', c.vz * dt);
      if (!c.climb) M.moveV(c, c.vy * dt);
      if (mag > 0.05 && !stunned) {
        const want = Math.atan2(C.mx, C.mz);
        let d = want - c.yaw;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        c.yaw += d * Math.min(1, dt * 14);
      }
    }
    M.clampToBounds(c);

    // Altura y caídas: el pico se renueva en suelo o pared; al aterrizar se mide la caída.
    if (airBefore && c.onGround && !c.climb) {
      const drop = c.peakY - c.y;
      if (drop > T.fall.safe) combat.fall(c, drop);
    }
    if (c.onGround) c.jumpsUsed = 0;
    c.peakY = c.onGround || c.climb ? c.y : Math.max(c.peakY, c.y);

    if (c.dodgeT <= 0) {
      if (C.claw && c.clawCd <= 0 && !c.finished && !c.sharpening) combat.claw(c);
      if (C.throw && !c.finished) combat.throwObject(c);
    }
  }

  /** Esquiva: un bote rápido hacia donde se empuja (o hacia atrás) con invulnerabilidad breve. */
  private startDodge(c: Cat) {
    const C = c.ctl, mag = Math.hypot(C.mx, C.mz), D = T.dodge;
    const dx = mag > 0.1 ? C.mx / mag : -Math.sin(c.yaw), dz = mag > 0.1 ? C.mz / mag : -Math.cos(c.yaw);
    c.dodgeT = D.time; c.dodgeCd = D.cd;
    c.vx = dx * D.speed; c.vz = dz * D.speed;
    if (c.onGround) { c.vy = D.hop; c.onGround = false; c.jumpsUsed = Math.max(c.jumpsUsed, 1); }
    c.sharpening = false; c.sharpenT = 0;
    this.g.audio.sfx(660, 0.08, 'triangle', 0.05);
    this.g.effects.ring(c.x, c.y + 0.1, c.z, 1.6, 0xbfe9ff, 0.3);
  }

  /** Afilar garras: mantener junto a sisal, quieto, hasta completar la barra. */
  private sharpen(c: Cat, dt: number) {
    const C = c.ctl;
    const ok = C.sharpen && c.stun <= 0 && c.onGround && !c.climb && !c.finished && !c.down && !C.jump;
    const s = ok ? this.g.motion.sisalNear(c) : null;
    if (!s) { c.sharpening = false; c.sharpenT = 0; return; }
    if (c.clawLevel >= T.sharpenMax) {
      c.sharpening = false;
      if (c.msgT <= 0) c.say('Garras al máximo', 1);
      return;
    }
    c.sharpening = true;
    C.mx = C.mz = 0; c.vx = c.vz = 0;
    const want = Math.atan2(s.px - c.x, s.pz - c.z);
    let d = want - c.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    c.yaw += d * Math.min(1, dt * 12);
    const before = Math.floor(c.sharpenT * 5);
    c.sharpenT += dt;
    if (Math.floor(c.sharpenT * 5) !== before) this.g.audio.sfx(300 + Math.random() * 200, 0.05, 'sawtooth', 0.03);
    if (c.sharpenT >= T.sharpenTime) {
      c.sharpenT = 0; c.clawLevel++;
      c.say(`¡Garras afiladas Nv.${c.clawLevel}!`, 1.6);
      this.g.audio.sfx(1100, 0.2, 'square', 0.06);
      this.g.effects.ring(c.x, c.y + 0.3, c.z, 1.6, 0xffe28a, 0.35);
    }
  }
}
