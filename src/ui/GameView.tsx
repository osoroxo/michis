import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { HudFrame, MatchConfig, MatchResult } from '../game/types';
import { Hud } from './hud/Hud';
import { Minimap } from './hud/Minimap';
import { PauseMenu } from './screens/PauseMenu';
import { ResultsScreen } from './screens/ResultsScreen';

/** Monta una partida: el motor dibuja en el lienzo y React pinta HUD, pausa y resultados encima. */
export function GameView({ config, onFinish, onAgain, onMenu, isRecord }: {
  config: MatchConfig;
  onFinish: (r: MatchResult) => void;
  onAgain: () => void;
  onMenu: () => void;
  isRecord: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [frame, setFrame] = useState<HudFrame | null>(null);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    const e = new GameEngine(host.current!, config, {
      onHud: setFrame,
      onPause: setPaused,
      onEnd: (r) => { setResult(r); finishRef.current(r); },
    });
    setEngine(e);
    let off = () => {};
    if (import.meta.env.DEV) {
      // Puente de pruebas (solo desarrollo): un evento DOM ejecuta código sobre el motor y deja el resultado en data-sim.
      (window as unknown as { __engine?: GameEngine }).__engine = e;
      const h = (ev: Event) => {
        const code = (ev as CustomEvent<string>).detail;
        try { document.body.dataset.sim = JSON.stringify(new Function('e', code)(e)); } catch (err) { document.body.dataset.sim = JSON.stringify({ error: String(err) }); }
      };
      window.addEventListener('michi-debug', h);
      off = () => window.removeEventListener('michi-debug', h);
    }
    return () => { off(); e.dispose(); setEngine(null); };
  }, [config]);

  return (
    <>
      <div className="stage" ref={host} />
      {engine && frame && (
        <div className="layer">
          {frame.views.map((v, i) => <Hud key={i} view={v} board={frame.views.length === 1} />)}
          <Minimap engine={engine} pos={frame.minimap} />
        </div>
      )}
      {paused && engine && <PauseMenu onResume={() => engine.setPaused(false)} onQuit={onMenu} />}
      {result && <ResultsScreen result={result} record={isRecord} multi={config.players.length > 1} onAgain={onAgain} onMenu={onMenu} />}
    </>
  );
}
