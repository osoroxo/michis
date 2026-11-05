import * as THREE from 'three';
import type { Cat } from '../entities/Cat';
import { makeThrowableMesh } from '../entities/ThrowableMesh';
import type { ThrowDef } from '../config/throwables';
import type { Ctx } from './ctx';

interface Proj {
  def: ThrowDef; owner: Cat; mesh: THREE.Object3D;
  x: number; y: number; z: number; vx: number; vy: number; vz: number;
  life: number; bounces: number;
}

export class Projectiles {
  private list: Proj[] = [];
  constructor(private g: Ctx, private scene: THREE.Scene) {}

  spawn(def: ThrowDef, owner: Cat, x: number, y: number, z: number, vx: number, vy: number, vz: number) {
    const mesh = makeThrowableMesh(def);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    this.list.push({ def, owner, mesh, x, y, z, vx, vy, vz, life: def.life, bounces: def.bounces });
  }

  /** ¿Viene un proyectil enemigo hacia este gato? (para que la IA esquive) */
  threat(c: Cat): boolean {
    for (const p of this.list) {
      if (p.owner === c) continue;
      const dx = c.x - p.x, dy = c.y + 0.5 - p.y, dz = c.z - p.z, d = Math.hypot(dx, dy, dz);
      if (d < 8 && (dx * p.vx + dy * p.vy + dz * p.vz) / (d * Math.hypot(p.vx, p.vy, p.vz) || 1) > 0.8) return true;
    }
    return false;
  }

  clear() { this.list.forEach((p) => this.scene.remove(p.mesh)); this.list = []; }

  update(dt: number) {
    const alive: Proj[] = [];
    for (const p of this.list) {
      if (this.step(p, dt)) { alive.push(p); p.mesh.position.set(p.x, p.y, p.z); p.mesh.rotation.x += dt * 9; p.mesh.rotation.z += dt * 5; }
      else this.scene.remove(p.mesh);
    }
    this.list = alive;
  }

  /** Devuelve false si el proyectil desaparece. */
  private step(p: Proj, dt: number): boolean {
    const d = p.def;
    p.life -= dt;
    p.vy -= d.gravity * dt;
    const px = p.x, py = p.y, pz = p.z;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.life <= 0) return this.impact(p, false);
    // suelo
    if (p.y < d.radius * 0.6) {
      if (p.bounces > 0) { p.bounces--; p.y = d.radius * 0.6; p.vy = Math.abs(p.vy) * 0.65; p.vx *= 0.8; p.vz *= 0.8; }
      else return this.impact(p, false);
    }
    // cajas
    for (const k of this.g.map.colliders) {
      if (p.x > k.x0 && p.x < k.x1 && p.y > k.y0 && p.y < k.y1 && p.z > k.z0 && p.z < k.z1) {
        if (p.bounces <= 0) return this.impact(p, false);
        p.bounces--;
        const wasX = px <= k.x0 || px >= k.x1, wasY = py <= k.y0 || py >= k.y1;
        if (wasY) { p.vy *= -0.65; } else if (wasX) { p.vx *= -0.8; } else { p.vz *= -0.8; }
        p.x = px; p.y = py; p.z = pz;
        break;
      }
    }
    // gatos
    for (const c of this.g.fighters()) {
      if (c === p.owner || c.dodgeT > 0) continue;       // quien esquiva deja pasar el objeto
      const dx = c.x - p.x, dy = c.y + 0.5 - p.y, dz = c.z - p.z, r = d.radius + 0.55;
      if (dx * dx + dy * dy + dz * dz < r * r) return this.impact(p, true, c);
    }
    return true;
  }

  /** Aplica el efecto del impacto. Siempre devuelve false (el proyectil muere). */
  private impact(p: Proj, hitCat: boolean, victim?: Cat): boolean {
    const d = p.def, c = this.g.combat;
    const base = { attacker: p.owner, stun: d.stun, kibbles: d.kibbleLoss, effect: d.effect };
    if (d.aoe > 0) {
      this.g.effects.ring(p.x, Math.max(0, p.y - 0.3), p.z, d.aoe, d.color, 0.45);
      this.g.audio.sfx(300, 0.2, 'sawtooth', 0.09);
      for (const o of this.g.fighters()) {
        if (o === p.owner) continue;
        const dist = Math.hypot(o.x - p.x, o.z - p.z);
        if (dist < d.aoe && Math.abs(o.y - p.y) < 2.4) {
          c.hit(o, { ...base, from: { x: p.x, z: p.z }, dmg: d.dmg * (1 - (dist / d.aoe) * 0.5), knock: d.knock, msg: d.msg });
        }
      }
    } else if (hitCat && victim) {
      c.hit(victim, { ...base, from: { x: p.x - p.vx * 0.1, z: p.z - p.vz * 0.1 }, dmg: d.dmg, knock: d.knock, msg: d.msg });
    }
    return false;
  }
}
