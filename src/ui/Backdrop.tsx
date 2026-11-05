import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { MapId } from '../game/types';



/** Fondo de los menús: gatos CPU corriendo por la casa con cámara orbital. */
export function Backdrop({ mapId }: { mapId: MapId }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cfg = { mode: 'race' as const, mapId, players: [], laps: 99, killTarget: 99, rivals: 6, attract: true };
    const e = new GameEngine(host.current!, cfg, { onHud: () => {}, onPause: () => {}, onEnd: () => {} });
    return () => e.dispose();
  }, [mapId]);
  return <div className="stage" ref={host} />;
}
