import * as THREE from 'three';
import type { HudFrame, HudState, MatchConfig, MatchResult } from './types';
import { neutralCtl } from './types';
import { T, MAX_CATS } from './config/tuning';
import { THROWABLES } from './config/throwables';
import { Cat } from './entities/Cat';
import { Robots } from './entities/Robots';
import { buildMap } from './maps';
import type { GameMap } from './maps/types';
import { Audio } from './systems/Audio';
import { Combat, clawColor } from './systems/Combat';
import { CatController } from './systems/CatController';
import { CameraRig } from './systems/CameraRig';
import { Effects } from './systems/Effects';
import { Input } from './systems/Input';
import { Motion } from './systems/Motion';
import { Pickups } from './systems/Pickups';
import { Projectiles } from './systems/Projectiles';
import type { Ctx } from './systems/ctx';
import type { ModeLogic } from './modes/Mode';
import { RaceMode } from './modes/RaceMode';
import { BattleMode } from './modes/BattleMode';
import { makeRivals } from './roster';

export interface EngineCallbacks {
  onHud(f: HudFrame): void;
  onPause(paused: boolean): void;
  onEnd(r: MatchResult): void;
}

const STEP = 1 / 60;

interface View { cat: Cat | null; rig: CameraRig; x: number; y: number; w: number; h: number }

/** Orquesta una partida: escena, gatos, sistemas, modo, entrada, cámaras (pantalla dividida) y HUD. */
export class GameEngine implements Ctx {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly map: GameMap;
  readonly cats: Cat[] = [];
  readonly humans: Cat[] = [];
  readonly audio = new Audio();
  readonly effects: Effects;
  readonly motion: Motion;
  readonly combat: Combat;
  readonly projectiles: Projectiles;
  readonly pickups: Pickups;
  readonly mode: ModeLogic;
  live = false;

  private controller: CatController;
  private robots: Robots;
  private views: View[] = [];
  private input = new Input();
  private arrow: THREE.Mesh;
  private phase: 'count' | 'play' | 'ended' = 'count';
  private countT = 3.5;
  private goT = 0;
  private lastCount = '';
  private paused = false;
  private acc = 0;
  private hudT = 0;
  private lastT = performance.now();
  private raf = 0;
  private time = 0;
  private ro: ResizeObserver;
  private disposed = false;
  private attract: boolean;
  private W = 1;
  private H = 1;

  constructor(private container: HTMLElement, readonly config: MatchConfig, private cb: EngineCallbacks) {
    this.attract = !!config.attract;
    // three ≥ r155 usa gestión de color y luces físicas; el juego original no: se desactiva para conservar su aspecto.
    THREE.ColorManagement.enabled = false;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setScissorTest(true);
    this.renderer.autoClear = false;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

    this.scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a5a78, 0.8 * Math.PI));
    const sun = new THREE.DirectionalLight(0xffffff, 0.3 * Math.PI);
    sun.position.set(30, 60, 20);
    this.scene.add(sun);

    this.map = buildMap(config.mapId);
    this.scene.add(this.map.root);
    this.motion = new Motion(this.map.colliders, this.map.bounds, () => this.audio.sfx(330, 0.05, 'triangle', 0.05));
    this.effects = new Effects(this.scene);
    this.combat = new Combat(this);
    this.projectiles = new Projectiles(this, this.scene);
    this.controller = new CatController(this);

    // gatos: primero los humanos, luego los rivales CPU
    const humanSpecs = this.attract ? [] : config.players.slice(0, 4);
    const nRiv = this.attract ? config.rivals : Math.max(humanSpecs.length === 1 ? 1 : 0, Math.min(config.rivals, MAX_CATS - humanSpecs.length));
    const specs = [...humanSpecs.map((p) => p.cat), ...makeRivals(nRiv, humanSpecs[0]?.cat)];
    specs.forEach((sp, i) => {
      const c = new Cat(i, sp);
      if (i < humanSpecs.length) {
        c.human = true; c.dev = humanSpecs[i].dev;
        c.model.setLabel(humanSpecs.length > 1 ? `P${i + 1}` : 'TÚ', sp.accent);
        this.humans.push(c);
      }
      this.scene.add(c.model.root, c.model.shadow);
      this.cats.push(c);
    });
    this.input.mergeK2 = !humanSpecs.some((p) => p.dev === 'k2');

    this.mode = config.mode === 'battle' ? new BattleMode(this) : new RaceMode(this);
    this.pickups = new Pickups(this, this.scene);
    this.robots = new Robots(this, this.scene);
    this.views = this.humans.length
      ? this.humans.map((cat) => ({ cat, rig: new CameraRig(this.motion), x: 0, y: 0, w: 1, h: 1 }))
      : [{ cat: null, rig: new CameraRig(this.motion), x: 0, y: 0, w: 1, h: 1 }];
    if (this.humans.length === 3) this.views.push({ cat: null, rig: new CameraRig(this.motion), x: 0, y: 0, w: 1, h: 1 });

    this.arrow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1, 4), new THREE.MeshBasicMaterial({ color: 0xfff0a0 }));
    this.arrow.visible = false;
    this.scene.add(this.arrow);

    this.mode.setup();
    if (this.attract) { this.phase = 'play'; this.live = true; this.audio.muted = true; }

    this.input.onGesture = () => this.audio.unlock();
    this.input.onPause = () => this.togglePause();
    if (!this.attract) this.input.attach();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
    this.emitHud();
  }

  /* ---------- Ctx ---------- */
  fighters(): Cat[] { return this.cats.filter((c) => c.active && !c.down); }

  /* ---------- Control externo ---------- */
  togglePause() { this.setPaused(!this.paused); }
  setPaused(p: boolean) {
    if (this.attract || this.phase === 'ended' || p === this.paused) return;
    this.paused = p;
    this.cb.onPause(p);
  }
  get isPaused() { return this.paused; }

  /** Datos para el minimapa. */
  minimap() {
    return {
      view: this.map.view, colliders: this.map.colliders,
      cats: this.cats.filter((c) => c.active && !c.down).map((c) => ({ x: c.x, y: c.y, z: c.z, color: c.css, me: c.human })),
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.input.detach();
    this.ro.disconnect();
    this.audio.dispose();
    this.effects.clear();
    this.projectiles.clear();
    this.cats.forEach((c) => c.model.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  /* ---------- Vistas ---------- */
  private resize() {
    const W = Math.max(1, this.container.clientWidth), H = Math.max(1, this.container.clientHeight);
    this.W = W; this.H = H;
    this.renderer.setSize(W, H, false);
    const n = this.views.length;
    this.views.forEach((v, i) => {
      if (n === 1) { v.x = 0; v.y = 0; v.w = W; v.h = H; }
      else if (n === 2) { v.w = W / 2; v.h = H; v.x = i * W / 2; v.y = 0; }
      else { v.w = W / 2; v.h = H / 2; v.x = (i % 2) * W / 2; v.y = i < 2 ? 0 : H / 2; }
      v.rig.resize(v.w, v.h);
    });
    this.emitHud();
  }

  /* ---------- Bucle ---------- */
  private frame = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (now - this.lastT) / 1000);
    this.lastT = now;
    this.input.pollPad();
    if (this.paused) { this.render(0); return; }
    this.time += dt;

    if (this.phase === 'count') {
      this.countT -= dt;
      const n = Math.ceil(this.countT - 0.5);
      const t = n > 0 ? String(n) : '¡Ya!';
      if (t !== this.lastCount) { this.lastCount = t; this.audio.sfx(n > 0 ? 440 : 880, 0.15, 'square', 0.07); }
      if (this.countT <= 0.5) { this.phase = 'play'; this.live = true; this.goT = 0.8; }
    }
    if (this.goT > 0) this.goT -= dt;
    if (this.phase === 'play') {
      this.acc += dt;
      while (this.acc >= STEP && this.phase === 'play') { this.simStep(STEP); this.acc -= STEP; }
    }
    this.effects.update(dt);
    for (const c of this.cats) if (c.active) this.animCat(c);
    this.hudT += dt;
    if (this.hudT > 0.1) { this.hudT = 0; this.emitHud(); }
    this.render(dt);
    this.input.endFrame();
  };

  /** Avanza la simulación `seconds` sin dibujar (pruebas automáticas). */
  debugAdvance(seconds: number) {
    this.phase = 'play'; this.live = true;
    const n = Math.round(seconds / STEP);
    for (let i = 0; i < n && !this.mode.finished; i++) { this.time += STEP; this.simStep(STEP); }
  }

  private simStep(dt: number) {
    this.robots.update(dt);
    for (const c of this.cats) {
      if (!c.active) continue;
      if (c.msgT > 0) c.msgT -= dt;
      if (c.down) continue;
      if (c.human) this.humanThink(c); else this.mode.think(c, dt);
      this.controller.step(c, dt);
    }
    this.pushCats();
    this.pickups.update(dt, this.time);
    this.projectiles.update(dt);
    this.mode.update(dt);
    if (this.mode.finished && !this.attract && this.phase === 'play') this.finish();
  }

  private finish() {
    this.phase = 'ended';
    this.live = false;
    this.audio.sfx(520, 0.25, 'square', 0.07);
    setTimeout(() => this.audio.sfx(780, 0.35, 'square', 0.07), 200);
    this.cb.onEnd(this.mode.result(this.humans));
    this.emitHud();
  }

  private humanThink(c: Cat) {
    const r = this.input.read(c.dev), C = neutralCtl();
    const fx = Math.sin(c.camYaw), fz = Math.cos(c.camYaw);
    C.mx = fx * r.iz - fz * r.ix; C.mz = fz * r.iz + fx * r.ix;
    const m = Math.hypot(C.mx, C.mz);
    if (m > 1) { C.mx /= m; C.mz /= m; }
    C.run = r.run;
    const p = c.prev;
    C.jump = r.jump && !p.jump; C.claw = r.claw && !p.claw; C.throw = r.throw && !p.throw; C.dodge = r.dodge && !p.dodge;
    C.sharpen = r.sharpen;
    if (r.back && !p.back && !c.finished) this.mode.rescue(c);
    c.prev = { jump: r.jump, claw: r.claw, throw: r.throw, dodge: r.dodge, back: r.back };
    c.look = r.rx;
    c.ctl = C;
  }

  /** Los gatos no se atraviesan entre sí. */
  private pushCats() {
    const A = this.fighters();
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
      const a = A[i], b = A[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > 0 && d < 0.95 && Math.abs(a.y - b.y) < 0.8 && !a.climb && !b.climb) {
        const p = (0.95 - d) / 2, nx = dx / d, nz = dz / d;
        const ax = a.x, az = a.z, bx = b.x, bz = b.z;
        a.x -= nx * p; a.z -= nz * p;
        if (this.motion.colliders.some((k) => this.motion.overlap(a, k))) { a.x = ax; a.z = az; }
        b.x += nx * p; b.z += nz * p;
        if (this.motion.colliders.some((k) => this.motion.overlap(b, k))) { b.x = bx; b.z = bz; }
      }
    }
  }

  private animCat(c: Cat) {
    const m = c.model, sp = Math.hypot(c.vx, c.vz);
    m.root.position.set(c.x, c.y, c.z);
    m.root.rotation.y = c.yaw;
    c.walk += (c.climb ? (Math.hypot(c.ctl.mx, c.ctl.mz) > 0.2 ? 9 : 0) : sp * 1.9) * (1 / 60);
    m.animate({
      walk: c.walk, speed: sp, grounded: c.onGround, climbing: !!c.climb, climbMoving: false,
      stunned: c.stun > 0, claw: c.clawAnim > 0 ? c.clawAnim / T.clawAnim : 0, dodge: c.dodgeT > 0 ? 1 - c.dodgeT / T.dodge.time : 0,
      sharpening: c.sharpening, ultra: c.ultra > 0, slowed: c.slowT > 0 || c.bleedT > 0, time: this.time, seed: c.i,
    }, clawColor(c.clawLevel));
    const blink = c.inv > 0 && c.stun <= 0 && Math.floor(this.time * 14) % 2 === 0;
    m.root.visible = c.active && !c.down && !blink;
    m.shadow.visible = c.active && !c.down;
    m.shadow.position.set(c.x, this.motion.groundAt(c.x, c.z, c.y + 0.1) + 0.09, c.z);
  }

  private render(dt: number) {
    const r = this.renderer;
    r.setViewport(0, 0, this.W, this.H); r.setScissor(0, 0, this.W, this.H);
    r.setClearColor(this.map.sky); r.clear();
    const step = dt || 1 / 60;
    for (const v of this.views) {
      r.setViewport(v.x, this.H - v.y - v.h, v.w, v.h);
      r.setScissor(v.x, this.H - v.y - v.h, v.w, v.h);
      r.clearDepth();
      if (v.cat) {
        v.rig.follow(v.cat, step);
        this.updateArrow(v.cat);
      } else {
        v.rig.orbit(this.time, this.map.overhead.pos, this.map.overhead.look);
        this.arrow.visible = false;
      }
      if (v.cat) v.cat.model.setLabelVisible(false);
      r.render(this.scene, v.rig.cam);
      if (v.cat) v.cat.model.setLabelVisible(true);
    }
  }

  /** Flecha sobre el gato: siguiente waypoint (carrera) o rival más cercano (batalla). */
  private updateArrow(p: Cat) {
    let tx: number | null = null, tz: number | null = null;
    if (this.config.mode === 'race' && !p.finished) {
      const w = this.map.track.waypoints[Math.min(p.wp, this.map.track.waypoints.length - 1)];
      tx = w[0]; tz = w[1];
      (this.arrow.material as THREE.MeshBasicMaterial).color.setHex(0xfff0a0);
    } else if (this.config.mode === 'battle' && !p.down) {
      let bd = 1e9;
      for (const o of this.fighters()) { if (o === p) continue; const d = Math.hypot(o.x - p.x, o.z - p.z); if (d < bd) { bd = d; tx = o.x; tz = o.z; } }
      (this.arrow.material as THREE.MeshBasicMaterial).color.setHex(0xff6b6b);
    }
    this.arrow.visible = tx !== null && this.phase !== 'ended';
    if (tx === null || tz === null) return;
    this.arrow.position.set(p.x, p.y + 2.9 * p.breed.look.scale, p.z);
    this.arrow.rotation.order = 'YXZ';
    this.arrow.rotation.set(Math.PI / 2, Math.atan2(tx - p.x, tz - p.z), 0);
  }

  /* ---------- HUD ---------- */
  private emitHud() {
    if (this.attract || !this.humans.length) return;
    const countdown = this.phase === 'count' ? this.lastCount || '3' : this.goT > 0 ? '¡Ya!' : '';
    this.cb.onHud({
      minimap: this.humans.length === 1 ? 'top' : 'center',
      views: this.views.filter((v) => v.cat).map((v) => ({
        hud: this.buildHud(v.cat!, countdown),
        rect: { x: v.x, y: v.y, w: v.w, h: v.h },
        color: v.cat!.css, name: v.cat!.name,
      })),
    });
  }

  private buildHud(p: Cat, countdown: string): HudState {
    const h: HudState = {
      mode: this.config.mode,
      phase: this.phase,
      countdown,
      hp: Math.ceil(p.hp), hpMax: p.hpMax,
      score: 0, position: 1, total: this.cats.length, lap: 1, laps: this.config.laps,
      tier: p.tier, ultra: p.ultra / T.ultraTime,
      balls: p.ballN, ballMax: T.ballMax,
      held: p.held ? THROWABLES[p.held].name : null,
      clawLevel: p.clawLevel, clawMax: T.sharpenMax, sharpen: p.sharpening ? p.sharpenT / T.sharpenTime : 0,
      slow: p.slowT > 0, bleeding: p.bleedT > 0,
      jumpsLeft: p.onGround || p.climb ? 2 : Math.max(0, 2 - Math.max(1, p.jumpsUsed)),
      dodge: p.dodgeReady,
      msg: p.msgT > 0 ? p.msg : '',
      rows: [], killTarget: this.config.killTarget, down: 0,
    };
    this.mode.fillHud(p, h);
    return h;
  }
}
