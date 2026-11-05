import { MapBuilder, C, LV } from '../MapBuilder';
import { bed, chair, shelves, table } from './furniture';

const Y = LV.slabTop;

/** Dormitorio principal, altillo con vistas a la sala, cuarto 2, baño y cuarto de costura. */
export function buildUpstairs(b: MapBuilder) {
  // Dormitorio principal
  bed(b, -38, -28, -27.5, -20, Y, '-z', C.FAB2);
  b.box(-40, -38.4, Y, Y + 2.4, -27.5, -25.5, C.WOOD2); b.box(-28, -26.4, Y, Y + 2.4, -27.5, -25.5, C.WOOD2);   // mesillas
  b.deco(-39.6, -38.6, Y + 2.4, Y + 3.2, -27, -26, 0xffe28a);
  b.box(-12, -6.8, Y, Y + 6, -27.5, -24, C.WOOD3);                              // armario
  b.box(-18, -14, Y, Y + 3.2, -27.5, -25, C.WOOD2);                             // cómoda (escalón hacia el armario)
  b.deco(-26, -16, Y + 0.03, Y + 0.07, -22, -12, 0xd9b0c0);                      // alfombra
  b.box(-24, -22, Y, Y + 1.2, -10, -7.5, C.BOX);
  // Altillo: balda baja saltable, puff, sofá-sacos y la galería abierta sobre la sala
  shelves(b, -40, -38, -4, 5.5, [1.6, 3.2], false, 11);
  b.box(-31, -28, Y, Y + 1.6, -3, 0, C.FAB3); b.box(-27, -24, Y, Y + 1.4, -3, -0.2, C.BLUE);
  table(b, -18, -13, -2, 2, 2.2, Y);
  b.box(-12, -10.8, Y, Y + 4.2, 3.5, 4.7, 0, { climb: true });                    // rascador
  b.deco(-20, -10, Y + 0.03, Y + 0.07, -4.5, 3, 0xb08a5a);
  // Cuarto 2
  bed(b, 7.5, 14.5, 20, 27.5, Y, '+z', C.BLUE);
  b.box(15, 17, Y, Y + 2.4, 26, 27.5, C.WOOD2);
  table(b, 7.5, 12.5, 4, 8, 2.6, Y);
  chair(b, 10, 9.4, '-z', Y, C.GREEN);
  b.box(17, 21.5, Y, Y + 1.4, 12, 17, C.BOX);
  b.box(8.4, 9.6, Y, Y + 4.2, 12, 13.2, 0, { climb: true });
  b.deco(10, 19, Y + 0.03, Y + 0.07, 12, 19, 0xf0e0a0);
  // Baño
  b.box(23, 29, Y, Y + 1.8, 24, 27.5, C.WHITE); b.deco(23.4, 28.6, Y + 1.8, Y + 2.0, 24.4, 27.1, C.GLASS);  // bañera
  b.box(37, 39.5, Y, Y + 1.8, 24, 26.5, C.WHITE); b.box(38.4, 39.5, Y + 1.8, Y + 3.6, 24, 26.5, C.WHITE); // inodoro
  b.box(31, 36, Y, Y + 2.6, 26, 27.8, C.WOOD3); b.deco(32, 35, Y + 2.6, Y + 2.8, 26.3, 27.5, C.WHITE);    // lavabo
  b.deco(24, 36, Y + 0.04, Y + 0.08, 12, 19, 0x7ab0d6);
  // Costura (ala este, atrás)
  table(b, 18, 25, -10, -5, 2.8, Y);
  chair(b, 21.5, -3.6, '+z', Y, C.DARK);
  shelves(b, 10, 22, -28, -26.5, [Y + 1.6, Y + 3.2, Y + 4.8], true, 6);
  b.box(28, 33, Y, Y + 1.5, -12, -8, C.FAB);
  b.box(7.5, 8.7, Y, Y + 4.2, -10, -8.8, 0, { climb: true });
  b.deco(15, 28, Y + 0.03, Y + 0.07, -17, -12, 0x9a6a7a);
}
