import { useEffect, useMemo, useState } from 'react';
import { Backdrop } from './ui/Backdrop';
import { GameView } from './ui/GameView';
import { CatCreatorScreen } from './ui/screens/CatCreatorScreen';
import { ControlsScreen } from './ui/screens/ControlsScreen';
import { MatchSetupScreen } from './ui/screens/MatchSetupScreen';
import { MapSelectScreen } from './ui/screens/MapSelectScreen';
import { ModeSelectScreen } from './ui/screens/ModeSelectScreen';
import { PlayersScreen } from './ui/screens/PlayersScreen';
import { TitleScreen } from './ui/screens/TitleScreen';
import type { CatSpec, MatchConfig, MatchResult, ModeId, PlayerSlot } from './game/types';
import { defaultProfile, loadProfile, saveProfile, type Profile } from './services/profile';

type Screen = 'title' | 'controls' | 'mode' | 'map' | 'cat' | 'players' | 'setup' | 'play';

/** Opciones válidas de CPU según cuántos humanos juegan (máximo 8 gatos en total). */
const rivalOptions = (humans: number) => (humans === 1 ? [1, 3, 5, 7] : [0, 2, 4, 6]).filter((n) => humans + n <= 8);

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>('title');
  const [mode, setMode] = useState<ModeId>('race');
  const [editSlot, setEditSlot] = useState(0);
  const [fromPlayers, setFromPlayers] = useState(false);
  const [matchId, setMatchId] = useState(0);
  const [record, setRecord] = useState(false);

  useEffect(() => { void loadProfile().then((p) => { setProfile(p); setLoaded(true); }); }, []);

  const update = (p: Partial<Profile>) => setProfile((prev) => {
    const next = { ...prev, ...p };
    if (loaded) void saveProfile(next);
    return next;
  });
  const humans = profile.players.filter((s) => s.dev);

  // Una nueva config (identidad distinta) crea una partida nueva; `matchId` fuerza la revancha.
  const config: MatchConfig = useMemo(() => {
    const act = profile.players.filter((s): s is PlayerSlot & { dev: string } => !!s.dev);
    const opts = rivalOptions(act.length);
    const rivals = opts.includes(profile.rivals) ? profile.rivals : opts[opts.length - 1];
    return { mode, mapId: profile.mapId, players: act, laps: profile.laps, killTarget: profile.killTarget, rivals };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const start = () => { setRecord(false); setMatchId((n) => n + 1); setScreen('play'); };

  const onFinish = (r: MatchResult) => {
    if (r.mode !== 'race' || humans.length !== 1) return;
    const key = `${profile.mapId}:${r.laps}`, best = profile.records[key];
    if (best === undefined || r.raceTime < best) {
      setRecord(best !== undefined);
      update({ records: { ...profile.records, [key]: r.raceTime } });
    }
  };

  const setCat = (cat: CatSpec) => update({ players: profile.players.map((s, i) => (i === editSlot ? { ...s, cat } : s)) });
  const editing = profile.players[editSlot];
  const backdrop = screen === 'title' || screen === 'controls' || screen === 'mode' || screen === 'map' || screen === 'setup';
  return (
    <>
      {backdrop && <Backdrop mapId={profile.mapId} />}
      {screen === 'title' && <TitleScreen onPlay={() => setScreen('mode')} onControls={() => setScreen('controls')} />}
      {screen === 'controls' && <ControlsScreen onBack={() => setScreen('title')} />}
      {screen === 'mode' && <ModeSelectScreen onPick={(m) => { setMode(m); setEditSlot(0); setFromPlayers(false); setScreen('map'); }} onBack={() => setScreen('title')} />}
      {screen === 'map' && <MapSelectScreen mapId={profile.mapId} onPick={(mapId) => update({ mapId })} onNext={() => setScreen('cat')} onBack={() => setScreen('mode')} />}
      {screen === 'cat' && (
        <CatCreatorScreen
          title={`Gato de P${editSlot + 1}`} spec={editing.cat} onChange={setCat}
          onNext={() => setScreen('players')} onBack={() => setScreen(fromPlayers ? 'players' : 'map')}
        />
      )}
      {screen === 'players' && (
        <PlayersScreen
          slots={profile.players} onChange={(players) => update({ players })}
          onEdit={(i) => { setEditSlot(i); setFromPlayers(true); setScreen('cat'); }}
          onNext={() => setScreen('setup')} onBack={() => setScreen('cat')}
        />
      )}
      {screen === 'setup' && (
        <MatchSetupScreen
          mode={mode} humans={humans.length} laps={profile.laps}
          rivals={rivalOptions(humans.length).includes(profile.rivals) ? profile.rivals : rivalOptions(humans.length).slice(-1)[0]}
          killTarget={profile.killTarget}
          onLaps={(laps) => update({ laps })} onRivals={(rivals) => update({ rivals })} onKills={(killTarget) => update({ killTarget })}
          onStart={start} onBack={() => setScreen('players')}
        />
      )}
      {screen === 'play' && <GameView config={config} onFinish={onFinish} onAgain={start} onMenu={() => setScreen('title')} isRecord={record} />}
    </>
  );
}
