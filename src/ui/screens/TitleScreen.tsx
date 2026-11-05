import { Button } from '../components/Button';
import { canQuit, quitApp } from '../../services/profile';

export function TitleScreen({ onPlay, onControls }: { onPlay: () => void; onControls: () => void }) {
  return (
    <section className="screen mid">
      <div className="card">
        <h1>Michi Rally</h1>
        <p className="sub">Gatos sueltos por la casa. Corre, trepa, doble salto, afila tus garras y lanza todo lo que encuentres. Elige tu raza y tu color.</p>
        <div className="row">
          <Button variant="go" onClick={onPlay}>Jugar</Button>
          <Button variant="ghost" onClick={onControls}>Controles</Button>
          {canQuit() && <Button variant="ghost" onClick={() => void quitApp()}>Salir</Button>}
        </div>
      </div>
    </section>
  );
}
