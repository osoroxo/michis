import { MapBuilder, C } from '../MapBuilder';
import { shelves } from './furniture';

/** Lavandería con la escalera de servicio al fondo (la escalera la crea shell.ts). */
export function buildLavanderia(b: MapBuilder) {
  b.box(28, 32, 0, 3.2, -27.5, -24, C.WHITE); b.deco(29, 31, 1, 2.4, -24.05, -24, C.GLASS);        // lavadora
  b.box(32, 36, 0, 3.2, -27.5, -24, C.WHITE); b.deco(33, 35, 1, 2.4, -24.05, -24, C.STEEL);        // secadora
  shelves(b, 10, 24, -28, -26.5, [1.7, 3.4, 5.1], true, 4);                                         // estantería de productos
  b.box(24, 27.2, 0, 1.8, -15, -12, C.BOX); b.box(24.6, 27.2, 1.8, 3.4, -15, -12.6, C.BOX);        // cajas apiladas
  b.box(11, 14, 0, 1.4, -12, -9, C.BLUE);                                                           // cesto
  b.box(7, 9.5, 0, 6, -17, -14.5, C.STEEL);                                                         // calentador
  b.box(16, 19, 0, 1.2, -8, -5, C.BOX);
  b.box(8.4, 9.6, 0, 4.2, -8, -6.8, 0, { climb: true });                                            // rascador
  b.deco(20, 24, 0.03, 0.06, -8, -2, 0x8a8f99);
}
