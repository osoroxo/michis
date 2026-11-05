import * as THREE from 'three';
import { T } from '../config/tuning';
import { THROWABLES, PICKABLE, type ThrowDef } from '../config/throwables';
import { makeThrowableMesh } from '../entities/ThrowableMesh';
import type { Cat } from '../entities/Cat';
import type { Ctx } from './ctx';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const DROPS = 36;

interface Kib { x: number; y: number; z: number; alive: boolean; t: number; temp: boolean; vx: number; vy: number; vz: number; landed: boolean; life: number }
interface Special {
  kind: 'fish' | 'milk' | 'throw';
  def?: ThrowDef;
  mesh: THREE.Object3D;
  x: number; y: number; z: number;
  alive: boolean; t: number; phase: number;
}

function fishMesh(): THREE.Group {
  const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: 0x4fd1e0, emissive: 0x124f58 });
  const b = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 5), mat); b.rotation.z = Math.PI / 2;
  const t = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.5, 4), mat); t.rotation.z = -Math.PI / 2; t.position.x = 0.72;
  g.add(b, t);
  return g;
}
function milkMesh(): THREE.Group {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x333344 }));
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.52), new THREE.MeshLambertMaterial({ color: 0x4f9bd9, emissive: 0x102040 }));
  top.position.y = 0.4;
  g.add(b, top);
  return g;
}

/** Croquetas, pescados (ultra), leche (curación) y objetos arrojadizos del suelo. */
export class Pickups {
  private kibs: Kib[] = [];
  private kibMesh: THREE.InstancedMesh | null = null;
  private specials: Special[] = [];
  private m4 = new THREE.Matrix4();
  private kibCount = 0;

  constructor(private g: Ctx, private scene: THREE.Scene) {
    const sp = g.map.spawns, race = g.config.mode === 'race';
    if (race) {
      sp.kibbles.forEach(([x, y, z]) => this.kibs.push({ x, y, z, alive: true, t: 0, temp: false, vx: 0, vy: 0, vz: 0, landed: true, life: 0 }));
      this.kibCount = this.kibs.length;
      for (let i = 0; i < DROPS; i++) this.kibs.push({ x: 0, y: -9, z: 0, alive: false, t: 0, temp: true, vx: 0, vy: 0, vz: 0, landed: false, life: 0 });
      this.kibMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.27, 0), new THREE.MeshLambertMaterial({ color: 0xd9822b, emissive: 0x4a2408 }), this.kibs.length);
      this.kibMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.kibMesh.frustumCulled = false;
      scene.add(this.kibMesh);
      this.kibs.forEach((_, i) => this.syncKib(i));
    }
    const add = (kind: Special['kind'], p: [number, number, number], mesh: THREE.Object3D, def?: ThrowDef) => {
      mesh.position.set(...p);
      scene.add(mesh);
      this.specials.push({ kind, def, mesh, x: p[0], y: p[1], z: p[2], alive: true, t: 0, phase: Math.random() * 6 });
    };
    sp.fish.forEach((p) => add('fish', p, fishMesh()));
    sp.milk.slice(0, race ? 4 : 8).forEach((p) => add('milk', p, milkMesh()));
    // Objetos del suelo: reparto ponderado por tipo. En carrera, la mitad.
    const bag: ThrowDef[] = PICKABLE.flatMap((id) => Array<ThrowDef>(THROWABLES[id].weight).fill(THROWABLES[id]));
    sp.throwables.forEach((p, i) => {
      if (race && i % 2) return;
      const def = bag[(i * 7 + 3) % bag.length];
      const m = makeThrowableMesh(def);
      m.scale.setScalar(1.25);
      add('throw', [p[0], p[1] + 0.35, p[2]], m, def);
    });
  }

  private syncKib(i: number) {
    if (!this.kibMesh) return;
    const k = this.kibs[i], s = k.alive ? 1 : 0;
    this.m4.makeScale(s, s, s);
    this.m4.setPosition(k.x, k.y, k.z);
    this.kibMesh.setMatrixAt(i, this.m4);
    this.kibMesh.instanceMatrix.needsUpdate = true;
  }

  reset() {
    this.kibs.forEach((k, i) => { k.alive = !k.temp; this.syncKib(i); });
    this.specials.forEach((s) => { s.alive = true; s.mesh.visible = true; });
  }

  /** Suelta croquetas del gato en abanico. */
  dropKibble(c: Cat, n: number) {
    n = Math.min(n, c.score);
    c.score -= n;
    for (let i = this.kibCount; i < this.kibs.length && n > 0; i++) {
      const k = this.kibs[i];
      if (k.alive) continue;
      const a = Math.random() * 6.28;
      Object.assign(k, { alive: true, x: c.x, y: c.y + 1, z: c.z, vx: Math.cos(a) * 5, vy: 8, vz: Math.sin(a) * 5, t: 0.6, landed: false, life: 10 });
      n--;
    }
  }

  update(dt: number, time: number) {
    const { map, motion, audio } = this.g, B = map.bounds, cats = this.g.fighters();
    for (let i = 0; i < this.kibs.length; i++) {
      const k = this.kibs[i];
      if (k.temp && k.alive) {
        k.t -= dt; k.life -= dt;
        if (!k.landed) {
          k.vy -= 26 * dt;
          k.x = clamp(k.x + k.vx * dt, B.x0 + 0.5, B.x1 - 0.5); k.z = clamp(k.z + k.vz * dt, B.z0 + 0.5, B.z1 - 0.5); k.y += k.vy * dt;
          const gy = motion.groundAt(k.x, k.z, k.y + 1) + 0.45;
          if (k.y <= gy && k.vy < 0) { k.y = gy; k.landed = true; }
          this.syncKib(i);
        }
        if (k.life <= 0) { k.alive = false; this.syncKib(i); continue; }
      }
      if (!k.alive && !k.temp) { k.t -= dt; if (k.t <= 0) { k.alive = true; this.syncKib(i); } continue; }
      if (!k.alive || (k.temp && k.t > 0)) continue;
      for (const c of cats) {
        if (c.finished || c.stun > 0) continue;
        const dx = c.x - k.x, dy = c.y + 0.5 - k.y, dz = c.z - k.z;
        if (dx * dx + dy * dy + dz * dz < 1.75) { k.alive = false; k.t = T.kibbleRespawn; c.score++; this.syncKib(i); audio.sfx(760 + Math.random() * 140, 0.04, 'sine', 0.03); break; }
      }
    }
    for (const s of this.specials) {
      if (!s.alive) { s.t -= dt; if (s.t <= 0) { s.alive = true; s.mesh.visible = true; } continue; }
      s.mesh.rotation.y = time * 2 + s.phase;
      s.mesh.position.y = s.y + Math.sin(time * 3 + s.phase) * 0.12;
      for (const c of cats) {
        if (c.finished) continue;
        const dx = c.x - s.x, dy = c.y + 0.5 - s.y, dz = c.z - s.z;
        if (dx * dx + dy * dy + dz * dz >= 2.6) continue;
        if (this.collect(s, c)) { s.alive = false; s.mesh.visible = false; break; }
      }
    }
  }

  /** Pickup vivo más cercano de un tipo (para la IA). */
  nearest(kind: Special['kind'], x: number, y: number, z: number, maxDist: number): [number, number, number] | null {
    let best: Special | null = null, bd = maxDist;
    for (const s of this.specials) {
      if (!s.alive || s.kind !== kind) continue;
      const d = Math.hypot(s.x - x, s.z - z) + Math.abs(s.y - y) * 2;
      if (d < bd) { bd = d; best = s; }
    }
    return best ? [best.x, best.y, best.z] : null;
  }

  /** Devuelve true si el gato se lleva el objeto. */
  private collect(s: Special, c: Cat): boolean {
    const a = this.g.audio;
    if (s.kind === 'fish') { c.ultra = T.ultraTime; c.say('¡Ultra rápido!', 1.4); a.sfx(980, 0.18, 'square', 0.06); s.t = T.fishRespawn; return true; }
    if (s.kind === 'milk') {
      if (c.hp >= c.hpMax && c.bleedT <= 0 && c.slowT <= 0) return false;
      c.hp = Math.min(c.hpMax, c.hp + T.milkHeal); c.bleedT = 0; c.slowT = 0;
      c.say('¡Leche! Te curas', 1.4); a.sfx(700, 0.2, 'sine', 0.06); s.t = T.milkRespawn; return true;
    }
    if (c.held || !s.def) return false;
    c.held = s.def.id; c.say(`${s.def.name} (G para lanzar)`, 1.6); a.sfx(560, 0.08, 'triangle', 0.06); s.t = T.throwableRespawn;
    return true;
  }
}
