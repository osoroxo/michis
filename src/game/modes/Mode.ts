import type { Cat } from '../entities/Cat';
import type { HudState, MatchResult, ModeId } from '../types';

/** Reglas de un modo de juego. El motor es el mismo; cambian objetivos, reapariciones y marcador. */
export interface ModeLogic {
  readonly id: ModeId;
  /** Verdadero cuando la partida debe terminar. */
  finished: boolean;
  /** Reparte los gatos en el escenario y reinicia el estado. */
  setup(): void;
  /** Decide qué hace un gato CPU en este frame. */
  think(c: Cat, dt: number): void;
  /** Un paso de simulación (progreso, reapariciones, condiciones de victoria). */
  update(dt: number): void;
  /** Un gato se quedó sin vida. */
  onKO(victim: Cat, attacker: Cat | null): void;
  /** Rescata a un gato atascado. */
  rescue(c: Cat): void;
  /** Clasificación actual, de mejor a peor. */
  standings(): Cat[];
  fillHud(player: Cat, h: HudState): void;
  /** Resultado final; `humans` son los gatos controlados por jugadores. */
  result(humans: Cat[]): MatchResult;
}
