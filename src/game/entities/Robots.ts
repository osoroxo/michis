import * as THREE from 'three';
import type { Ctx } from '../systems/ctx';

const unit = new THREE.BoxGeometry(1, 1, 1);

/** Aspiradoras robot: patrullan y empujan a los gatos que pisan. */
export class Robots {
  private list: Array<{ a: [number, number]; b: [number, number]; u: number; s: number; dir: number; x: number; z: number; g: THREE.Group; u0: number }> = [];

  constructor(private g: Ctx, scene: THREE.Scene) {
    const dark = new THREE.MeshLambertMaterial({ color: 0x3d3a48 });
    const red = new THREE.MeshLambertMaterial({ color: 0xff4040, emissive: 0xaa1010 });
    this.list = g.map.robots.map((r) => {
      const grp = new THREE.Group();
      const d = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.45, 8), dark);
      d.position.y = 0.25;
      const l = new THREE.Mesh(unit, red);
      l.scale.set(0.5, 0.14, 0.5); l.position.y = 0.54;
      grp.add(d, l);
      scene.add(grp);
      return { a: r.a, b: r.b, u: r.u, u0: r.u, s: r.s, dir: 1, x: 0, z: 0, g: grp };
    });
  }

  reset() { this.list.forEach((r) => { r.u = r.u0; r.dir = 1; }); }

  update(dt: number) {
    for (const r of this.list) {
      r.u += r.dir * r.s * dt;
      if (r.u > 1) { r.u = 1; r.dir = -1; }
      if (r.u < 0) { r.u = 0; r.dir = 1; }
      r.x = r.a[0] + (r.b[0] - r.a[0]) * r.u; r.z = r.a[1] + (r.b[1] - r.a[1]) * r.u;
      r.g.position.set(r.x, 0, r.z);
      r.g.rotation.y += dt * 2;
      for (const c of this.g.fighters()) {
        if (c.y > 0.7) continue;
        if (Math.hypot(c.x - r.x, c.z - r.z) < 1.55) this.g.combat.hit(c, { from: { x: r.x, z: r.z }, attacker: null, dmg: 10, stun: 0.7, knock: 14, kibbles: 1, msg: '¡Aspiradora!' });
      }
    }
  }
}
