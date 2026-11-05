import * as THREE from 'three';
import { addBox, type PartCtx } from './context';

export function buildTail(ctx: PartCtx): THREE.Group {
  const { look, mats } = ctx;
  const g = new THREE.Group();
  const [len, th] = look.tail === 'long' ? [1.35, 0.13] : look.tail === 'fluffy' ? [1.05, 0.3] : look.tail === 'short' ? [0.4, 0.17] : [0.95, 0.15];
  const mat = look.pattern === 'tabby' || look.pattern === 'spots' ? mats.body : look.pattern === 'points' ? mats.patch : mats.patch;
  addBox(g, th, th, len, 0, 0, -len / 2, mat);
  if (look.pattern === 'tabby') [0.3, 0.6, 0.9].forEach((t) => addBox(g, th + 0.02, th + 0.02, 0.08, 0, 0, -len * t, mats.patch));
  g.position.set(0, 0.16, -0.61 * look.bodyLen);
  return g;
}
