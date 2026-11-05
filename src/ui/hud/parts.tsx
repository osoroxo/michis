import type { HudState } from '../../game/types';

/** Piezas pequeñas del HUD. Cada una recibe solo lo que dibuja. */

export function HealthBar({ hp, hpMax }: { hp: number; hpMax: number }) {
  const pct = Math.max(0, Math.min(100, (hp / hpMax) * 100));
  return (
    <div className={`hpbar ${pct < 30 ? 'low' : ''}`}>
      <i style={{ width: `${pct}%` }} />
      <span>{hp} / {hpMax}</span>
    </div>
  );
}

export function StatusBadges({ slow, bleeding }: Pick<HudState, 'slow' | 'bleeding'>) {
  return (
    <div className="badges">
      {slow && <span className="badge slow">LENTO</span>}
      {bleeding && <span className="badge bleed">SANGRANDO</span>}
    </div>
  );
}

export function SpeedTiers({ tier }: { tier: number }) {
  return (
    <div className="tiers">
      <span className={`tier ${tier === 1 ? 'on' : ''}`}>CAMINA</span>
      <span className={`tier ${tier === 2 ? 'on' : ''}`}>CORRE</span>
      <span className={`tier ultra ${tier === 3 ? 'on' : ''}`}>ULTRA</span>
    </div>
  );
}

export function BallPips({ balls, max }: { balls: number; max: number }) {
  return <div className="pips" title="Bolas de pelo">{Array.from({ length: max }, (_, i) => <i key={i} className={`pip ${i < balls ? 'on' : ''}`} />)}</div>;
}

export function JumpPips({ left }: { left: number }) {
  return <div className="pips" title="Saltos">{[0, 1].map((i) => <i key={i} className={`pip jump ${i < left ? 'on' : ''}`} />)}</div>;
}

export function ClawLevel({ level, max }: { level: number; max: number }) {
  return (
    <div className="pips" title="Nivel de garras">
      {Array.from({ length: max }, (_, i) => <i key={i} className={`claw ${i < level ? `on l${level}` : ''}`} />)}
    </div>
  );
}

export function UltraBar({ value }: { value: number }) {
  return <div className="fishbar"><i style={{ width: `${Math.max(0, value) * 100}%` }} /></div>;
}

export function DodgeBar({ value }: { value: number }) {
  return <div className="dodgebar" title="Esquiva"><span>ESQUIVA</span><i style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} className={value >= 1 ? 'ready' : ''} /></div>;
}

export function SharpenBar({ value }: { value: number }) {
  return value > 0 ? <div className="sharpen"><i style={{ width: `${value * 100}%` }} /></div> : null;
}

export function Scoreboard({ rows }: { rows: HudState['rows'] }) {
  return (
    <div className="panel board">
      {rows.map((r, i) => (
        <div key={i} className={r.me ? 'me' : ''} style={{ ['--c' as string]: r.color }}>
          <span>{i + 1}. {r.name}</span><span>{r.value} <span className="x">{r.extra}</span></span>
        </div>
      ))}
    </div>
  );
}
