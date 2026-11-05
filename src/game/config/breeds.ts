import type { BreedId } from '../types';

export type Pattern = 'solid' | 'tabby' | 'points' | 'tuxedo' | 'spots';
export type EarKind = 'normal' | 'big' | 'folded' | 'tufted';
export type TailKind = 'normal' | 'long' | 'fluffy' | 'short';

export interface BreedDef {
  id: BreedId;
  name: string;
  blurb: string;
  /** Multiplicadores sobre T (1 = base). */
  stats: { speed: number; jump: number; hp: number; claw: number };
  /** Aspecto: escala general y proporciones. */
  look: { scale: number; bodyLen: number; bodyW: number; headW: number; legLen: number; pattern: Pattern; ears: EarKind; tail: TailKind };
  defaults: { body: string; patch: string; accent: string };
}

export const BREEDS: BreedDef[] = [
  {
    id: 'callejero', name: 'Callejero', blurb: 'Equilibrado y astuto. Sin puntos débiles.',
    stats: { speed: 1, jump: 1, hp: 1, claw: 1 },
    look: { scale: 1, bodyLen: 1, bodyW: 1, headW: 1, legLen: 1, pattern: 'tabby', ears: 'normal', tail: 'normal' },
    defaults: { body: '#f08a24', patch: '#fff0d0', accent: '#ff5d8f' },
  },
  {
    id: 'siames', name: 'Siamés', blurb: 'Rápido y ágil, pero frágil.',
    stats: { speed: 1.12, jump: 1.08, hp: 0.82, claw: 0.95 },
    look: { scale: 0.96, bodyLen: 1.06, bodyW: 0.86, headW: 0.9, legLen: 1.15, pattern: 'points', ears: 'big', tail: 'long' },
    defaults: { body: '#efe3cf', patch: '#4a3a34', accent: '#2dd4e8' },
  },
  {
    id: 'maine', name: 'Maine Coon', blurb: 'Enorme y fuerte: garras pesadas, algo lento.',
    stats: { speed: 0.9, jump: 0.94, hp: 1.3, claw: 1.25 },
    look: { scale: 1.16, bodyLen: 1.15, bodyW: 1.12, headW: 1.1, legLen: 1, pattern: 'tabby', ears: 'tufted', tail: 'fluffy' },
    defaults: { body: '#8a6a4a', patch: '#3b2c20', accent: '#b6e34a' },
  },
  {
    id: 'bengali', name: 'Bengalí', blurb: 'Saltarín y trepador. Salta altísimo.',
    stats: { speed: 1.05, jump: 1.2, hp: 0.9, claw: 1.05 },
    look: { scale: 1, bodyLen: 1.04, bodyW: 0.94, headW: 0.95, legLen: 1.12, pattern: 'spots', ears: 'normal', tail: 'normal' },
    defaults: { body: '#d9a14a', patch: '#4a3320', accent: '#ffc23d' },
  },
  {
    id: 'persa', name: 'Persa', blurb: 'Aguanta golpes y caídas, pero pesado.',
    stats: { speed: 0.88, jump: 0.9, hp: 1.45, claw: 1 },
    look: { scale: 1.04, bodyLen: 0.92, bodyW: 1.2, headW: 1.15, legLen: 0.8, pattern: 'solid', ears: 'folded', tail: 'fluffy' },
    defaults: { body: '#efe9df', patch: '#c9bfb0', accent: '#ff7b54' },
  },
];

export const breedOf = (id: BreedId): BreedDef => BREEDS.find((b) => b.id === id) ?? BREEDS[0];

/** Paletas rápidas del selector de color. */
export const FUR_PRESETS = ['#f08a24', '#34303d', '#efe9df', '#8b93a7', '#8a6a4a', '#d9a14a', '#efe3cf', '#c0392b', '#5b8def', '#7ed957'];
export const ACCENT_PRESETS = ['#ff5d8f', '#2dd4e8', '#b6e34a', '#ffc23d', '#ff7b54', '#b18cff', '#ffffff', '#ff3b3b'];

/** Colores de pelaje para los gatos CPU (razas y colores variados). */
export const CPU_NAMES = ['Tizón', 'Nube', 'Bruma', 'Canela', 'Mochi', 'Sombra', 'Pícaro', 'Galleta'];
export const CPU_FURS: Array<[string, string]> = [
  ['#34303d', '#57506a'], ['#efe9df', '#c9bfb0'], ['#8b93a7', '#5f667a'], ['#c97b3d', '#f3d9a8'],
  ['#e8e0d0', '#7a5a46'], ['#2a2a30', '#ffffff'], ['#b8864a', '#4a3320'], ['#d8d8d8', '#8a8a8a'],
];
export const CPU_ACCENTS = ['#2dd4e8', '#b6e34a', '#ffc23d', '#ff7b54', '#b18cff', '#ffffff', '#ff3b3b'];
