import type { HudView } from '../../game/types';
import { BallPips, ClawLevel, DodgeBar, HealthBar, JumpPips, Scoreboard, SharpenBar, SpeedTiers, StatusBadges, UltraBar } from './parts';

/** HUD de la vista de un jugador. Va dentro del rectángulo de su pantalla (dividida si hay varios). */
export function Hud({ view, board }: { view: HudView; board: boolean }) {
  const { hud, rect, color, name } = view;
  const race = hud.mode === 'race';
  const compact = rect.h < 420 || rect.w < 560;
  return (
    <div className={`viewbox ${compact ? 'compact' : ''}`} style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, ['--pc' as string]: color }}>
      <div className="panel tl">
        <span className="pos">{hud.position}º<small>/{hud.total}</small></span>
        <span className="who">{name}</span>
      </div>
      <div className="panel tr">
        <span className="score">
          {race ? <i className="kib" /> : <span>☠</span>}
          <span>{hud.score}</span>
          {!race && <small>/ {hud.killTarget}</small>}
        </span>
      </div>
      {board && <Scoreboard rows={hud.rows} />}
      <div className="panel bl">
        {race && <span className="lap">Vuelta {hud.lap}/{hud.laps}</span>}
        <SpeedTiers tier={hud.tier} />
        <div className="row" style={{ gap: 8 }}><JumpPips left={hud.jumpsLeft} /><DodgeBar value={hud.dodge} /></div>
      </div>
      <div className="panel bc">
        <HealthBar hp={hud.hp} hpMax={hud.hpMax} />
        <StatusBadges slow={hud.slow} bleeding={hud.bleeding} />
        <SharpenBar value={hud.sharpen} />
      </div>
      <div className="panel br">
        {hud.held && <span className="held">🎒 {hud.held}</span>}
        <BallPips balls={hud.balls} max={hud.ballMax} />
        <ClawLevel level={hud.clawLevel} max={hud.clawMax} />
        <UltraBar value={hud.ultra} />
      </div>
      {hud.msg && <div className="msg">{hud.msg}</div>}
      {hud.down > 0 && <div className="downmsg"><div className="big" style={{ fontSize: 'clamp(24px,6vmin,56px)' }}>Reapareces en {Math.ceil(hud.down)}</div></div>}
      {hud.countdown && <div className="big">{hud.countdown}</div>}
    </div>
  );
}
