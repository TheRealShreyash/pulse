import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../../components/ui/TopBar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LiveDot } from "../../components/poll/LiveDot";
import { AnalyticsBar } from "../../components/poll/AnalyticsBar";
import { Sparkline } from "../../components/poll/Sparkline";
import { usePollSocket } from "#/hooks/usePollSocket";
import { type AnalyticsPoll } from "#/lib/types";
import { closePoll, getPoll, publishPoll } from "#/services/poll";
import { authenticate } from "#/services/auth";

export const Route = createFileRoute("/analytics/$pollId")({
  beforeLoad: async () => {
    const isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        replace: true,
        search: {},
      });
    }
  },
  loader: async ({ params }) => {
    const data = await getPoll(params.pollId);
    return data;
  },
  component: AnalyticsPage,
});

function calcPcts(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  return counts.map((c) => Math.round((c / total) * 100));
}

function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg-2 rounded-lg px-3 py-2.5">
      <p className="text-[20px] font-medium text-ink-1 tabular-nums">{value}</p>
      <p className="text-[11px] text-ink-2 mt-0.5">{label}</p>
    </div>
  );
}

function AnalyticsPage() {
  const { pollId } = Route.useParams();
  const initialData = Route.useLoaderData();
  const shareUrl = `${window.location.origin}/poll/${initialData.id}`;

  const [data, setData] = useState<AnalyticsPoll>(initialData);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = data.status === "LIVE";
  const isPublished = data.status === "PUBLISHED";
  const isClosed = data.status === "ENDED";
  const counts = data.options.map((o) => o.count);
  const pcts = calcPcts(counts);
  const leadingIdx = pcts.indexOf(Math.max(...pcts));

  // socket handlers
  usePollSocket({
    pollId,
    enabled: isActive,
    onVoteUpdate: ({ counts: newCounts, total }) => {
      setData((prev) => ({
        ...prev,
        options: prev.options.map((o, i) => ({ ...o, count: newCounts[i] })),
        totalResponses: total,
      }));
    },
    onPollClosed: () => {
      setData((prev) => ({ ...prev, status: "ENDED" }));
    },
  });

  // actions
  async function handlePublish() {
    setPublishing(true);
    try {
      await publishPoll(data.id);
      setData((d) => ({ ...d, status: "PUBLISHED" }));
    } finally {
      setPublishing(false);
    }
  }

  async function handleClose() {
    setClosing(true);
    try {
      await closePoll(data.id);
      setData((d) => ({ ...d, status: "ENDED" }));
    } finally {
      setClosing(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <TopBar
        backTo="/dashboard"
        title="Analytics"
        right={
          <div className="flex items-center gap-2">
            {isActive && <Badge variant="LIVE" />}
            {isPublished && <Badge variant="PUBLISHED" />}
            {isClosed && !isPublished && <Badge variant="ENDED" />}
          </div>
        }
      />

      <main className="max-w-2xl mx-auto px-4 py-8 animate-slide-up">
        {/* Title + share link */}
        <div className="mb-6">
          <h1 className="text-[16px] font-medium text-ink-1 leading-snug mb-2">
            {data.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-3">
            <span>{shareUrl}</span>
            <button
              onClick={handleCopy}
              className="text-green-acc hover:text-green-bar transition-colors"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            {data.isAnonymous && <span>· Anonymous</span>}
            {isActive && data.expiresAt && (
              <span>· {timeLeft(data.expiresAt)}</span>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-7">
          <StatCard value={String(data.totalResponses)} label="Responses" />
          <StatCard value={`${pcts[leadingIdx]}%`} label="Top option" />
          <StatCard
            value={
              isActive && data.expiresAt
                ? timeLeft(data.expiresAt).replace(" remaining", "")
                : "—"
            }
            label="Time left"
          />
        </div>

        {/* Breakdown */}
        <section className="mb-7 space-y-3.5">
          <p className="text-[10px] font-medium text-ink-2 uppercase tracking-widest">
            Breakdown
          </p>
          {data.options.map((opt, i) => (
            <AnalyticsBar
              key={opt.id}
              label={opt.text}
              count={opt.count}
              pct={pcts[i]}
              isLeading={i === leadingIdx}
            />
          ))}
        </section>

        {/* Velocity chart */}
        <section className="mb-8">
          <p className="text-[10px] font-medium text-ink-2 uppercase tracking-widest mb-3">
            Response velocity
          </p>
          <div className="bg-bg-2 rounded-lg p-4">
            <Sparkline data={data.velocity} />
          </div>
        </section>

        {/* Actions footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.07]">
          <div>
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={closing}
              >
                {closing ? "Closing…" : "Close poll"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isActive && (
              <span className="text-[11px] text-ink-3 flex items-center gap-1.5">
                <LiveDot />
                Live updates
              </span>
            )}

            {isClosed && !isPublished && (
              <Button
                variant="accent"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? "Publishing…" : "Publish results"}
              </Button>
            )}

            {isPublished && (
              <span className="text-[12px] text-ink-2 flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7L5 10L11 3"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Results published
              </span>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
