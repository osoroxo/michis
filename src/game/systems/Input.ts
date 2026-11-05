export interface RawInput {
  ix: number; iz: number; rx: number;
  run: boolean; jump: boolean; claw: boolean; throw: boolean; sharpen: boolean; dodge: boolean; back: boolean;
}

export interface KeyMap { u: string[]; d: string[]; l: string[]; r: string[]; jump: string[]; run: string[]; claw: string[]; thr: string[]; sharpen: string[]; dodge: string[]; back: string[]; lq: string[]; le: string[] }

/** Dos mapas de teclado: el 1 en la zona izquierda y el 2 en la derecha, para jugar dos en el mismo teclado. */
export const KEYMAPS: Record<'k1' | 'k2', KeyMap> = {
  k1: { u: ['KeyW'], d: ['KeyS'], l: ['KeyA'], r: ['KeyD'], jump: ['Space'], run: ['ShiftLeft'], claw: ['KeyF'], thr: ['KeyG'], sharpen: ['KeyH'], dodge: ['KeyC'], back: ['KeyR'], lq: ['KeyQ'], le: ['KeyE'] },
  k2: { u: ['ArrowUp'], d: ['ArrowDown'], l: ['ArrowLeft'], r: ['ArrowRight'], jump: ['Enter'], run: ['ShiftRight'], claw: ['KeyK'], thr: ['KeyL'], sharpen: ['Semicolon'], dodge: ['Comma'], back: ['KeyO'], lq: ['KeyU'], le: ['KeyI'] },
};

/** Tabla de controles: la usa la entrada y también la pantalla de ayuda. */
export const CONTROLS: Array<{ action: string; pad: string; k1: string; k2: string }> = [
  { action: 'Unirse (en el menú de jugadores)', pad: 'A', k1: 'Espacio', k2: 'Enter' },
  { action: 'Moverse', pad: 'Stick izquierdo', k1: 'W A S D', k2: 'Flechas' },
  { action: 'Saltar (otra vez en el aire: doble salto)', pad: 'A', k1: 'Espacio', k2: 'Enter' },
  { action: 'Correr', pad: 'RT / LT', k1: 'Shift izq.', k2: 'Shift der.' },
  { action: 'Garras (se yergue sobre dos patas; en el aire: picado)', pad: 'B', k1: 'F', k2: 'K' },
  { action: 'Esquivar: bote que evita golpes y objetos', pad: 'RB', k1: 'C', k2: ',' },
  { action: 'Lanzar objeto o bola de pelo', pad: 'X', k1: 'G', k2: 'L' },
  { action: 'Afilar garras (mantener junto al sisal)', pad: 'LB', k1: 'H', k2: ';' },
  { action: 'Volver al último punto', pad: 'Y', k1: 'R', k2: 'O' },
  { action: 'Mirar a los lados', pad: 'Stick derecho', k1: 'Q / E', k2: 'U / I' },
  { action: 'Pausa', pad: 'Start', k1: 'Esc', k2: 'Esc' },
];

const GAME_KEYS = new Set(['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Comma', 'Semicolon']);
const dz = (v: number) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);

export function listPads(): Gamepad[] {
  try { return Array.from(navigator.getGamepads?.() ?? []).filter((p): p is Gamepad => !!p); } catch { return []; }
}

export class Input {
  private keys = new Set<string>();
  /** Teclas pulsadas desde el último frame: una pulsación más corta que un frame no se pierde. */
  private latched = new Set<string>();
  private padStart: Record<number, boolean> = {};
  /** Se llama al pulsar Esc o Start. */
  onPause: () => void = () => {};
  /** Se llama ante cualquier gesto del usuario (para desbloquear el audio). */
  onGesture: () => void = () => {};
  enabled = true;
  /** Si nadie usa el teclado 2, el teclado 1 también acepta flechas y Enter (juego en solitario cómodo). */
  mergeK2 = false;

  private down = (e: KeyboardEvent) => {
    this.onGesture();
    if (this.enabled && GAME_KEYS.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    this.keys.add(e.code);
    this.latched.add(e.code);
    if (e.code === 'Escape') this.onPause();
  };
  private up = (e: KeyboardEvent) => { this.keys.delete(e.code); };
  private blur = () => { this.keys.clear(); };

  attach() {
    addEventListener('keydown', this.down);
    addEventListener('keyup', this.up);
    addEventListener('blur', this.blur);
  }
  detach() {
    removeEventListener('keydown', this.down);
    removeEventListener('keyup', this.up);
    removeEventListener('blur', this.blur);
  }

  /** Botón Start de cualquier mando: pausa. Llamar una vez por frame. */
  pollPad() {
    for (const p of listPads()) {
      const st = !!p.buttons[9]?.pressed;
      if (st && !this.padStart[p.index]) this.onPause();
      this.padStart[p.index] = st;
    }
  }

  private readKeys(m: KeyMap): RawInput {
    const h = (c: string[]) => c.some((k) => this.keys.has(k) || this.latched.has(k));
    return {
      ix: (h(m.r) ? 1 : 0) - (h(m.l) ? 1 : 0), iz: (h(m.u) ? 1 : 0) - (h(m.d) ? 1 : 0), rx: (h(m.le) ? 1 : 0) - (h(m.lq) ? 1 : 0),
      run: h(m.run), jump: h(m.jump), claw: h(m.claw), throw: h(m.thr), sharpen: h(m.sharpen), dodge: h(m.dodge), back: h(m.back),
    };
  }

  /** Llamar al final de cada frame dibujado. */
  endFrame() { this.latched.clear(); }

  /** Lee el dispositivo `dev` ('k1', 'k2' o 'g<índice>'). */
  read(dev: string): RawInput {
    if (dev === 'k1' || dev === 'k2') {
      const a = this.readKeys(KEYMAPS[dev]);
      if (dev === 'k1' && this.mergeK2) {
        const b = this.readKeys(KEYMAPS.k2);
        return {
          ix: a.ix || b.ix, iz: a.iz || b.iz, rx: a.rx || b.rx, run: a.run || b.run, jump: a.jump || b.jump, claw: a.claw || b.claw,
          throw: a.throw || b.throw, sharpen: a.sharpen || b.sharpen, dodge: a.dodge || b.dodge, back: a.back || b.back,
        };
      }
      return a;
    }
    const idx = +dev.slice(1), p = listPads().find((q) => q.index === idx);
    if (!p) return { ix: 0, iz: 0, rx: 0, run: false, jump: false, claw: false, throw: false, sharpen: false, dodge: false, back: false };
    const b = (i: number) => !!p.buttons[i]?.pressed;
    let ix = dz(p.axes[0] || 0), iz = -dz(p.axes[1] || 0);
    if (b(14)) ix = -1; if (b(15)) ix = 1; if (b(12)) iz = 1; if (b(13)) iz = -1;
    return { ix, iz, rx: dz(p.axes[2] || 0), run: b(7) || b(6), jump: b(0), claw: b(1), throw: b(2), sharpen: b(4), dodge: b(5), back: b(3) };
  }
}
