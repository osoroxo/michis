import * as THREE from 'three';
import type { Collider, Vec2, Zone } from '../types';

export type ClimbTex = 'sisal' | 'bark' | 'stone';
export interface BoxOpts { climb?: boolean; solid?: boolean; tex?: ClimbTex }
export type FloorPattern = 'planks' | 'tiles' | 'carpet' | 'concrete' | 'grass';
export interface FloorOpts { y?: number; pattern?: FloorPattern; tint2?: string; label?: string }
export type Door = [number, number];

const unitBox = new THREE.BoxGeometry(1, 1, 1);

function makeBarkTexture(): THREE.CanvasTexture {
  const k = document.createElement('canvas');
  k.width = k.height = 64;
  const g = k.getContext('2d')!;
  g.fillStyle = '#6b4a2b'; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 64; i += 8) { g.fillStyle = i % 16 ? '#523820' : '#7d5a37'; g.fillRect(i, 0, 5, 64); }
  g.fillStyle = '#3d2814'; for (let i = 0; i < 18; i++) g.fillRect(Math.floor(Math.random() * 64), Math.floor(Math.random() * 60), 2, 8);
  const t = new THREE.CanvasTexture(k);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeStoneTexture(): THREE.CanvasTexture {
  const k = document.createElement('canvas');
  k.width = k.height = 64;
  const g = k.getContext('2d')!;
  g.fillStyle = '#c9b88c'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#a39468';
  for (let y = 0; y < 64; y += 16) { g.fillRect(0, y, 64, 3); for (let x = (y / 16) % 2 ? 0 : 16; x < 64; x += 32) g.fillRect(x, y, 3, 16); }
  g.fillStyle = '#dccda0'; for (let i = 0; i < 20; i++) g.fillRect(Math.floor(Math.random() * 62), Math.floor(Math.random() * 62), 3, 2);
  const t = new THREE.CanvasTexture(k);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeSisalTexture(): THREE.CanvasTexture {
  const k = document.createElement('canvas');
  k.width = k.height = 64;
  const g = k.getContext('2d')!;
  g.fillStyle = '#d9b26a'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#b98a43';
  for (let i = 0; i < 64; i += 16) g.fillRect(0, i, 64, 6);
  g.fillStyle = '#ecd096';
  for (let i = 4; i < 64; i += 16) g.fillRect(0, i + 6, 64, 2);
  const t = new THREE.CanvasTexture(k);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/**
 * Pincel para construir escenarios en bloques. Coordenadas del mundo: x/z en el plano, y hacia arriba.
 * Las cajas con `solid` entran en las colisiones; las demás son decoración.
 */
export class MapBuilder {
  readonly root = new THREE.Group();
  readonly colliders: Collider[] = [];
  private readonly mats = new Map<number, THREE.MeshLambertMaterial>();
  private readonly texs: Record<ClimbTex, THREE.CanvasTexture> = { sisal: makeSisalTexture(), bark: makeBarkTexture(), stone: makeStoneTexture() };

  pt = (x: number, z: number): Vec2 => [x, z];

  private mat(c: number) {
    let m = this.mats.get(c);
    if (!m) { m = new THREE.MeshLambertMaterial({ color: c }); this.mats.set(c, m); }
    return m;
  }

  /** Caja alineada a ejes. */
  box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: number, o: BoxOpts = {}): THREE.Mesh {
    const m = new THREE.Mesh(unitBox, this.mat(color));
    if (o.climb) {
      const t = this.texs[o.tex ?? 'sisal'].clone();
      t.needsUpdate = true;
      t.repeat.set(Math.max(x1 - x0, z1 - z0) / 2, (y1 - y0) / 2);
      m.material = new THREE.MeshLambertMaterial({ map: t });
    }
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.scale.set(x1 - x0, y1 - y0, z1 - z0);
    this.root.add(m);
    if (o.solid !== false) this.colliders.push({ x0, x1, y0, y1, z0, z1, climb: !!o.climb });
    return m;
  }

  /** Decoración sin colisión. */
  deco(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: number) {
    return this.box(x0, x1, y0, y1, z0, z1, color, { solid: false });
  }

  /** Muro a lo largo de Z (centrado en x = xc) con puertas [z0, z1] y dintel sobre ellas. */
  wallZ(xc: number, t: number, zA: number, zB: number, y0: number, y1: number, color: number, doors: Door[] = [], lintel = 6) {
    this.wall(zA, zB, doors, (a, b) => this.box(xc - t / 2, xc + t / 2, y0, y1, a, b, color), (a, b) => this.box(xc - t / 2, xc + t / 2, y0 + lintel, y1, a, b, color));
  }

  /** Muro a lo largo de X (centrado en z = zc). */
  wallX(zc: number, t: number, xA: number, xB: number, y0: number, y1: number, color: number, doors: Door[] = [], lintel = 6) {
    this.wall(xA, xB, doors, (a, b) => this.box(a, b, y0, y1, zc - t / 2, zc + t / 2, color), (a, b) => this.box(a, b, y0 + lintel, y1, zc - t / 2, zc + t / 2, color));
  }

  private wall(a: number, b: number, doors: Door[], seg: (a: number, b: number) => void, lintelBox: (a: number, b: number) => void) {
    let cur = a;
    for (const [d0, d1] of [...doors].sort((p, q) => p[0] - q[0])) {
      if (d0 > cur) seg(cur, d0);
      lintelBox(d0, d1);
      cur = d1;
    }
    if (cur < b) seg(cur, b);
  }

  /** Escalera de bloques: `n` peldaños de altura `rise`. `dir` = hacia dónde sube (+z, -z, +x, -x). */
  stairs(x0: number, x1: number, z0: number, z1: number, dir: '+z' | '-z' | '+x' | '-x', n: number, rise: number, color: number, y0 = 0) {
    const alongZ = dir === '+z' || dir === '-z', len = (alongZ ? z1 - z0 : x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const top = y0 + rise * (i + 1);
      const a = dir === '+z' || dir === '+x' ? i : n - 1 - i;  // posición del peldaño dentro del tramo
      if (alongZ) this.box(x0, x1, y0, top, z0 + a * len, z0 + (a + 1) * len, color);
      else this.box(x0 + a * len, x0 + (a + 1) * len, y0, top, z0, z1, color);
    }
  }

  /** Suelo con material: tablones, baldosas, alfombra u hormigón. `y` es la altura del plano. */
  floor(x0: number, x1: number, z0: number, z1: number, base: string, o: FloorOpts = {}) {
    const y = o.y ?? 0.02;
    const W = Math.round((x1 - x0) * 10), H = Math.round((z1 - z0) * 10);
    const k = document.createElement('canvas');
    k.width = Math.max(8, Math.min(1024, W)); k.height = Math.max(8, Math.min(1024, H));
    const g = k.getContext('2d')!;
    const sx = k.width / (x1 - x0), sz = k.height / (z1 - z0);
    g.fillStyle = base; g.fillRect(0, 0, k.width, k.height);
    const shade = (a: number) => `rgba(0,0,0,${a})`;
    switch (o.pattern) {
      case 'planks':
        for (let x = 0, i = 0; x < x1 - x0; x += 1.4, i++) {
          g.fillStyle = i % 2 ? shade(0.07) : 'rgba(255,255,255,.04)';
          g.fillRect(x * sx, 0, 1.4 * sx, k.height);
          g.fillStyle = shade(0.22); g.fillRect(x * sx, 0, 1, k.height);
        }
        break;
      case 'tiles':
        for (let x = 0, i = 0; x < x1 - x0; x += 2, i++) for (let z = 0, j = 0; z < z1 - z0; z += 2, j++) {
          if ((i + j) % 2) { g.fillStyle = o.tint2 ?? shade(0.12); g.fillRect(x * sx, z * sz, 2 * sx, 2 * sz); }
        }
        break;
      case 'grass':
        for (let i = 0; i < 1800; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(20,70,20,.22)' : 'rgba(190,240,140,.18)'; g.fillRect(Math.random() * k.width, Math.random() * k.height, 2, 3); }
        break;
      case 'carpet':
        g.fillStyle = 'rgba(255,255,255,.05)';
        for (let i = 0; i < 400; i++) g.fillRect(Math.random() * k.width, Math.random() * k.height, 2, 2);
        break;
      default:
        g.strokeStyle = shade(0.16); g.lineWidth = 1;
        for (let x = 0; x <= x1 - x0; x += 4) { g.beginPath(); g.moveTo(x * sx, 0); g.lineTo(x * sx, k.height); g.stroke(); }
        for (let z = 0; z <= z1 - z0; z += 4) { g.beginPath(); g.moveTo(0, z * sz); g.lineTo(k.width, z * sz); g.stroke(); }
    }
    if (o.label) {
      g.fillStyle = 'rgba(0,0,0,.13)';
      g.font = `${Math.round(3.4 * sz)}px "Arial Black",sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(o.label, k.width / 2, k.height / 2);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(k) }));
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    this.root.add(m);
  }

  inSolid(x: number, y: number, z: number): boolean {
    return this.colliders.some((c) => x > c.x0 - 0.3 && x < c.x1 + 0.3 && z > c.z0 - 0.3 && z < c.z1 + 0.3 && y > c.y0 - 0.2 && y < c.y1 + 0.2);
  }

  /** Altura de la superficie más alta bajo (x, z) que no pase de `yHint + 1.2`. */
  topAt(x: number, z: number, yHint: number): number {
    let g = 0;
    for (const c of this.colliders) if (x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1 && c.y1 <= yHint + 1.2 && c.y1 > g) g = c.y1;
    return g;
  }

  zone = (z: Zone): Zone => z;
}

/** Paleta de la casa, compartida por todas las habitaciones. */
export const C = {
  WALL: 0xeadfca, WALL_IN: 0xf1e8d6, WALL_OUT: 0xd9c9a8, TRIM: 0xb59a74, SLAB: 0xdcd0bb,
  WOOD: 0x9a6a44, WOOD2: 0x7c5236, WOOD3: 0xb88555,
  FAB: 0x6c7fb0, FAB2: 0x8c5fa0, FAB3: 0xc0675b, WHITE: 0xf0ece4, DARK: 0x3d3a48, BOX: 0xc49a6c,
  RED: 0xd9534f, BLUE: 0x4f9bd9, GREEN: 0x5fa86a, GLASS: 0x9fd3f5, STEEL: 0xaab4bd, TILE: 0xcfe3e0, BLACK: 0x24212c,
} as const;

/** Alturas del piso: planta baja, techo (losa) y planta alta. */
export const LV = { ceil: 7, slabTop: 8, roof: 15 } as const;
