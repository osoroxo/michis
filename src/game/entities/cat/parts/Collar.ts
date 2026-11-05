import * as THREE from 'three';
import { addBox, type PartCtx } from './context';

/** Collar con el color de jugador: así se distingue cada gato en carrera. */
export function buildCollar(ctx: PartCtx): THREE.Mesh {
  const { look, mats } = ctx;
  const m = addBox(new THREE.Group(), 0.66 * look.bodyW + 0.02, 0.14, 0.14, 0, 0.16, 0.44 * look.bodyLen, mats.accent);
  return m;
}
