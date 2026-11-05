import { BREEDS } from '../game/config/breeds';
import type { CatSpec, MapId, PlayerSlot } from '../game/types';

export interface Profile {
  mapId: MapId;
  /** Cuatro puestos de jugador; `dev: null` = vacío. */
  players: PlayerSlot[];
  laps: number;
  rivals: number;
  killTarget: number;
  /** Mejor tiempo de carrera en segundos (un jugador), por mapa y número de vueltas. */
  records: Record<string, number>;
}

const NAMES = ['Michi', 'Pelusa', 'Gordo', 'Bigotes'];
const ACCENTS = ['#ff5d8f', '#2dd4e8', '#b6e34a', '#ffc23d'];
const slotCat = (i: number): CatSpec => {
  const b = BREEDS[i % BREEDS.length];
  return { breed: b.id, name: NAMES[i], body: b.defaults.body, patch: b.defaults.patch, accent: ACCENTS[i] };
};

export const defaultProfile = (): Profile => ({
  players: [0, 1, 2, 3].map((i) => ({ dev: i === 0 ? 'k1' : null, cat: slotCat(i) })),
  mapId: 'casa', laps: 2, rivals: 5, killTarget: 5, records: {},
});

const KEY = 'michi-rally-profile-v2';
const inTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/** En la app de escritorio el perfil se guarda en disco desde Rust (`load_profile` / `save_profile`); en el navegador, en localStorage. */
export async function loadProfile(): Promise<Profile> {
  const base = defaultProfile();
  try {
    let raw: string | null = null;
    if (inTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      raw = await invoke<string | null>('load_profile');
    } else raw = localStorage.getItem(KEY) ?? localStorage.getItem('michi-rally-profile');
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<Profile> & { cat?: CatSpec };
    const players = base.players.map((slot, i) => {
      const saved = p.players?.[i];
      const cat = { ...slot.cat, ...(saved?.cat ?? (i === 0 ? p.cat : undefined) ?? {}) };
      if (!BREEDS.some((b) => b.id === cat.breed)) cat.breed = slot.cat.breed;
      return { dev: saved ? saved.dev : slot.dev, cat };
    });
    if (!players.some((s) => s.dev)) players[0].dev = 'k1';
    const mapId = (['casa', 'parque', 'museo', 'torre'] as const).find((m) => m === p.mapId) ?? base.mapId;
    return { ...base, ...p, mapId, players, records: p.records ?? {} };
  } catch {
    return base;
  }
}

export async function saveProfile(p: Profile): Promise<void> {
  try {
    const json = JSON.stringify(p);
    if (inTauri()) {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('save_profile', { json });
    } else localStorage.setItem(KEY, json);
  } catch { /* guardar es opcional */ }
}

export async function quitApp(): Promise<void> {
  if (inTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('quit_game');
  }
}
export const canQuit = inTauri;
