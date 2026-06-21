interface HoneypotFieldProps {
  value: string
  onChange: (value: string) => void
}

export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
    >
      <label htmlFor="middle_name">Nombre del medio</label>
      <input
        id="middle_name"
        name="middle_name"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}
