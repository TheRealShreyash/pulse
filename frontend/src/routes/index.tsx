import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { TopBar } from "../components/ui/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { Poll, PollStatus } from "#/lib/types";
import { authenticate, getUserInfo } from "#/services/auth";
import { getUserPolls } from "#/services/poll";
import { getInitials } from "#/lib/utils";

export const Route = createFileRoute("/")({
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
  loader: async () => {
    const polls = await getUserPolls();
    const userData = await getUserInfo();
    return { polls, userData };
  },
  component: Dashboard,
});

// ── helpers ───────────────────────────────────────────────────────────────────

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

// ── poll row ─────────────────────────────────────────────────────────────────

function PollRow({ poll }: { poll: Poll }) {
  return (
    <div className="group flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-white/[0.07] bg-bg-1 hover:border-white/13 hover:bg-bg-2 transition-all duration-150">
      {/* Left */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink-1 truncate">
          {poll.title}
        </p>
        <p className="text-[11px] text-ink-3 mt-0.5">{metaLine(poll)}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {poll.isAnonymous && <Badge variant="ANON" />}
        <Badge variant={poll.status as PollStatus} />

        {/* Analytics icon — live or closed */}
        {(poll.status === "LIVE" || poll.status === "ENDED") && (
          <Link
            to="/analytics/$pollId"
            params={{ pollId: poll.id }}
            aria-label="Analytics"
            className="text-ink-3 hover:text-ink-1 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden="true"
            >
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

        {/* Share link */}
        {poll.status !== "DRAFT" && (
          <Link
            to="/poll/$pollId"
            params={{ pollId: poll.id }}
            aria-label="View poll"
            className="text-ink-3 hover:text-ink-1 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M9 1h4m0 0v4m0-4L6 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
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
    <>
      <TopBar
        showAvatar
        initials={getInitials(userData.data.name)}
        right={
          <Link to="/create">
            <Button variant="accent" size="sm">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
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

      <main className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-[15px] font-medium text-ink-1">Your polls</h1>
          {liveCount > 0 && (
            <p className="text-[12px] text-ink-3 mt-1">
              {liveCount} poll{liveCount > 1 ? "s" : ""} currently live
            </p>
          )}
        </div>

        {polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="text-[14px] text-ink-2">No polls yet</p>
            <p className="text-[12px] text-ink-3">
              Create your first poll to get started
            </p>
            <Link to="/create">
              <Button variant="accent">New poll</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {polls.map((p) => (
              <PollRow key={p.id} poll={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
