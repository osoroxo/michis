import type { Cat } from '../entities/Cat';
import type { GameMap } from '../maps/types';
import type { MatchConfig } from '../types';
import type { Audio } from './Audio';
import type { Combat } from './Combat';
import type { Effects } from './Effects';
import type { Motion } from './Motion';
import type { Pickups } from './Pickups';
import type { Projectiles } from './Projectiles';
import type { ModeLogic } from '../modes/Mode';

/** Lo que cualquier sistema puede consultar de la partida en curso. */
export interface Ctx {
  map: GameMap;
  config: MatchConfig;
  cats: Cat[];
  motion: Motion;
  audio: Audio;
  effects: Effects;
  combat: Combat;
  projectiles: Projectiles;
  pickups: Pickups;
  mode: ModeLogic;
  /** Falso en cuenta atrás y al terminar: no hay daño. */
  live: boolean;
  /** Los gatos que participan y no están derribados. */
  fighters(): Cat[];
}
