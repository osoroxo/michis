import { MapBuilder, C } from '../MapBuilder';
import { shelves } from './furniture';

/**
 * Gimnasio de gatos: cinco bloques de sisal cada vez más altos (1,6 · 3,2 · 4,8 · 6,4 · 8,0), en escalera.
 * Se sube empujando contra cada cara (se trepa) o saltando de uno a otro; el último queda pegado a la
 * galería del piso alto.
 */
export function buildGym(b: MapBuilder) {
  const PAD = 0x8e6bb0, PAD2 = 0xb48cd6;
  const blocks: Array<[number, number, number, number, number]> = [   // x0, x1, z0, z1, altura
    [-34, -30, 11, 15, 1.6], [-30, -26, 11, 15, 3.2], [-26, -22, 11, 15, 4.8], [-22, -18, 11, 15, 6.4], [-18, -13, 8, 12, 8.0],
  ];
  blocks.forEach(([x0, x1, z0, z1, h], i) => {
    b.box(x0, x1, 0, h, z0, z1, 0, { climb: true });
    b.deco(x0 + 0.5, x1 - 0.5, h, h + 0.08, z0 + 0.5, z1 - 0.5, i % 2 ? PAD2 : PAD);   // cojín en la cima
  });
  b.box(-34, -32.6, 0, 8.6, 15, 16.4, 0, { climb: true });                           // poste alto para rascarse y trepar
  b.deco(-32.4, -31.8, 7.0, 8.2, 15.4, 16.0, 0xe0527a);                              // juguete colgante
  b.deco(-31, -27, 0, 0.9, 16.2, 17.8, 0xc49a6c);                                    // casita
}

/** Sala de estar con doble altura: estantería trepable, sofá, tele, gimnasio de gatos y rascadores. */
export function buildSala(b: MapBuilder) {
  // Estantería gigante pegada al muro oeste: baldas de 1,8 en 1,8 hasta el nivel de la galería (8,0)
  shelves(b, -40, -37.6, 8.5, 24, [1.6, 3.2, 4.8, 6.4, 8.0], false, 2);
  b.box(-40, -37.6, 0, 8.0, 8, 8.5, C.WOOD2);
  buildGym(b);
  // sofá en L mirando a la tele
  b.box(-22, -12, 0, 1.8, 22, 26.5, C.FAB); b.box(-22, -12, 1.8, 3.6, 26.5, 27.8, C.FAB);
  b.box(-23, -22, 0, 2.6, 22, 27.8, C.FAB); b.box(-12, -11, 0, 2.6, 22, 27.8, C.FAB);
  b.deco(-20.5, -18.5, 1.8, 2.4, 23, 25, C.FAB3); b.deco(-15.5, -13.5, 1.8, 2.4, 23, 25, C.FAB3);
  b.deco(-22, -12, 0.03, 0.07, 12.5, 21, C.FAB3);                              // alfombra
  b.box(-19, -15, 0, 1.4, 16, 19.5, C.WOOD);                                   // mesa de centro
  // mueble de la tele contra el muro este
  b.box(-9.6, -6.5, 0, 1.8, 20, 26, C.WOOD2); b.deco(-8.6, -8.2, 1.8, 4.4, 20.6, 25.4, C.BLACK);
  b.box(-34, -30.5, 0, 1.6, 20, 23.5, C.FAB2); b.box(-34, -30.5, 1.6, 3.4, 22.9, 23.5, C.FAB2); // sillón
  b.box(-9, -7.6, 0, 1.2, 4, 5.6, C.WOOD2); b.deco(-8.8, -7.8, 1.2, 3.0, 4.3, 5.3, C.GREEN);  // maceta
  b.box(-34, -32.8, 0, 4.2, 25, 26.2, 0, { climb: true });                      // rascador
  b.box(-12.4, -11.2, 0, 4.2, 4, 5.2, 0, { climb: true });
  b.box(-38, -34, 0, 1.0, 3.5, 6.5, C.BOX);                                    // caja de juguetes
  b.deco(-30, -22, 0.03, 0.06, 5, 9, 0x6b9a8a);
  // cuadros
  b.deco(-26, -22, 4.2, 6.2, 27.85, 28, C.BLUE); b.deco(-16, -12, 4.2, 6.0, 27.85, 28, C.RED);
}
