import * as THREE from 'three';
import { addBox, type PartCtx } from './context';
import { buildEars } from './Ears';

export function buildHead(ctx: PartCtx): THREE.Group {
  const { look, mats } = ctx;
  const head = new THREE.Group();
  head.position.set(0, 0.32, 0.13 + 0.61 * look.bodyLen);
  head.scale.setScalar(look.headW);
  addBox(head, 0.62, 0.54, 0.54, 0, 0, 0, mats.body);
  if (look.pattern === 'points') addBox(head, 0.4, 0.3, 0.1, 0, -0.04, 0.27, mats.patch);   // máscara
  if (look.pattern === 'tabby') [-0.1, 0, 0.1].forEach((x) => addBox(head, 0.04, 0.12, 0.04, x, 0.26, 0.2, mats.patch));
  addBox(head, 0.3, 0.18, 0.14, 0, -0.1, 0.32, look.pattern === 'points' ? mats.body : mats.patch); // hocico
  addBox(head, 0.1, 0.1, 0.04, -0.15, 0.06, 0.28, mats.eye);
  addBox(head, 0.1, 0.1, 0.04, 0.15, 0.06, 0.28, mats.eye);
  buildEars(ctx, head);
  return head;
}
