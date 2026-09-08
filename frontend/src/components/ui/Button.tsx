// src/components/ui/button.tsx
import { type ButtonHTMLAttributes } from 'react'

type Variant = 'ghost' | 'primary' | 'accent' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANTS: Record<Variant, string> = {
  ghost:
    'bg-transparent border border-white/[0.13] text-ink-2 hover:text-ink-1 hover:border-white/20 hover:bg-white/[0.04]',
  primary:
    'bg-white/[0.06] border border-white/[0.13] text-ink-1 hover:bg-white/10 hover:border-white/20',
  accent:
    'bg-green-dim border border-green-bar/40 text-green-acc shadow-[0_0_0_0_rgba(74,222,128,0)] hover:bg-green-dimhover hover:border-green-bar/60 hover:shadow-[0_4px_16px_rgba(74,222,128,0.18)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]',
  danger:
    'bg-transparent border border-red-900/60 text-red-400 hover:bg-red-900/20',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12px] rounded-md',
  md: 'px-4 py-2   text-[13px] rounded-lg',
}

export function Button({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center gap-2 font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
