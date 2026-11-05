/** Selector de color: paleta rápida + selector libre. */
export function ColorSwatches({ label, value, presets, onChange }: { label: string; value: string; presets: string[]; onChange: (c: string) => void }) {
  return (
    <div className="colorrow">
      <label>{label}</label>
      {presets.map((c) => (
        <button key={c} className={`sw ${c.toLowerCase() === value.toLowerCase() ? 'on' : ''}`} style={{ background: c }} aria-label={`${label} ${c}`} onClick={() => onChange(c)} />
      ))}
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} personalizado`} />
    </div>
  );
}
