import type { Cat } from '../entities/Cat';
import type { Ctx } from '../systems/ctx';
import { battleBot } from '../systems/ai';
import { T } from '../config/tuning';
import type { HudState, MatchResult } from '../types';
import type { ModeLogic } from './Mode';
import { resetCat, shuffle } from './common';

/** Batalla libre: gana quien primero llegue al número de derribos. Sin límite de tiempo. */
export class BattleMode implements ModeLogic {
  readonly id = 'battle' as const;
  finished = false;
  private target: number;

  constructor(private g: Ctx) { this.target = g.config.killTarget; }

  setup() {
    const spawns = shuffle(this.g.map.spawns.battle);
    this.g.cats.forEach((c, i) => {
      const s = spawns[i % spawns.length];
      resetCat(c, s[0], s[2], Math.random() * Math.PI * 2, s[1]);
    });
    this.finished = false;
  }

  think(c: Cat, dt: number) { battleBot(this.g, c, dt); }

  update(dt: number) {
    for (const c of this.g.cats) {
      if (!c.down) continue;
      c.respawnT -= dt;
      if (c.respawnT <= 0) this.respawn(c);
    }
    if (this.g.cats.some((c) => c.kills >= this.target)) this.finished = true;
  }

  onKO(v: Cat, attacker: Cat | null) {
    if (v.down) return;
    v.down = true; v.respawnT = T.respawnDelay; v.deaths++;
    v.model.root.visible = false; v.model.shadow.visible = false;
    v.climb = null; v.held = null; v.ultra = 0; v.bleedT = 0; v.slowT = 0; v.stun = 0; v.sharpening = false;
    v.clawLevel = Math.max(0, v.clawLevel - 1);
    this.g.audio.sfx(130, 0.3, 'sawtooth', 0.09);
    this.g.effects.ring(v.x, v.y, v.z, 3.2, v.hex, 0.5);
    if (attacker && attacker !== v) {
      attacker.kills++;
      attacker.say(`¡Derribaste a ${v.name}!`, 1.8);
      v.say(`Te derribó ${attacker.name}`, 2.5);
    } else v.say('¡Te caíste!', 2.5);
  }

  /** Reaparece en el punto de aparición más alejado de los demás. */
  private respawn(c: Cat) {
    const others = this.g.fighters().filter((o) => o !== c);
    let best = this.g.map.spawns.battle[0], bd = -1;
    for (const s of this.g.map.spawns.battle) {
      const d = others.length ? Math.min(...others.map((o) => Math.hypot(o.x - s[0], o.z - s[2]) + Math.abs(o.y - s[1]) * 2)) : 0;
      if (d > bd) { bd = d; best = s; }
    }
    c.down = false; c.hp = c.hpMax; c.x = best[0]; c.y = best[1] + 0.02; c.z = best[2]; c.vx = c.vy = c.vz = 0; c.onGround = true; c.peakY = best[1];
    c.inv = T.respawnInv; c.ballN = 2; c.camInit = false;
    c.model.root.visible = true; c.model.shadow.visible = true;
  }

  rescue(c: Cat) {
    const sp = this.g.map.spawns.battle[Math.floor(Math.random() * this.g.map.spawns.battle.length)];
    c.x = sp[0]; c.y = sp[1] + 0.02; c.z = sp[2]; c.vx = c.vy = c.vz = 0; c.climb = null; c.inv = 1; c.peakY = sp[1]; c.onGround = true;
  }

  standings() {
    return this.g.cats.filter((c) => c.active).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  }

  fillHud(p: Cat, h: HudState) {
    const r = this.standings();
    h.position = r.indexOf(p) + 1; h.total = r.length;
    h.score = p.kills; h.killTarget = this.target;
    h.down = p.down ? Math.max(0, p.respawnT) : 0;
    h.rows = r.slice(0, 6).map((c) => ({ name: c.name, color: c.css, value: c.kills, extra: `${c.deaths}☠`, me: c === p }));
  }

  result(_humans: Cat[]): MatchResult {
    const r = this.standings();
    return {
      mode: 'battle', winner: r[0].name, playerWon: r[0].human, raceTime: 0, laps: 0,
      rows: r.map((c) => ({ name: c.name, color: c.css, me: c.human, a: c.kills, b: c.deaths, total: c.kills })),
    };
  }
}
