import * as THREE from 'three';
import type { CatSpec } from '../../types';
import { makeCtx, type CatMats } from './parts/context';
import { buildTorso } from './parts/Torso';
import { buildHead } from './parts/Head';
import { buildLegs } from './parts/Legs';
import { buildTail } from './parts/Tail';
import { buildCollar } from './parts/Collar';
import { buildSlash, buildShadow, labelSprite } from './parts/Fx';

export interface PoseInput {
  walk: number;       // fase del ciclo de marcha
  speed: number;      // velocidad horizontal
  grounded: boolean;
  climbing: boolean;
  climbMoving: boolean;
  stunned: boolean;
  claw: number;       // 1 → 0 durante el zarpazo (0 = no)
  dodge: number;      // 0..1 progreso de la esquiva (0 = no)
  sharpening: boolean;
  ultra: boolean;
  slowed: boolean;
  time: number;
  seed: number;
}

/** El gato montado: `root` va en la escena; `animate` lo posa cada frame. */
export class CatModel {
  readonly root = new THREE.Group();
  readonly inner = new THREE.Group();
  readonly shadow = buildShadow();
  readonly slash = buildSlash();
  private readonly legs: THREE.Group[];
  private readonly tail: THREE.Group;
  private readonly head: THREE.Group;
  private readonly mats: CatMats;
  private label: THREE.Sprite | null = null;
  /** Distancia de las patas traseras al centro (pivote al erguirse). */
  private hindZ = 0.44;

  constructor(spec: CatSpec) {
    const ctx = makeCtx(spec);
    this.mats = ctx.mats;
    const lift = (ctx.look.legLen - 1) * 0.46;
    // Todo lo que va sobre las patas se levanta si la raza tiene patas largas.
    const upper = new THREE.Group();
    upper.position.y = 0.68 + lift;
    const torso = buildTorso(ctx);
    this.head = buildHead(ctx);
    this.tail = buildTail(ctx);
    const collar = buildCollar(ctx);
    upper.add(torso, this.head, this.tail, collar);
    this.legs = buildLegs(ctx);
    this.inner.add(upper, ...this.legs, this.slash);
    this.inner.scale.setScalar(ctx.look.scale);
    this.hindZ = 0.44 * ctx.look.bodyLen * ctx.look.scale;
    this.root.add(this.inner);
    this.slash.position.set(0, 0.8 + lift, 0.6 * ctx.look.bodyLen + 0.3);
  }

  setLabel(txt: string, color: string) {
    if (this.label) this.root.remove(this.label);
    this.label = labelSprite(txt, color);
    this.root.add(this.label);
  }

  /** Oculta la etiqueta para el render de la cámara propia. */
  setLabelVisible(v: boolean) { if (this.label) this.label.visible = v; }

  animate(p: PoseInput, clawColor: number) {
    const { inner, legs, tail } = this;
    inner.rotation.set(0, 0, 0);
    inner.position.set(0, 0, 0);
    const amp = p.grounded || p.climbing ? Math.min(0.95, p.speed * 0.13 + (p.climbing ? 0.6 : 0)) : 0.5;
    const s = Math.sin(p.walk);
    legs[0].rotation.x = s * amp; legs[3].rotation.x = s * amp;
    legs[1].rotation.x = -s * amp; legs[2].rotation.x = -s * amp;
    tail.rotation.x = 0.75 + Math.sin(p.time * 5 + p.seed) * 0.15 + (p.slowed ? 0.5 : 0);
    tail.rotation.y = Math.sin(p.time * 3 + p.seed) * 0.3;
    this.head.rotation.x = p.slowed ? 0.35 : 0;
    if (p.climbing) { inner.rotation.x = -1.25; inner.position.set(0, 0.6, -0.05); }
    if (p.stunned) { inner.rotation.z = Math.sin(p.time * 26) * 0.5; inner.rotation.y = p.time * 12; }
    if (p.sharpening) {
      // Se estira contra la pared y rasca con las patas delanteras.
      inner.rotation.x = -0.5;
      legs[0].rotation.x = -1.6 + Math.sin(p.time * 22) * 0.6;
      legs[1].rotation.x = -1.6 - Math.sin(p.time * 22) * 0.6;
    }
    if (p.dodge > 0) {
      // Bote con voltereta, encogido: gira sobre su centro.
      const a = p.dodge * Math.PI * 2, c = 0.7 * this.inner.scale.x;
      inner.rotation.x = a;
      inner.position.set(0, c - c * Math.cos(a), -c * Math.sin(a));
      legs.forEach((l) => { l.rotation.x = -0.9; });
    }
    if (p.claw > 0 && p.dodge <= 0) {
      // Se yergue sobre las patas traseras y zarpea con las dos delanteras, alternando.
      const u = 1 - p.claw, rear = Math.sin(Math.PI * Math.min(1, u * 1.15)), a = -1.05 * rear, hz = this.hindZ;
      inner.rotation.x = a;
      inner.position.set(0, -hz * Math.sin(a), hz * (1 - Math.cos(a)));
      const swing = Math.sin(u * Math.PI * 4);
      legs[0].rotation.x = -2.3 + swing * 0.7 * rear; legs[1].rotation.x = -2.3 - swing * 0.7 * rear;
      legs[2].rotation.x = 0.15 * rear; legs[3].rotation.x = 0.15 * rear;
      this.head.rotation.x = 0.3 * rear;
    }
    const flash = p.ultra ? (Math.floor(p.time * 12) % 2 ? 0x1a5f6a : 0x0a2f38) : 0;
    for (const m of this.mats.flash) m.emissive.setHex(flash);
    this.slash.visible = p.claw > 0;
    if (p.claw > 0) {
      const m = this.slash.material as THREE.MeshBasicMaterial;
      m.opacity = Math.min(1, p.claw * 1.2) * 0.85; m.color.setHex(clawColor);
    }
  }

  /** Libera materiales propios (las geometrías son compartidas). */
  dispose() {
    this.mats.body.dispose(); this.mats.patch.dispose(); this.mats.eye.dispose(); this.mats.accent.dispose();
  }
}
