import type { ModeId } from '../../game/types';
import { Button, Choice } from '../components/Button';

export function MatchSetupScreen({ mode, humans, laps, rivals, killTarget, onLaps, onRivals, onKills, onStart, onBack }: {
  mode: ModeId; humans: number; laps: number; rivals: number; killTarget: number;
  onLaps: (n: number) => void; onRivals: (n: number) => void; onKills: (n: number) => void;
  onStart: () => void; onBack: () => void;
}) {
  return (
    <section className="screen mid dim">
      <div className="card">
        <h2>{mode === 'race' ? 'Carrera' : 'Batalla'}</h2>
        <Choice label="Gatos CPU" value={rivals} options={(humans === 1 ? [1, 3, 5, 7] : [0, 2, 4, 6]).filter((n) => humans + n <= 8)} onChange={onRivals} format={(n) => `${n}`} />
        {mode === 'race'
          ? <Choice label="Vueltas" value={laps} options={[1, 2, 3, 5]} onChange={onLaps} />
          : <Choice label="Derribos" value={killTarget} options={[3, 5, 10]} onChange={onKills} format={(n) => `${n}`} />}
        <p className="sub">
          {mode === 'race'
            ? 'Recorre el mapa y completa las vueltas. Sin límite de tiempo. Trepar es un atajo, pero una caída desde muy alto te daña, te ralentiza y te hace sangrar.'
            : 'Sin límite de tiempo: gana quien llegue primero al número de derribos. Recoge objetos, lánzalos, esquiva con un bote y afila las garras en el sisal para hacer más daño.'}
        </p>
        <div className="row"><Button variant="ghost" onClick={onBack}>Atrás</Button><span className="grow" /><Button variant="go" onClick={onStart}>¡A jugar!</Button></div>
      </div>
    </section>
  );
}
