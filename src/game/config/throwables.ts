export type ThrowId = 'hairball' | 'yarn' | 'vase' | 'book' | 'tuna' | 'pillow';

export interface ThrowDef {
  id: ThrowId;
  name: string;
  color: number;
  /** Radio visual / de impacto. */
  radius: number;
  speed: number; gravity: number; life: number;
  dmg: number; stun: number; knock: number;
  /** Rebotes en suelo y paredes antes de morir. */
  bounces: number;
  /** Daño en área al impactar (0 = solo directo). */
  aoe: number;
  kibbleLoss: number;
  effect?: 'slow' | 'bleed';
  msg: string;
  /** Peso en el reparto de apariciones del modo batalla. */
  weight: number;
}

export const THROWABLES: Record<ThrowId, ThrowDef> = {
  hairball: { id: 'hairball', name: 'Bola de pelo', color: 0xc9a3b4, radius: 0.34, speed: 25, gravity: 7, life: 2.5, dmg: 8, stun: 1, knock: 8, bounces: 0, aoe: 0, kibbleLoss: 3, msg: '¡Bola de pelo!', weight: 0 },
  yarn: { id: 'yarn', name: 'Ovillo', color: 0xe0527a, radius: 0.42, speed: 21, gravity: 14, life: 3.2, dmg: 6, stun: 0.5, knock: 6, bounces: 3, aoe: 0, kibbleLoss: 2, effect: 'slow', msg: '¡Enredado en lana!', weight: 3 },
  vase: { id: 'vase', name: 'Florero', color: 0x6fa8dc, radius: 0.5, speed: 17, gravity: 20, life: 3, dmg: 24, stun: 1.2, knock: 12, bounces: 0, aoe: 3, kibbleLoss: 4, msg: '¡Florero roto!', weight: 2 },
  book: { id: 'book', name: 'Libro', color: 0x8c3f2f, radius: 0.4, speed: 32, gravity: 4, life: 2, dmg: 14, stun: 0.8, knock: 10, bounces: 0, aoe: 0, kibbleLoss: 3, msg: '¡Libro en la cara!', weight: 3 },
  tuna: { id: 'tuna', name: 'Lata de atún', color: 0xb8c4cc, radius: 0.36, speed: 23, gravity: 12, life: 2.6, dmg: 10, stun: 0.6, knock: 7, bounces: 0, aoe: 0, kibbleLoss: 3, effect: 'bleed', msg: '¡Corte de lata!', weight: 3 },
  pillow: { id: 'pillow', name: 'Almohada', color: 0xf4efe6, radius: 0.55, speed: 16, gravity: 10, life: 2.6, dmg: 2, stun: 0.4, knock: 24, bounces: 0, aoe: 0, kibbleLoss: 0, msg: '¡Empujón!', weight: 2 },
};

export const PICKABLE: ThrowId[] = ['yarn', 'vase', 'book', 'tuna', 'pillow'];
