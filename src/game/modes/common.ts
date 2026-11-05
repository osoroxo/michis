import type { Cat } from '../entities/Cat';
import { neutralCtl } from '../types';

/** Devuelve a un gato a su estado inicial en (x, z). */
export function resetCat(c: Cat, x: number, z: number, yaw: number, y = 0, active = true) {
  c.active = active;
  c.model.root.visible = active;
  c.model.shadow.visible = active;
  Object.assign(c, {
    x, y: y + 0.02, z, vx: 0, vy: 0, vz: 0, yaw, camYaw: yaw, camOff: 0, onGround: true, climb: null, climbCd: 0, jumpsUsed: 0, peakY: y, dodgeT: 0, dodgeCd: 0,
    hp: c.hpMax, down: false, respawnT: 0, stun: 0, inv: 0, ultra: 0, slowT: 0, bleedT: 0, lastAttacker: null, lastAttackT: 0,
    clawCd: 0, clawAnim: 0, clawLevel: 0, sharpenT: 0, sharpening: false, ballN: 2, ballT: 0, held: null,
    score: 0, bonus: 0, lap: 1, cp: 0, wp: 0, finished: false, finishRank: 0, finishT: 0, climbed: false, kills: 0, deaths: 0,
    msg: '', msgT: 0, camInit: false, ctl: neutralCtl(), prev: { jump: false, claw: false, throw: false, dodge: false, back: false },
    botT: 0, botX: x, botZ: z, botY: y, stuck: 0, targetId: -1, targetT: 0, aiGoal: null,
  });
  c.botPace = c.human ? 1 : 0.9 + 0.1 * Math.random();
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
