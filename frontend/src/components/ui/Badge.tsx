type BadgeVariant = "LIVE" | "DRAFT" | "ENDED" | "PUBLISHED" | "ANON";

const STYLES: Record<BadgeVariant, string> = {
  LIVE: "bg-green-dim text-green-acc border border-green-bar/30",
  DRAFT: "bg-white/[0.04] text-ink-3 border border-white/[0.06]",
  ENDED: "bg-white/[0.05] text-ink-2 border border-white/[0.08]",
  PUBLISHED: "bg-sky-900/40 text-sky-400 border border-sky-700/40",
  ANON: "bg-amber-900/30 text-amber-400 border border-amber-700/30",
};

const LABELS: Record<BadgeVariant, string> = {
  LIVE: "Live",
  DRAFT: "Draft",
  ENDED: "Ended",
  PUBLISHED: "Published",
  ANON: "Anon",
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${STYLES[variant]}`}
    >
      {variant === "LIVE" && (
        <span
          aria-hidden="true"
          className="w-1.25 h-1.25 rounded-full bg-green-acc animate-blink"
        />
      )}
      {LABELS[variant]}
    </span>
  );
}
