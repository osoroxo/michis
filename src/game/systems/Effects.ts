import * as THREE from 'three';

interface Ring { m: THREE.Mesh; t: number; dur: number; r: number }

/** Efectos efímeros (ondas de impacto). */
export class Effects {
  private rings: Ring[] = [];
  private geo = new THREE.RingGeometry(0.85, 1, 20);
  constructor(private scene: THREE.Scene) {}

  ring(x: number, y: number, z: number, radius: number, color: number, dur = 0.35) {
    const m = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 0.1, z);
    this.scene.add(m);
    this.rings.push({ m, t: 0, dur, r: radius });
  }

  update(dt: number) {
    this.rings = this.rings.filter((r) => {
      r.t += dt;
      const u = r.t / r.dur;
      if (u >= 1) { this.scene.remove(r.m); (r.m.material as THREE.Material).dispose(); return false; }
      r.m.scale.setScalar(0.3 + r.r * u);
      (r.m.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - u);
      return true;
    });
  }

  clear() { this.rings.forEach((r) => { this.scene.remove(r.m); (r.m.material as THREE.Material).dispose(); }); this.rings = []; }
}
