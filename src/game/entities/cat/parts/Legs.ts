import * as THREE from 'three';
import { addBox, type PartCtx } from './context';

/** Cuatro patas con pivote en la cadera: [delantera-izq, delantera-der, trasera-izq, trasera-der]. */
export function buildLegs(ctx: PartCtx): THREE.Group[] {
  const { look, mats, limb } = ctx;
  const h = 0.46 * look.legLen;
  const lz = 0.44 * look.bodyLen, lx = 0.26 * look.bodyW;
  return ([[-lx, lz], [lx, lz], [-lx, -lz], [lx, -lz]] as const).map(([x, z]) => {
    const leg = new THREE.Group();
    leg.position.set(x, h, z);
    addBox(leg, 0.2, h, 0.22, 0, -h / 2, 0, limb);
    if (look.pattern === 'tuxedo') addBox(leg, 0.21, 0.13, 0.23, 0, -h + 0.065, 0, mats.patch); // patitas blancas
    return leg;
  });
}
