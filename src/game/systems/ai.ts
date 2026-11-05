import type { Cat } from '../entities/Cat';
import { neutralCtl } from '../types';
import { T } from '../config/tuning';
import type { Ctx } from './ctx';

/** IA de carrera: sigue los waypoints, salta si choca, ataca a quien tiene delante. */
export function raceBot(g: Ctx, c: Cat, dt: number) {
  const C = neutralCtl();
  c.ctl = C;
  if (c.finished || c.down) return;
  const wps = g.map.track.waypoints;
  const wi = Math.min(c.wp, wps.length - 1), w = wps[wi], o = c.offs[wi] ?? [0, 0];
  const dx = w[0] + o[0] - c.x, dz = w[1] + o[1] - c.z, d = Math.hypot(dx, dz) || 1;
  C.mx = dx / d; C.mz = dz / d; C.run = true;
  if (c.wallHit && c.onGround && !c.climb) C.jump = true;
  maybeDodge(g, c, C, false);
  c.botT += dt;
  if (c.botT >= 1) {
    c.botT = 0;
    const moved = Math.hypot(c.x - c.botX, c.z - c.botZ) + (c.climb ? Math.abs(c.y - c.botY) * 2 : 0);
    c.botX = c.x; c.botZ = c.z; c.botY = c.y;
    c.stuck = moved < 1.3 ? c.stuck + 1 : 0;
    if (c.stuck >= 3) { c.stuck = 0; g.mode.rescue(c); }
  }
  engage(g, c, C, 0.7, 0.2, 0.15);
}

/** Esquiva si viene un proyectil (o, en batalla, si un enemigo está encima). */
function maybeDodge(g: Ctx, c: Cat, C: ReturnType<typeof neutralCtl>, melee: boolean) {
  if (c.dodgeCd > 0 || c.stun > 0 || c.climb) return;
  let want = g.projectiles.threat(c) && Math.random() < 0.08;
  if (!want && melee) {
    for (const v of g.fighters()) {
      if (v === c) continue;
      const d = Math.hypot(v.x - c.x, v.z - c.z);
      if (d < 2.6 && Math.abs(v.y - c.y) < 1.5 && v.clawCd > T.clawCd - 0.15 && Math.random() < 0.35) { want = true; break; }
    }
  }
  if (!want) return;
  C.dodge = true;
  const s = Math.random() < 0.5 ? -1 : 1, fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
  C.mx = fz * s; C.mz = -fx * s;          // hacia un lado
}

/** Zarpazos y lanzamientos oportunistas. Se evalúa una vez por segundo aprox. (con c.botT). */
function engage(g: Ctx, c: Cat, C: ReturnType<typeof neutralCtl>, pClaw: number, pBall: number, pObj: number) {
  if (c.botT > 0.05) return;
  const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
  for (const v of g.fighters()) {
    if (v === c) continue;
    const ex = v.x - c.x, ez = v.z - c.z, e = Math.hypot(ex, ez) || 1, dot = (ex * fx + ez * fz) / e;
    if (e < c.clawReach - 0.1 && dot > 0.4 && Math.random() < pClaw) C.claw = true;
    else if (e < 22 && dot > 0.93 && c.held && Math.random() < pObj + 0.3) C.throw = true;
    else if (e < 20 && dot > 0.93 && c.ballN > 0 && Math.random() < pBall) C.throw = true;
  }
}

/**
 * Navegación entre pisos: la ruta de carrera del mapa recorre todas las plantas por sus escaleras (y se puede
 * andar en ambos sentidos). Si el rival está en otro piso, el bot avanza por la ruta hacia el punto más cercano a él.
 */
function stairGoal(g: Ctx, c: Cat, tx: number, ty: number, tz: number): [number, number] | null {
  const { waypoints: W, wpY } = g.map.track;
  const nearest = (x: number, y: number, z: number) => {
    let bi = 0, bd = 1e9;
    W.forEach((w, i) => { const d = Math.hypot(w[0] - x, w[1] - z) + Math.abs(wpY[i] - y) * 3; if (d < bd) { bd = d; bi = i; } });
    return bi;
  };
  const a = nearest(c.x, c.y, c.z), t = nearest(tx, ty, tz);
  if (a === t) return null;
  const n = W[a + (t > a ? 1 : -1)];
  return [n[0], n[1]];
}

/** IA de batalla: busca objetos, se cura, se afila las garras y persigue al enemigo más cercano. */
export function battleBot(g: Ctx, c: Cat, dt: number) {
  const C = neutralCtl();
  c.ctl = C;
  if (c.down) return;
  c.botT += dt;
  c.targetT -= dt; c.strafeT -= dt;
  const others = g.fighters().filter((o) => o !== c);
  if (c.targetT <= 0 || !others.some((o) => o.i === c.targetId)) {
    c.targetT = 0.6;
    let best = 1e9;
    c.targetId = -1;
    for (const o of others) {
      const d = Math.hypot(o.x - c.x, o.z - c.z) + Math.abs(o.y - c.y) * 3;
      if (d < best) { best = d; c.targetId = o.i; }
    }
  }
  if (c.strafeT <= 0) { c.strafeT = 0.8 + Math.random() * 1.2; c.strafe = Math.random() < 0.5 ? -1 : 1; }
  const tgt = others.find((o) => o.i === c.targetId);
  const eDist = tgt ? Math.hypot(tgt.x - c.x, tgt.z - c.z) : 1e9;

  let goal: [number, number] | null = null;
  let sharpening = false;
  const lowHp = c.hp < c.hpMax * 0.4 || c.bleedT > 0;
  const milk = lowHp ? g.pickups.nearest('milk', c.x, c.y, c.z, 45) : null;
  const obj = !c.held && eDist > 7 ? g.pickups.nearest('throw', c.x, c.y, c.z, 30) : null;
  if (milk) goal = [milk[0], milk[2]];
  else if (obj) goal = [obj[0], obj[2]];
  else if (c.clawLevel < 2 && eDist > 14 && c.hp > c.hpMax * 0.5) {
    let bd = 25, bp: [number, number] | null = null;
    for (const k of g.motion.colliders) {
      if (!k.climb || k.y0 > 0.1) continue;
      const px = Math.max(k.x0, Math.min(c.x, k.x1)), pz = Math.max(k.z0, Math.min(c.z, k.z1)), d = Math.hypot(px - c.x, pz - c.z);
      if (d < bd) { bd = d; bp = [px, pz]; }
    }
    if (bp) { goal = bp; sharpening = bd < 1.5; }
  }
  if (!goal && tgt) goal = (Math.abs(tgt.y - c.y) > 2.5 && stairGoal(g, c, tgt.x, tgt.y, tgt.z)) || [tgt.x, tgt.z];
  if (goal && !sharpening) {
    const dx = goal[0] - c.x, dz = goal[1] - c.z, d = Math.hypot(dx, dz) || 1;
    const chasing = tgt && goal[0] === tgt.x && goal[1] === tgt.z;
    if (!chasing || d > 1.6) {
      C.mx = dx / d; C.mz = dz / d;
      if (chasing && d < 8) { C.mx += (-dz / d) * 0.35 * c.strafe; C.mz += (dx / d) * 0.35 * c.strafe; }
      C.run = true;
    }
    if (c.wallHit && c.onGround && !c.climb) C.jump = true;
    if (chasing && tgt && tgt.y - c.y > 1.5 && d < 6 && c.onGround) C.jump = true;
  }
  if (sharpening) C.sharpen = true;

  // ataque (se evalúa cada ~0.2 s)
  maybeDodge(g, c, C, true);
  if (c.botT >= 0.2 && tgt) {
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), ex = tgt.x - c.x, ez = tgt.z - c.z, e = Math.hypot(ex, ez) || 1, dot = (ex * fx + ez * fz) / e;
    if (e < c.clawReach - 0.1 && dot > 0.4 && Math.abs(tgt.y - c.y) < 1.5) C.claw = true;
    else if (c.held && e > 3 && e < 24 && dot > 0.92 && Math.random() < 0.6) C.throw = true;
    else if (c.ballN > 0 && e > 5 && e < 20 && dot > 0.93 && Math.random() < 0.25) C.throw = true;
  }
  if (c.botT >= 1) {
    c.botT = 0;
    const moved = Math.hypot(c.x - c.botX, c.z - c.botZ) + (c.climb ? Math.abs(c.y - c.botY) * 2 : 0);
    c.botX = c.x; c.botZ = c.z; c.botY = c.y;
    c.stuck = moved < 1.0 && !c.sharpening && eDist > 3 ? c.stuck + 1 : 0;
    if (c.stuck >= 4) { c.stuck = 0; g.mode.rescue(c); }
  }
}
