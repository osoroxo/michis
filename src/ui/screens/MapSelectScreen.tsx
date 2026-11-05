import { MAPS } from '../../game/maps';
import type { MapId } from '../../game/types';
import { Button } from '../components/Button';

/** Elige el escenario. Al pulsar una tarjeta se previsualiza de fondo. */
export function MapSelectScreen({ mapId, onPick, onNext, onBack }: { mapId: MapId; onPick: (m: MapId) => void; onNext: () => void; onBack: () => void }) {
  return (
    <section className="screen mid dim">
      <div className="card wide">
        <h2>Elige el mapa</h2>
        <div className="maps">
          {MAPS.map((m) => (
            <button key={m.id} className={`mapcard ${m.id === mapId ? 'on' : ''}`} onClick={() => onPick(m.id)}>
              <i>{m.icon}</i><b>{m.name}</b><span>{m.blurb}</span>
            </button>
          ))}
        </div>
        <div className="row"><Button variant="ghost" onClick={onBack}>Atrás</Button><span className="grow" /><Button variant="go" onClick={onNext}>Siguiente</Button></div>
      </div>
    </section>
  );
}
