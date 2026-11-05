import type { Collider, Zone } from '../types';
import { T } from '../config/tuning';
import type { Cat } from '../entities/Cat';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** Colisiones de cajas alineadas a ejes: movimiento por ejes, escalones, escalada. */
export class Motion {
  constructor(readonly colliders: Collider[], readonly bounds: Zone, private onClimb: (c: Cat) => void) {}

  overlap(c: Cat, k: Collider) {
    return c.x + T.halfW > k.x0 && c.x - T.halfW < k.x1 && c.z + T.halfW > k.z0 && c.z - T.halfW < k.z1 && c.y + T.height > k.y0 && c.y < k.y1;
  }

  groundAt(x: number, z: number, y: number) {
    let g = 0;
    for (const c of this.colliders) if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1 && c.y1 <= y + 0.05 && c.y1 > g) g = c.y1;
    return g;
  }

  moveH(c: Cat, axis: 'x' | 'z', d: number) {
    if (!d) return;
    c[axis] += d;
    for (const k of this.colliders) {
      if (!this.overlap(c, k)) continue;
      const top = k.y1 - c.y;
      if (top > 0 && top <= 0.42 && c.onGround) {            // subir escalón
        const oy = c.y;
        c.y = k.y1 + 0.001;
        if (!this.colliders.some((o) => this.overlap(c, o))) continue;
        c.y = oy;
      }
      const lo = axis === 'x' ? 'x0' : 'z0', hi = axis === 'x' ? 'x1' : 'z1';
      let n: number;
      if (d > 0) { c[axis] = k[lo] - T.halfW - 0.001; n = -1; } else { c[axis] = k[hi] + T.halfW + 0.001; n = 1; }
      if (axis === 'x') c.vx = 0; else c.vz = 0;
      c.wallHit = true;
      if (k.climb && !c.climb && c.climbCd <= 0 && c.y < k.y1 - 0.2 && !c.sharpening) {
        const push = (axis === 'x' ? c.ctl.mx : c.ctl.mz) * n;
        if (push < -0.25) {
          c.climb = { k, nx: axis === 'x' ? n : 0, nz: axis === 'z' ? n : 0 };
          c.vy = 0; c.vx = 0; c.vz = 0; c.climbed = true; c.jumpsUsed = 0;
          this.onClimb(c);
        }
      }
    }
  }

  moveV(c: Cat, d: number) {
    c.y += d;
    c.onGround = false;
    for (const k of this.colliders) {
      if (!this.overlap(c, k)) continue;
      if (d <= 0) { c.y = k.y1; c.onGround = true; } else c.y = k.y0 - T.height - 0.001;
      c.vy = 0;
    }
    if (c.y <= 0) { c.y = 0; c.vy = 0; c.onGround = true; }
  }

  clampToBounds(c: Cat) {
    c.x = clamp(c.x, this.bounds.x0, this.bounds.x1);
    c.z = clamp(c.z, this.bounds.z0, this.bounds.z1);
  }

  /** Superficie de sisal cercana, si el gato puede afilarse ahí. */
  sisalNear(c: Cat): { px: number; pz: number } | null {
    let best: { px: number; pz: number } | null = null, bd: number = T.sharpenRange;
    for (const k of this.colliders) {
      if (!k.climb || c.y >= k.y1 - 0.2) continue;
      const px = clamp(c.x, k.x0, k.x1), pz = clamp(c.z, k.z0, k.z1);
      const d = Math.hypot(px - c.x, pz - c.z);
      if (d <= bd) { bd = d; best = { px, pz }; }
    }
    return best;
  }

  /** Primer punto de choque de un rayo con las cajas (para que la cámara no atraviese paredes). */
  rayShorten(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number, maxT: number): number {
    let t = maxT;
    for (const k of this.colliders) {
      let a = 0, b = t, ok = true;
      for (const [o, d, lo, hi] of [[ox, dx, k.x0, k.x1], [oy, dy, k.y0, k.y1], [oz, dz, k.z0, k.z1]] as const) {
        if (Math.abs(d) < 1e-6) { if (o < lo || o > hi) { ok = false; break; } continue; }
        let t1 = (lo - o) / d, t2 = (hi - o) / d;
        if (t1 > t2) { const s = t1; t1 = t2; t2 = s; }
        if (t1 > a) a = t1;
        if (t2 < b) b = t2;
        if (a > b) { ok = false; break; }
      }
      if (ok && a > 0.05 && a < t) t = a;
    }
    return t;
  }

  inSolid(x: number, y: number, z: number) {
    return this.colliders.some((c) => x > c.x0 - 0.3 && x < c.x1 + 0.3 && z > c.z0 - 0.3 && z < c.z1 + 0.3 && y > c.y0 - 0.2 && y < c.y1 + 0.2);
  }
}
