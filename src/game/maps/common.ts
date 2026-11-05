import type { Vec2, Vec3 } from '../types';
import type { MapBuilder } from './MapBuilder';

/** Reguero de croquetas siguiendo un recorrido, pegado a la superficie (escaleras incluidas). */
export function routeKibbles(b: MapBuilder, wps: Vec2[], wpY: number[], loop: boolean, spacing = 3): Vec3[] {
  const out: Vec3[] = [];
  const n = loop ? wps.length : wps.length - 1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % wps.length, a = wps[i], c = wps[j];
    const d = Math.hypot(c[0] - a[0], c[1] - a[1]), steps = Math.max(1, Math.floor(d / spacing));
    for (let q = 0; q < steps; q++) {
      const u = q / steps, x = a[0] + (c[0] - a[0]) * u, z = a[1] + (c[1] - a[1]) * u, yh = wpY[i] + (wpY[j] - wpY[i]) * u;
      const y = b.topAt(x, z, yh) + 0.6;
      if (!b.inSolid(x, y, z)) out.push([x, y, z]);
    }
  }
  return out;
}

/** Fila de croquetas entre dos puntos a una altura de referencia (se pegan a la superficie). */
export function lineKibbles(b: MapBuilder, x0: number, z0: number, x1: number, z1: number, n: number, yHint: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / Math.max(1, n - 1), x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u, y = b.topAt(x, z, yHint) + 0.6;
    if (!b.inSolid(x, y, z)) out.push([x, y, z]);
  }
  return out;
}

/** Puntos de aparición válidos: se comprueba un poco por encima del suelo (si no, el propio suelo los descarta). */
export function validSpawns(b: MapBuilder, pts: Vec3[]): Vec3[] {
  return pts.filter(([x, y, z]) => !b.inSolid(x, y + 0.5, z));
}

/** Baranda alrededor de un hueco, dejando libre un lado (por donde se sale de la escalera). */
export function holeRails(b: MapBuilder, y: number, x0: number, x1: number, z0: number, z1: number, open: '+z' | '-z' | '+x' | '-x', color: number, h = 1.4, t = 0.3) {
  if (open !== '-z') b.box(x0, x1, y, y + h, z0 - t, z0, color);
  if (open !== '+z') b.box(x0, x1, y, y + h, z1, z1 + t, color);
  if (open !== '-x') b.box(x0 - t, x0, y, y + h, z0, z1, color);
  if (open !== '+x') b.box(x1, x1 + t, y, y + h, z0, z1, color);
}
