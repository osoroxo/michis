export type Zone = { x0: number; x1: number; z0: number; z1: number };
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export interface Collider {
  x0: number; x1: number; y0: number; y1: number; z0: number; z1: number;
  /** Superficie de sisal: se puede trepar y sirve para afilar garras. */
  climb: boolean;
}

/** Intención de un gato en un frame (humano o IA). `jump/claw/throw` son por flanco (una vez por pulsación). */
export interface Ctl {
  mx: number; mz: number;
  run: boolean; jump: boolean; claw: boolean; throw: boolean; sharpen: boolean; dodge: boolean;
}
export const neutralCtl = (): Ctl => ({ mx: 0, mz: 0, run: false, jump: false, claw: false, throw: false, sharpen: false, dodge: false });

export type BreedId = 'callejero' | 'siames' | 'maine' | 'bengali' | 'persa';

/** Lo que el jugador elige en el creador de gatos. */
export interface CatSpec {
  breed: BreedId;
  name: string;
  body: string;   // #rrggbb
  patch: string;
  accent: string; // collar / color de jugador
}

export type ModeId = 'race' | 'battle';
export type MapId = 'casa' | 'parque' | 'museo' | 'torre';

/** Un jugador humano: dispositivo ('k1' | 'k2' | 'g0'..'g3') y su gato. */
export interface PlayerSlot { dev: string | null; cat: CatSpec }

export interface MatchConfig {
  mode: ModeId;
  mapId: MapId;
  /** Jugadores humanos (1..4). Vacío solo en el fondo de menú. */
  players: Array<{ dev: string; cat: CatSpec }>;
  laps: number;       // carrera
  killTarget: number; // batalla
  rivals: number;     // gatos CPU
  /** Fondo de menú: solo CPUs, cámara orbital, sin HUD. */
  attract?: boolean;
}

export interface HudCatRow { name: string; color: string; value: number; extra: string; me: boolean }

export interface HudState {
  mode: ModeId;
  phase: 'count' | 'play' | 'ended';
  countdown: string;
  hp: number; hpMax: number;
  score: number;      // croquetas (carrera) / derribos (batalla)
  position: number; total: number;
  lap: number; laps: number;
  tier: number;       // 0 quieto, 1 camina, 2 corre, 3 ultra
  ultra: number;      // 0..1
  balls: number; ballMax: number;
  held: string | null;
  clawLevel: number; clawMax: number;
  sharpen: number;    // 0..1 progreso
  slow: boolean; bleeding: boolean;
  jumpsLeft: number;
  dodge: number;      // 0..1 recarga de la esquiva (1 = lista)
  msg: string;
  rows: HudCatRow[];
  killTarget: number;
  down: number;       // segundos para reaparecer (batalla)
}

export interface ResultRow {
  name: string; color: string; me: boolean; // me = gato humano
  a: number; b: number; total: number; // carrera: croquetas, bonus; batalla: derribos, caídas
}
export interface MatchResult {
  mode: ModeId; winner: string; rows: ResultRow[]; playerWon: boolean;
  raceTime: number; laps: number;
}

/** Un cuadro de HUD por jugador humano, con el rectángulo de su vista en píxeles CSS. */
export interface HudView { hud: HudState; rect: { x: number; y: number; w: number; h: number }; color: string; name: string; overhead?: false }
export interface HudFrame { views: HudView[]; minimap: 'top' | 'bottom' | 'center' }
