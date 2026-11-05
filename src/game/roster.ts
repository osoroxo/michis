import { BREEDS, CPU_ACCENTS, CPU_FURS, CPU_NAMES } from './config/breeds';
import type { CatSpec } from './types';

/** Genera los rivales CPU: razas y colores variados, sin repetir el color de collar del jugador. */
export function makeRivals(n: number, player?: CatSpec): CatSpec[] {
  const accents = CPU_ACCENTS.filter((a) => a.toLowerCase() !== player?.accent.toLowerCase());
  const off = Math.floor(Math.random() * BREEDS.length);
  return Array.from({ length: n }, (_, i) => {
    const breed = BREEDS[(i + off) % BREEDS.length];
    const [body, patch] = CPU_FURS[(i + off) % CPU_FURS.length];
    return { breed: breed.id, name: CPU_NAMES[i % CPU_NAMES.length], body, patch, accent: accents[i % accents.length] };
  });
}
