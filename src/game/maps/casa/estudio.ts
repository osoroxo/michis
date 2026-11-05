import { MapBuilder, C } from '../MapBuilder';
import { chair, shelves, table } from './furniture';

/** Estudio: escritorio, biblioteca de baldas, sillón de lectura. */
export function buildEstudio(b: MapBuilder) {
  table(b, -39, -32, -27.5, -23.5, 2.8);
  b.box(-39, -36.8, 0, 2.4, -27.5, -23.5, C.WOOD2);                         // cajonera
  b.deco(-35, -33, 2.8, 3.8, -26.8, -25.8, C.BLACK);                         // monitor
  chair(b, -34.5, -21.6, '+z', 0, C.DARK);
  shelves(b, -30, -14, -28, -26.2, [1.6, 3.2, 4.8], true, 5);              // biblioteca (baldas saltables)
  shelves(b, -12, -8, -28, -26.2, [1.6, 3.2], true, 9);
  b.box(-24, -19, 0, 1.4, -11, -7, C.WOOD);                                  // mesa baja
  b.deco(-26, -17, 0.03, 0.07, -13, -5, 0x6a8a9a);                           // alfombra
  b.box(-14, -8.5, 0, 1.8, -17, -13, C.FAB); b.box(-14, -8.5, 1.8, 3.4, -17, -16.4, C.FAB); // sofá de lectura
  b.box(-40, -37.5, 0, 1.0, -8, -4, C.BOX);                                  // caja
  b.box(-34, -32.8, 0, 4.2, -5, -3.8, 0, { climb: true });                   // rascador
  b.deco(-26, -22, 3.6, 5.6, -27.85, -28, C.GREEN);                          // cuadro
}
