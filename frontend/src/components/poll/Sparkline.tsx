import type { VelocityPoint } from "#/lib/types";

function formatHour(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h === 0) return "now";
  return `${h}h ago`;
}

export function Sparkline({ data }: { data: VelocityPoint[] }) {
  if (data.length < 2) return null;

  const W = 300,
    H = 48,
    pad = 4;
  const max = Math.max(...data.map((d) => d.count), 1);
  const step = (W - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => ({
    x: pad + i * step,
    y: H - pad - (d.count / max) * (H - pad * 2),
  }));

  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${line} ${pts.at(-1)!.x},${H} ${pts[0].x},${H}`;

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <polyline
          points={area}
          fill="#22c55e"
          fillOpacity="0.07"
          stroke="none"
        />
        <polyline
          points={line}
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeOpacity="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between mt-1.5">
        {data.map((v, i) => (
          <span key={i} className="text-[9px] text-ink-3">
            {formatHour(v.hour)}
          </span>
        ))}
      </div>
    </div>
  );
}
