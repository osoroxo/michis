import { MapBuilder, C } from '../MapBuilder';
import { chair, table } from './furniture';

export const PUDDLE: { x0: number; x1: number; z0: number; z1: number } = { x0: 18, x1: 26, z0: 3.5, z1: 7.5 };

/** Cocina-comedor: encimera, nevera, alacenas con balda saltable, mesa con sillas y leche derramada. */
export function buildCocina(b: MapBuilder) {
  b.box(6.5, 34, 0, 3, 25, 28, C.WHITE); b.box(38, 40, 0, 3, 25, 28, C.WHITE);
  b.deco(6.5, 34, 3.0, 3.1, 25, 28, C.STEEL);
  b.deco(14, 18, 3.1, 3.25, 25.6, 27.4, C.STEEL); b.deco(24, 28, 3.1, 3.25, 25.8, 27.4, C.DARK);   // fregadero y placa
  b.box(34, 38, 0, 6.4, 24.5, 28, C.STEEL); b.deco(34, 38, 3.2, 3.35, 24.45, 24.5, C.DARK);        // nevera
  b.box(7, 17, 5, 7, 26.5, 28, C.WOOD3); b.box(22, 32, 5, 7, 26.5, 28, C.WOOD3);                  // alacenas
  b.box(17, 22, 4.6, 5.0, 26, 28, C.WOOD3);                                                        // balda saltable desde la encimera
  b.box(32, 34, 4.6, 5.0, 26, 28, C.WOOD3);
  // mesa de comedor y sillas
  table(b, 18, 29, 11, 17, 3.0);
  for (const x of [20, 24, 28]) { chair(b, x, 9.7, '-z'); chair(b, x, 18.3, '+z'); }
  b.deco(22, 25, 3.0, 3.5, 13, 15, 0xe0c068);                                                      // frutero
  const p = PUDDLE;
  b.deco(p.x0, p.x1, 0.03, 0.08, p.z0, p.z1, 0x9fd3f5);                                            // leche derramada
  b.box(38, 40, 0, 2.4, 8, 12, C.WOOD2);                                                           // mueble auxiliar
  b.deco(8, 10.2, 0, 0.4, 21, 22.4, C.RED);                                                        // comedero
  b.box(37.8, 39, 0, 4.2, 18, 19.2, 0, { climb: true });                                           // rascador
  b.deco(12, 16, 0.03, 0.06, 13, 21, 0xb5524a);                                                    // alfombrilla
}
