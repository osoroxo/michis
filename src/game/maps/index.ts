import type { MapId } from '../types';
import type { GameMap } from './types';
import { buildCasa } from './casa';
import { buildParque } from './parque';
import { buildMuseo } from './museo';
import { buildTorre } from './torre';

export interface MapInfo { id: MapId; name: string; icon: string; blurb: string; build: () => GameMap }

/** Mapas disponibles. Para añadir uno: crea su constructor y regístralo aquí. */
export const MAPS: MapInfo[] = [
  { id: 'casa', name: 'Casa de dos pisos', icon: '🏠', blurb: 'Escaleras, estantes y un gimnasio de gatos hasta la galería del piso alto.', build: buildCasa },
  { id: 'parque', name: 'Parque', icon: '🌳', blurb: 'Aire libre: árboles trepables, estanque que ralentiza, colina, tobogán y glorieta.', build: buildParque },
  { id: 'museo', name: 'Museo', icon: '🏛️', blurb: 'Gran salón con esqueleto de dinosaurio, pirámide egipcia y un puente en el entrepiso.', build: buildMuseo },
  { id: 'torre', name: 'Casa de cuatro pisos', icon: '🏢', blurb: 'Una torre con seis tramos de escaleras: sube por un lado y baja por el otro. Cuidado con las caídas.', build: buildTorre },
];

export const mapInfo = (id: MapId): MapInfo => MAPS.find((m) => m.id === id) ?? MAPS[0];
export const buildMap = (id: MapId): GameMap => mapInfo(id).build();
