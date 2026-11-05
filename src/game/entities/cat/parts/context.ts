import * as THREE from 'three';
import type { CatSpec } from '../../../types';
import { breedOf, type BreedDef } from '../../../config/breeds';

/** Material compartido por todas las piezas de un gato. */
export interface CatMats {
  body: THREE.MeshLambertMaterial;
  patch: THREE.MeshLambertMaterial;
  eye: THREE.MeshLambertMaterial;
  accent: THREE.MeshLambertMaterial;
  /** Materiales que parpadean con el pescado (ultra). */
  flash: THREE.MeshLambertMaterial[];
}

/** Todo lo que necesita una pieza para construirse. */
export interface PartCtx {
  spec: CatSpec;
  breed: BreedDef;
  look: BreedDef['look'];
  mats: CatMats;
  /** Material de las extremidades: depende del patrón (puntas oscuras en siamés). */
  limb: THREE.MeshLambertMaterial;
}

const unitBox = new THREE.BoxGeometry(1, 1, 1);

export function makeCtx(spec: CatSpec): PartCtx {
  const breed = breedOf(spec.breed);
  const body = new THREE.MeshLambertMaterial({ color: new THREE.Color(spec.body) });
  const patch = new THREE.MeshLambertMaterial({ color: new THREE.Color(spec.patch) });
  const eye = new THREE.MeshLambertMaterial({ color: 0x101010 });
  const accent = new THREE.MeshLambertMaterial({ color: new THREE.Color(spec.accent) });
  const mats: CatMats = { body, patch, eye, accent, flash: [body, patch] };
  const pointed = breed.look.pattern === 'points';
  return { spec, breed, look: breed.look, mats, limb: pointed ? patch : body };
}

/** Añade una caja con medidas y posición al grupo. */
export function addBox(g: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(unitBox, mat);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  g.add(m);
  return m;
}
