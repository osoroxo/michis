import { useEffect, useRef } from 'react';
import { breedOf } from '../../game/config/breeds';
import { listPads } from '../../game/systems/Input';
import type { PlayerSlot } from '../../game/types';
import { Button } from '../components/Button';

export const deviceName = (d: string) => (d === 'k1' ? 'Teclado 1 (WASD)' : d === 'k2' ? 'Teclado 2 (flechas)' : `Mando ${+d.slice(1) + 1}`);

/** Lobby local: hasta 4 jugadores. Se unen con Espacio (teclado 1), Enter (teclado 2) o A (mando). */
export function PlayersScreen({ slots, onChange, onEdit, onNext, onBack }: {
  slots: PlayerSlot[];
  onChange: (s: PlayerSlot[]) => void;
  onEdit: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const ref = useRef(slots);
  ref.current = slots;
  const join = (dev: string) => {
    const s = ref.current;
    if (s.some((x) => x.dev === dev)) return;
    const i = s.findIndex((x) => !x.dev);
    if (i >= 0) onChange(s.map((x, j) => (j === i ? { ...x, dev } : x)));
  };
  const leave = (i: number) => {
    if (ref.current.filter((x) => x.dev).length <= 1) return;
    onChange(ref.current.map((x, j) => (j === i ? { ...x, dev: null } : x)));
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') { e.preventDefault(); join('k1'); }
      if (e.code === 'Enter' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); join('k2'); }
    };
    addEventListener('keydown', key);
    const prev: Record<number, boolean> = {};
    const id = setInterval(() => {
      for (const p of listPads()) {
        const a = !!p.buttons[0]?.pressed;
        if (a && !prev[p.index]) join('g' + p.index);
        prev[p.index] = a;
      }
    }, 80);
    return () => { removeEventListener('keydown', key); clearInterval(id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = slots.filter((s) => s.dev).length;
  return (
    <section className="screen mid dim">
      <div className="card wide">
        <h2>Jugadores</h2>
        <p className="sub">Para unirte pulsa <b>Espacio</b> (teclado 1), <b>Enter</b> (teclado 2) o <b>A</b> en un mando. Cada jugador elige su gato.</p>
        <div className="slots">
          {slots.map((s, i) => (
            <div key={i} className="slot" style={{ ['--pc' as string]: s.cat.accent }}>
              <b>P{i + 1}</b>
              {s.dev ? (
                <>
                  <span>{s.cat.name} · {breedOf(s.cat.breed).name}</span>
                  <span>{deviceName(s.dev)}</span>
                  <div className="row" style={{ marginTop: 'auto' }}>
                    <Button variant="ghost" onClick={() => onEdit(i)}>Editar gato</Button>
                    {active > 1 && <Button variant="ghost" onClick={() => leave(i)}>Quitar</Button>}
                  </div>
                </>
              ) : <span className="empty">Libre — pulsa para unirte</span>}
            </div>
          ))}
        </div>
        <div className="row"><Button variant="ghost" onClick={onBack}>Atrás</Button><span className="grow" /><Button variant="go" onClick={onNext}>Siguiente</Button></div>
      </div>
    </section>
  );
}
