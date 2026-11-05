import * as THREE from 'three';
import type { Cat } from '../entities/Cat';
import type { Motion } from './Motion';

/** Cámara en tercera persona que sigue al gato, esquiva paredes y se abre al correr. */
export class CameraRig {
  readonly cam = new THREE.PerspectiveCamera(66, 1, 0.1, 400);
  constructor(private motion: Motion) {}

  resize(w: number, h: number) { this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); }

  follow(c: Cat, dt: number) {
    const cam = this.cam;
    const moving = Math.hypot(c.vx, c.vz) > 1.5;
    let rate = c.climb ? 4 : moving ? 2.4 : 0.6;
    let d = c.yaw - c.camYaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) > 2.7 && !c.climb) rate *= 0.5;
    c.camYaw += d * Math.min(1, dt * rate);
    c.camOff += (c.look * 1.5 - c.camOff) * Math.min(1, dt * 7);
    const yaw = c.camYaw + c.camOff, fx = Math.sin(yaw), fz = Math.cos(yaw);
    const sc = c.breed.look.scale;
    const dist = (c.climb ? 5.5 : 7) * sc, hgt = c.climb ? 1.2 : 3.5;
    const hx = c.x, hy = c.y + 1, hz = c.z;
    let dx = -fx * dist, dy = hgt, dz = -fz * dist;
    const L = Math.hypot(dx, dy, dz);
    dx /= L; dy /= L; dz /= L;
    const t = this.motion.rayShorten(hx, hy, hz, dx, dy, dz, L);
    const s = Math.max(0.8, t - 0.35);
    const k = c.camInit ? Math.min(1, dt * 11) : 1;
    c.camInit = true;
    c.cx += (hx + dx * s - c.cx) * k; c.cy += (hy + dy * s - c.cy) * k; c.cz += (hz + dz * s - c.cz) * k;
    cam.position.set(c.cx, c.cy, c.cz);
    cam.lookAt(c.x + fx * 2, c.y + (c.climb ? 2.4 : 1), c.z + fz * 2);
    const fov = 66 + (c.ultra > 0 ? 16 : c.tier === 2 ? 5 : 0);
    cam.fov += (fov - cam.fov) * Math.min(1, dt * 6);
    cam.updateProjectionMatrix();
  }

  /** Órbita lenta sobre la casa (fondo de menú). */
  orbit(time: number, center: [number, number, number], look: [number, number, number]) {
    const a = time * 0.12;
    this.cam.position.set(center[0] + Math.sin(a) * 26, center[1] * 1.05, center[2] * 0.55 + Math.cos(a) * 8);
    this.cam.lookAt(look[0], look[1], look[2]);
    this.cam.fov = 46; this.cam.updateProjectionMatrix();
  }
}
