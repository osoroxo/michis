import type { ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'go' | 'ghost' | 'sel';

/** Botón de bloque duro. `variant` cambia el color; `sel` marca una opción elegida. */
export function Button({ variant = 'default', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const cls = variant === 'default' ? '' : variant;
  return <button {...p} className={`${cls} ${className}`.trim()} onClick={(e) => { p.onClick?.(e); e.currentTarget.blur(); }} />;
}

/** Fila de opciones numéricas (vueltas, rivales, derribos). */
export function Choice<T extends number>({ label, value, options, onChange, format }: { label: string; value: T; options: T[]; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <div className="row">
      <span style={{ minWidth: 110, fontWeight: 900 }}>{label}</span>
      {options.map((o) => <Button key={o} variant={o === value ? 'sel' : 'ghost'} onClick={() => onChange(o)}>{format ? format(o) : o}</Button>)}
    </div>
  );
}
