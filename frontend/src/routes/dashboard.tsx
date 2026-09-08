import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/ui/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { Poll, PollStatus } from "#/lib/types";
import { getMe } from "#/services/auth";
import { getUserPolls } from "#/services/poll";
import { getInitials } from "#/lib/utils";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const userData = await getMe();
    if (!userData) {
      throw redirect({ to: "/login", replace: true, search: {} });
    }
    return { userData };
  },
  loader: async ({ context }) => {
    const polls = await getUserPolls();
    return { polls, userData: context.userData };
  },
  component: Dashboard,
});

// helpers
function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `closes in ${h}h ${m}m` : `closes in ${m}m`;
}

function metaLine(p: Poll): string {
  const parts: string[] = [];
  if (p.totalResponses! > 0) parts.push(`${p.totalResponses} responses`);
  if (p.status === "LIVE" && p.expiresAt) parts.push(timeLeft(p.expiresAt));
  if (p.status === "ENDED") parts.push("Ended");
  if (p.status === "PUBLISHED") parts.push("Results Published");
  if (p.status === "DRAFT") parts.push("Draft");
  return parts.join(" · ");
}

function PollRow({ poll }: { poll: Poll }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(
      `${window.location.origin}/poll/${poll.id}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-white/5 bg-bg-1/80 backdrop-blur-[1px] hover:border-white/15 hover:bg-bg-2/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 ease-out hover:-translate-y-0.5">
      {/* Left content */}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-ink-1 truncate group-hover:text-white transition-colors">
          {poll.title}
        </p>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5 text-[11px]">
          <span className="text-ink-2">{metaLine(poll)}</span>
          {poll.totalResponses! > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-ink-2">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1v10M1 6h10"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              {poll.totalResponses}
            </span>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {poll.isAnonymous && <Badge variant="ANON" />}
        <Badge variant={poll.status as PollStatus} />

        {/* Copy link button */}
        {poll.status !== "DRAFT" && (
          <button
            onClick={handleCopyLink}
            className="relative p-1.5 rounded-md text-ink-2 hover:text-green-400 hover:bg-white/5 transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Copy poll link"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7L5 10L12 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect
                  x="3"
                  y="2"
                  width="8"
                  height="4"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                />
                <path
                  d="M4 6h6v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                />
              </svg>
            )}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {copied ? "Copied!" : "Copy link"}
            </span>
          </button>
        )}

        {/* Analytics icon */}
        {(poll.status === "LIVE" || poll.status === "ENDED") && (
          <Link
            to="/analytics/$pollId"
            params={{ pollId: poll.id }}
            className="p-1.5 rounded-md text-ink-2 hover:text-white hover:bg-white/5 transition-all duration-150 opacity-0 group-hover:opacity-100"
            aria-label="Analytics"
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <rect
                x="1"
                y="8"
                width="3"
                height="6"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="6"
                y="5"
                width="3"
                height="9"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="11"
                y="2"
                width="3"
                height="12"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </Link>
        )}

        {/* View poll link */}
        {poll.status !== "DRAFT" && (
          <Link
            to="/poll/$pollId"
            params={{ pollId: poll.id }}
            className="p-1.5 rounded-md text-ink-2 hover:text-white hover:bg-white/5 transition-all duration-150 opacity-0 group-hover:opacity-100"
            aria-label="View poll"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M9 1h4m0 0v4m0-4L6 8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { polls, userData } = Route.useLoaderData();
  const liveCount = polls.filter((p) => p.status === "LIVE").length;

  return (
    <div className="min-h-screen bg-bg-0 bg-grid relative">
      {/* faint top glow, echoing the landing hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 w-175 h-100 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)",
        }}
      />

      <TopBar
        showAvatar
        initials={getInitials(userData.name)}
        right={
          <Link to="/create">
            <Button variant="accent" size="sm">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1v10M1 6h10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              New poll
            </Button>
          </Link>
        }
      />

      <main className="relative max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-7 flex items-baseline justify-between">
          <div>
            <p className="text-[10px] font-mono font-medium text-green-acc uppercase tracking-widest mb-1">
              Dashboard
            </p>
            <h1 className="text-[22px] font-bold text-ink-1 tracking-tight">
              Your polls
            </h1>
            {liveCount > 0 && (
              <p className="text-[12px] font-mono text-ink-2 mt-1 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                {liveCount} live poll{liveCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <p className="text-[11px] font-mono text-ink-2 tabular-nums">
            {polls.length} total
          </p>
        </div>

        {polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-green-dim to-transparent border border-green-bar/15 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.08)]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="text-green-acc"
              >
                <path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <p className="text-[14px] text-ink-1 font-medium">No polls yet</p>
            <p className="text-[12px] text-ink-2 max-w-55">
              Create your first poll and share it with the world.
            </p>
            <Link to="/create">
              <Button variant="accent" className="mt-2">
                Create poll →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {polls.map((p, i) => (
              <div
                key={p.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <PollRow poll={p} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
