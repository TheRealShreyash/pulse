// src/components/ui/toggle.tsx
interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (val: boolean) => void
}

export function Toggle({ id, checked, onChange }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative w-8 h-[18px] rounded-full border flex-shrink-0 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc',
        checked
          ? 'bg-green-bar border-green-bar shadow-[0_0_10px_rgba(74,222,128,0.35)]'
          : 'bg-bg-3 border-white/[0.13]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-[2px] w-[13px] h-[13px] rounded-full bg-white transition-all duration-150',
          checked ? 'left-[14px]' : 'left-[2px]',
        ].join(' ')}
      />
    </button>
  )
}
