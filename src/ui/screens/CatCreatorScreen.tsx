import { ACCENT_PRESETS, BREEDS, FUR_PRESETS, breedOf } from '../../game/config/breeds';
import type { BreedId, CatSpec } from '../../game/types';
import { Button } from '../components/Button';
import { CatPreview } from '../components/CatPreview';
import { ColorSwatches } from '../components/ColorSwatches';
import { StatBar } from '../components/StatBar';

function BreedCard({ id, selected, onPick }: { id: BreedId; selected: boolean; onPick: () => void }) {
  const b = breedOf(id), s = b.stats;
  return (
    <button className={`breed ${selected ? 'on' : ''}`} onClick={onPick}>
      <b>{b.name}</b>
      <span className="stats">
        <StatBar label="VEL" mul={s.speed} /><StatBar label="SALTO" mul={s.jump} /><StatBar label="VIDA" mul={s.hp} /><StatBar label="GARRA" mul={s.claw} />
      </span>
      <span className="d">{b.blurb}</span>
    </button>
  );
}

export function CatCreatorScreen({ title = 'Tu gato', spec, onChange, onNext, onBack }: { title?: string; spec: CatSpec; onChange: (s: CatSpec) => void; onNext: () => void; onBack: () => void }) {
  const set = (p: Partial<CatSpec>) => onChange({ ...spec, ...p });
  const pickBreed = (id: BreedId) => set({ breed: id, ...breedOf(id).defaults });
  const reset = () => set(breedOf(spec.breed).defaults);
  return (
    <section className="screen mid dim">
      <div className="card wide">
        <h2>{title}</h2>
        <div className="creator">
          <div className="colors">
            <CatPreview spec={spec} />
            <input type="text" maxLength={9} value={spec.name} onChange={(e) => set({ name: e.target.value })} aria-label="Nombre" placeholder="Nombre" />
            <ColorSwatches label="Pelaje" value={spec.body} presets={FUR_PRESETS} onChange={(c) => set({ body: c })} />
            <ColorSwatches label="Manchas" value={spec.patch} presets={FUR_PRESETS} onChange={(c) => set({ patch: c })} />
            <ColorSwatches label="Collar" value={spec.accent} presets={ACCENT_PRESETS} onChange={(c) => set({ accent: c })} />
            <div className="row"><Button variant="ghost" onClick={reset}>Colores de la raza</Button></div>
          </div>
          <div className="breeds">
            {BREEDS.map((b) => <BreedCard key={b.id} id={b.id} selected={b.id === spec.breed} onPick={() => pickBreed(b.id)} />)}
          </div>
        </div>
        <div className="row"><Button variant="ghost" onClick={onBack}>Atrás</Button><span className="grow" /><Button variant="go" onClick={onNext}>Siguiente</Button></div>
      </div>
    </section>
  );
}
