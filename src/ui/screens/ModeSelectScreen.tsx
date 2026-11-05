import type { ModeId } from '../../game/types';
import { Button } from '../components/Button';

const MODES: Array<{ id: ModeId; icon: string; name: string; text: string }> = [
  { id: 'race', icon: '🏁', name: 'Carrera', text: 'Vueltas por la casa grande. Recoge croquetas, trepa atajos, esquiva aspiradoras y gana puestos. Sin límite de tiempo.' },
  { id: 'battle', icon: '⚔️', name: 'Batalla', text: 'Arena libre con muchos objetos para lanzar: floreros, libros, latas, ovillos. Afila tus garras y llega primero a los derribos.' },
];

export function ModeSelectScreen({ onPick, onBack }: { onPick: (m: ModeId) => void; onBack: () => void }) {
  return (
    <section className="screen mid dim">
      <div className="card wide">
        <h2>Elige modo</h2>
        <div className="modes">
          {MODES.map((m) => (
            <button key={m.id} className="mode" onClick={() => onPick(m.id)}>
              <i>{m.icon}</i><b>{m.name}</b><span>{m.text}</span>
            </button>
          ))}
        </div>
        <div className="row"><Button variant="ghost" onClick={onBack}>Atrás</Button></div>
      </div>
    </section>
  );
}
