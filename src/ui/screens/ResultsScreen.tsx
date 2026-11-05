import type { MatchResult } from '../../game/types';
import { Button } from '../components/Button';

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

export function ResultsScreen({ result, record, multi, onAgain, onMenu }: { result: MatchResult; record: boolean; multi: boolean; onAgain: () => void; onMenu: () => void }) {
  const race = result.mode === 'race';
  return (
    <section className="screen mid">
      <div className="card">
        <h2>{result.playerWon && !multi ? '¡Ganaste!' : `Gana ${result.winner}`}</h2>
        {race && <p className="sub">Tu tiempo: {fmtTime(result.raceTime)} en {result.laps} {result.laps === 1 ? 'vuelta' : 'vueltas'}{record ? ' — ¡nuevo récord!' : ''}</p>}
        <div className="tablewrap">
          <table className="res">
            <thead>
              <tr><th>#</th><th>Gato</th>{race ? <><th>Croquetas</th><th>Puesto</th><th>Total</th></> : <><th>Derribos</th><th>Caídas</th></>}</tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i} className={r.me ? 'me' : ''} style={{ ['--pc' as string]: r.color }}>
                  <td>{i + 1}</td><td><i className="dot" />{r.name}{r.me ? ' ★' : ''}</td>
                  {race ? <><td>{r.a}</td><td>+{r.b}</td><td>{r.total}</td></> : <><td>{r.a}</td><td>{r.b}</td></>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {race && <p className="sub">El puesto suma puntos extra: 25, 15, 8 y 0.</p>}
        <div className="row"><Button variant="go" onClick={onAgain}>Revancha</Button><Button variant="ghost" onClick={onMenu}>Menú</Button></div>
      </div>
    </section>
  );
}
