import { useEffect, useRef } from 'react';
import type { GameEngine } from '../../game/GameEngine';

const W = 340, H = 240;

/** Minimapa de las dos plantas: lo bajo en color, lo alto como capa clara; los gatos del piso alto son redondos. */
export function Minimap({ engine, pos }: { engine: GameEngine; pos: 'top' | 'bottom' | 'center' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, g = cv.getContext('2d')!;
    const m0 = engine.minimap(), v = m0.view;
    const mx = (x: number) => ((x - v.x0) / (v.x1 - v.x0)) * W, mz = (z: number) => ((z - v.z0) / (v.z1 - v.z0)) * H;
    const rect = (b: CanvasRenderingContext2D, k: { x0: number; x1: number; z0: number; z1: number }) =>
      b.fillRect(mx(k.x0), mz(k.z0), Math.max(2, ((k.x1 - k.x0) / (v.x1 - v.x0)) * W), Math.max(2, ((k.z1 - k.z0) / (v.z1 - v.z0)) * H));
    const base = document.createElement('canvas');
    base.width = W; base.height = H;
    const b = base.getContext('2d')!;
    b.fillStyle = '#2a2238'; b.fillRect(0, 0, W, H);
    const cols = [...m0.colliders].sort((p, q) => p.y1 - q.y1);
    for (const k of cols) {
      if (k.y0 >= 6.5) b.fillStyle = k.y1 - k.y0 <= 1.2 ? 'rgba(230,215,190,.22)' : k.climb ? 'rgba(217,178,106,.9)' : 'rgba(255,255,255,.4)';
      else b.fillStyle = k.climb ? '#d9b26a' : k.y1 > 6 ? '#8a7fa0' : '#4a4060';
      rect(b, k);
    }
    const draw = () => {
      g.drawImage(base, 0, 0);
      for (const c of engine.minimap().cats) {
        const r = c.me ? 8 : 6, up = c.y > 5;
        g.fillStyle = c.color; g.strokeStyle = c.me ? '#fff' : '#0f0b16'; g.lineWidth = 3;
        if (up) { g.beginPath(); g.arc(mx(c.x), mz(c.z), r, 0, Math.PI * 2); g.fill(); g.stroke(); }
        else { g.fillRect(mx(c.x) - r, mz(c.z) - r, r * 2, r * 2); g.strokeRect(mx(c.x) - r, mz(c.z) - r, r * 2, r * 2); }
      }
    };
    draw();
    const id = setInterval(draw, 100);
    return () => clearInterval(id);
  }, [engine]);
  return <canvas ref={ref} className={`minimap ${pos}`} width={W} height={H} />;
}
