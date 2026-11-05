/** Todo lo que define la sensación del juego está aquí. */
export const T = {
  walk: 6, run: 10.5, ultra: 17,           // velocidades
  jump: 11, jump2: 9.2, gravity: 28,       // salto simple ≈ 2,1 de alto
  climb: 5, climbRun: 7.5, climbUltra: 11,
  accelGround: 42, accelAir: 15,
  ultraTime: 6, stun: 1, invuln: 1.6,
  ballSpeed: 25, ballGravity: 7, ballMax: 3, ballRegen: 5,
  clawReach: 2.5, clawCd: 0.7, clawDrop: 2, clawDamage: 14,
  pounceMul: 1.35,                          // garra en el aire
  sharpenTime: 1.4, sharpenMax: 3, sharpenDmg: 0.35, sharpenReach: 0.22, sharpenRange: 1.7,
  kibbleRespawn: 14, fishRespawn: 22, milkRespawn: 30, throwableRespawn: 18,
  milkHeal: 40,
  puddleSlow: 0.55,
  halfW: 0.45, height: 0.95,
  maxHp: 100,
  koStun: 2.2, koKibbles: 5, respawnDelay: 3, respawnInv: 2.2,
  fall: {
    safe: 6,          // caída sin daño
    dmgPerUnit: 4.5,  // daño por unidad de altura sobre la segura
    slowFrom: 6, slowBase: 1.5, slowPerUnit: 0.22, slowMax: 5, slowMul: 0.55,
    bleedFrom: 10, bleedTime: 3.5, bleedDps: 5,
    hardLandFrom: 14, hardStun: 0.6,
  },
  bleedDps: 5,
  dodge: { time: 0.4, cd: 1.1, speed: 17, hop: 6.5 },
  clawAnim: 0.45,
} as const;

export const RACE_BONUS = [25, 15, 8, 0];
export const MAX_CATS = 8;
