import * as THREE from 'three';
import { addBox, type PartCtx } from './context';

/** Orejas: la forma depende de la raza. Se añaden a la cabeza. */
export function buildEars(ctx: PartCtx, head: THREE.Group) {
  const mat = ctx.look.pattern === 'points' ? ctx.mats.patch : ctx.mats.body;
  const cone = (r: number, h: number, x: number, y: number, rz = 0) => {
    const e = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), mat);
    e.position.set(x, y, 0);
    e.rotation.y = Math.PI / 4;
    e.rotation.z = rz;
    head.add(e);
    return e;
  };
  switch (ctx.look.ears) {
    case 'big':
      cone(0.17, 0.48, -0.2, 0.44, 0.1); cone(0.17, 0.48, 0.2, 0.44, -0.1);
      break;
    case 'folded':
      [-0.2, 0.2].forEach((x) => addBox(head, 0.17, 0.09, 0.2, x, 0.3, 0.1, mat).rotation.x = 0.5);
      break;
    case 'tufted':
      cone(0.16, 0.36, -0.19, 0.4); cone(0.16, 0.36, 0.19, 0.4);
      [-0.19, 0.19].forEach((x) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), ctx.mats.patch); t.position.set(x, 0.66, 0); head.add(t); });
      break;
    default:
      cone(0.15, 0.3, -0.19, 0.38); cone(0.15, 0.3, 0.19, 0.38);
  }
}
