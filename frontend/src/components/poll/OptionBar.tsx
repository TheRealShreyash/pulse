// src/components/poll/OptionBar.tsx
// Selectable option row on the respondent poll page.
// Before voting  → clean tap target, no fill shown.
// After voting   → animated fill bar + percentage appears.

interface OptionBarProps {
  label: string
  pct: number
  hasVoted: boolean
  isSelected: boolean
  disabled: boolean
  onClick: () => void
}

export function OptionBar({
  label,
  pct,
  hasVoted,
  isSelected,
  disabled,
  onClick,
}: OptionBarProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      className={[
        'relative w-full text-left rounded-lg border overflow-hidden',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc',
        isSelected
          ? 'border-green-acc shadow-[0_0_0_1px_rgba(74,222,128,0.15),0_4px_16px_rgba(74,222,128,0.1)]'
          : 'border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.02]',
        disabled && !hasVoted
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer',
      ].join(' ')}
    >
      {/* Animated fill — only after voting */}
      {hasVoted && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 rounded-lg bar-transition"
          style={{
            width: `${pct}%`,
            background: isSelected
              ? 'rgba(74,222,128,0.14)'
              : 'rgba(255,255,255,0.04)',
          }}
        />
      )}

      <span className="relative z-10 flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] text-ink-1">
          {isSelected && (
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden="true"
              className="text-green-acc flex-shrink-0"
            >
              <path
                d="M2 6.5L5.5 10L11 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {label}
        </span>
        {hasVoted && (
          <span
            className={`text-[12px] font-mono font-medium tabular-nums ${isSelected ? 'text-green-acc' : 'text-ink-2'}`}
          >
            {pct}%
          </span>
        )}
      </span>
    </button>
  )
}
