/** Barra de estadística 0..1 (con 1 = multiplicador base 1.0 en la mitad). */
export function StatBar({ label, mul }: { label: string; mul: number }) {
  const pct = Math.max(8, Math.min(100, ((mul - 0.6) / 0.9) * 100));
  return (
    <>
      <span>{label}</span>
      <span className="bar"><i style={{ width: `${pct}%` }} /></span>
    </>
  );
}
