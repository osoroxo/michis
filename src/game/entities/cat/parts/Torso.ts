import * as THREE from 'three';
import { addBox, type PartCtx } from './context';

/** Cuerpo + marcas del patrón (rayas, manchas, esmoquin…). */
export function buildTorso(ctx: PartCtx): THREE.Group {
  const { look, mats } = ctx;
  const g = new THREE.Group();
  const w = 0.76 * look.bodyW, len = 1.22 * look.bodyLen;
  addBox(g, w, 0.56, len, 0, 0, 0, mats.body);
  switch (look.pattern) {
    case 'tabby':
      for (let i = 0; i < 4; i++) addBox(g, w + 0.02, 0.58, 0.09, 0, 0.0, -len * 0.36 + i * (len * 0.24), mats.patch).scale.y = 0.585;
      break;
    case 'spots':
      ([[-0.3, 0.1, 0.2], [0.3, 0.05, -0.2], [0.1, 0.29, -0.35], [-0.2, 0.29, 0.25], [0.32, -0.1, 0.35], [-0.33, -0.12, -0.3]] as const)
        .forEach(([x, y, z]) => addBox(g, 0.2, 0.2, 0.2, x * look.bodyW, y, z * look.bodyLen, mats.patch));
      break;
    case 'tuxedo':
      addBox(g, w * 0.55, 0.46, 0.08, 0, -0.04, len / 2 + 0.01, mats.patch);
      break;
    case 'points':
      break;
    default:
      addBox(g, w + 0.02, 0.12, 0.5 * look.bodyLen, 0, 0.24, 0.0, mats.patch);
  }
  if (look.pattern === 'tabby') addBox(g, w + 0.02, 0.1, 0.4, 0, 0.24, 0.0, mats.patch).scale.set(w * 0.4, 0.1, len * 0.8);
  return g;
}
