import type { Cat } from '../entities/Cat';
import type { Ctx } from '../systems/ctx';
import { raceBot } from '../systems/ai';
import { RACE_BONUS, T } from '../config/tuning';
import type { HudState, MatchResult } from '../types';
import type { ModeLogic } from './Mode';
import { resetCat, shuffle } from './common';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const inZone = (z: { x0: number; x1: number; z0: number; z1: number }, x: number, c: number) => x >= z.x0 && x <= z.x1 && c >= z.z0 && c <= z.z1;

/** Carrera por vueltas. Sin límite de tiempo: termina cuando todos los jugadores humanos llegan a la meta. */
export class RaceMode implements ModeLogic {
  readonly id = 'race' as const;
  finished = false;
  raceT = 0;
  private finishers = 0;
  private endDelay = -1;
  private laps: number;

  constructor(private g: Ctx) { this.laps = g.config.laps; }

  setup() {
    const { track } = this.g.map;
    const slots = shuffle(track.startGrid.slice(0, this.g.cats.length));
    this.g.cats.forEach((c, i) => {
      resetCat(c, slots[i][0], slots[i][1], track.startYaw);
      this.shuffleOffsets(c);
    });
    this.raceT = 0; this.finishers = 0; this.endDelay = -1; this.finished = false;
  }

  private shuffleOffsets(c: Cat) {
    c.offs = this.g.map.track.wpSpread.map((s) => [(Math.random() - 0.5) * 2 * s, (Math.random() - 0.5) * 2 * s] as [number, number]);
  }

  think(c: Cat, dt: number) { raceBot(this.g, c, dt); }

  update(dt: number) {
    this.raceT += dt;
    for (const c of this.g.fighters()) this.checkProgress(c);
    if (this.endDelay >= 0) {
      this.endDelay -= dt;
      if (this.endDelay <= 0) this.finished = true;
    } else {
      const humans = this.g.cats.filter((c) => c.human);
      if (humans.length && humans.every((c) => c.finished)) this.endDelay = 2.5;
      else if (this.g.cats.every((c) => c.finished)) this.endDelay = 0.5;
    }
  }

  private checkProgress(c: Cat) {
    if (c.finished) return;
    const tr = this.g.map.track, lim = tr.waypoints.length - 1, n = tr.checkpoints.length;
    if (c.wp < lim) {
      const w = tr.waypoints[c.wp];
      if (Math.hypot(w[0] - c.x, w[1] - c.z) < (c.human ? 6 : 3.2) && Math.abs(c.y - tr.wpY[c.wp]) < 3.5) c.wp++;
    }
    if (c.cp < n) {
      const yr = tr.cpY[c.cp];
      if (inZone(tr.checkpoints[c.cp], c.x, c.z) && (!yr || (c.y >= yr[0] && c.y <= yr[1]))) { c.wp = Math.max(c.wp, tr.cpWaypoint[c.cp]); c.cp++; }
    } else if (inZone(tr.finishZone, c.x, c.z) && c.y < 3) {
      c.cp = 0; c.wp = 0;
      if (c.lap >= this.laps) {
        c.finished = true; c.finishRank = ++this.finishers; c.finishT = this.raceT;
        c.say('¡Meta!', 4);
        this.g.audio.sfx(660, 0.3, 'square', 0.08);
      } else { c.lap++; c.say(`Vuelta ${c.lap} de ${this.laps}`, 1.6); }
    }
  }

  private progress(c: Cat) {
    if (c.finished) return 1e6 - c.finishRank;
    const tr = this.g.map.track;
    const f = tr.finishZone, n = c.cp < tr.checkpoints.length ? tr.cpCenters[c.cp] : [(f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2];
    return (c.lap - 1) * 100 + c.cp * 10 + (1 - clamp(Math.hypot(n[0] - c.x, n[1] - c.z) / 120, 0, 1)) * 9;
  }

  standings() { return this.g.cats.filter((c) => c.active).sort((a, b) => this.progress(b) - this.progress(a)); }

  /** Derribado en carrera: pierde croquetas y vuelve al último punto, sin descalificar. */
  onKO(v: Cat) {
    this.g.pickups.dropKibble(v, T.koKibbles);
    this.rescue(v);
    v.hp = v.hpMax; v.stun = T.koStun; v.inv = T.respawnInv; v.bleedT = 0; v.slowT = 0; v.held = null;
    v.say('¡KO! Vuelves al último punto', 2);
    this.g.audio.sfx(130, 0.3, 'sawtooth', 0.09);
  }

  /** Devuelve al gato al waypoint anterior al que persigue (en su piso y sobre la superficie). */
  rescue(c: Cat) {
    const tr = this.g.map.track, i = Math.max(0, Math.min(c.wp, tr.waypoints.length - 1) - 1);
    const [x, z] = tr.waypoints[i], wy = tr.wpY[i];
    const y = Math.max(wy, this.g.motion.groundAt(x, z, wy + 1.2));
    c.x = x; c.y = y + 0.02; c.z = z; c.vx = c.vy = c.vz = 0; c.climb = null; c.inv = 1; c.peakY = y; c.onGround = true;
    const n = tr.waypoints[Math.min(i + 1, tr.waypoints.length - 1)];
    c.yaw = Math.atan2(n[0] - x, n[1] - z);
    c.camYaw = c.yaw; c.camInit = false;
  }

  fillHud(p: Cat, h: HudState) {
    const r = this.standings();
    h.position = (p.finished ? p.finishRank : r.indexOf(p) + 1) || 1;
    h.total = r.length;
    h.lap = Math.min(p.lap, this.laps); h.laps = this.laps;
    h.score = p.score;
    h.rows = r.slice(0, 5).map((c) => ({ name: c.name, color: c.css, value: c.score, extra: c.finished ? 'META' : `V${Math.min(c.lap, this.laps)}`, me: c === p }));
    if (p.climb && h.msg === '') h.msg = 'Salta para soltarte';
    else if (p.lap === 1 && p.cp === 0 && p.wp <= 1 && this.raceT < 20 && h.msg === '' && this.g.map.track.hint) h.msg = this.g.map.track.hint;
  }

  result(humans: Cat[]): MatchResult {
    const r = this.standings();
    r.forEach((c, i) => { c.bonus = RACE_BONUS[i] ?? 0; });
    const t = [...r].sort((a, b) => b.score + b.bonus - (a.score + a.bonus));
    const p1 = humans[0];
    return {
      mode: 'race', winner: t[0].name, playerWon: t[0].human, raceTime: p1?.finished ? p1.finishT : this.raceT, laps: this.laps,
      rows: t.map((c) => ({ name: c.name, color: c.css, me: c.human, a: c.score, b: c.bonus, total: c.score + c.bonus })),
    };
  }
}
