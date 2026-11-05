import { CONTROLS } from '../../game/systems/Input';
import { Button } from '../components/Button';

export function ControlsScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="screen mid dim">
      <div className="card wide">
        <h2>Controles</h2>
        <div className="tablewrap">
          <table className="keys">
            <thead><tr><th>Acción</th><th>Mando</th><th>Teclado 1</th><th>Teclado 2</th></tr></thead>
            <tbody>{CONTROLS.map((c) => <tr key={c.action}><td>{c.action}</td><td>{c.pad}</td><td>{c.k1}</td><td>{c.k2}</td></tr>)}</tbody>
          </table>
        </div>
        <ul className="tips">
          <li>Si juegas solo con el teclado, el teclado 1 también acepta las flechas y Enter.</li>
          <li>Esquivar (bote) te hace intocable un instante: evita zarpazos, objetos y aspiradoras. Tarda un poco en recargarse.</li>
          <li>Trepa por los estantes saltando de balda en balda, o por el gimnasio de gatos (sisal) hasta la galería del piso alto.</li>
          <li>Caer de muy alto resta vida, te ralentiza y desde más altura te hace sangrar unos segundos.</li>
          <li>La leche cura y quita el sangrado. El pescado da velocidad ultra durante 6 segundos.</li>
          <li>Afilar garras sube tu daño y alcance (hasta nivel 3); si te derriban, pierdes un nivel.</li>
        </ul>
        <div className="row"><Button variant="go" onClick={onBack}>Volver</Button></div>
      </div>
    </section>
  );
}
