import * as THREE from 'three';
import type { ThrowDef } from '../config/throwables';

const mat = (c: number, e = 0) => new THREE.MeshLambertMaterial({ color: c, emissive: e });

/** Malla de cada objeto arrojadizo (en el suelo y en vuelo). Rediseña aquí cada objeto. */
export function makeThrowableMesh(d: ThrowDef): THREE.Object3D {
  const g = new THREE.Group();
  const r = d.radius;
  switch (d.id) {
    case 'yarn': {
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat(d.color, 0x3a0f1c)));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.95, r * 0.07, 6, 14), mat(0xffd1dc));
      g.add(ring);
      const ring2 = ring.clone(); ring2.rotation.y = Math.PI / 2; g.add(ring2);
      break;
    }
    case 'vase': {
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.5, r * 1.5, 8), mat(d.color, 0x10243a)));
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.5, r * 0.6, 8), mat(0xe8f1fa));
      neck.position.y = r * 1.0; g.add(neck);
      break;
    }
    case 'book': {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(r * 1.6, r * 0.5, r * 2.1), mat(d.color)));
      const pages = new THREE.Mesh(new THREE.BoxGeometry(r * 1.45, r * 0.4, r * 2.05), mat(0xf3ead4));
      pages.position.x = r * 0.05; g.add(pages);
      break;
    }
    case 'tuna': {
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.9, 10), mat(d.color, 0x1c2428)));
      const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.8, r * 0.95, 10), mat(0x4fd1e0, 0x124f58));
      g.add(top);
      break;
    }
    case 'pillow': {
      g.add(new THREE.Mesh(new THREE.BoxGeometry(r * 2, r * 0.8, r * 1.5), mat(d.color)));
      const tie = new THREE.Mesh(new THREE.BoxGeometry(r * 2.05, r * 0.82, r * 0.18), mat(0xe05a7a));
      g.add(tie);
      break;
    }
    default:
      g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(d.color)));
  }
  return g;
}
