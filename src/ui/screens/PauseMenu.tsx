import { Button } from '../components/Button';

export function PauseMenu({ onResume, onQuit }: { onResume: () => void; onQuit: () => void }) {
  return (
    <section className="screen mid">
      <div className="card" style={{ maxWidth: 360 }}>
        <h2>Pausa</h2>
        <div className="row"><Button variant="go" onClick={onResume}>Continuar</Button><Button variant="ghost" onClick={onQuit}>Salir al menú</Button></div>
      </div>
    </section>
  );
}
