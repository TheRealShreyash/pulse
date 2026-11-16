import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { TopBar } from "../components/ui/TopBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import SwipeRow from "../components/ui/SwipeRow";
import { HugeiconsIcon } from "@hugeicons/react";
import { Archive02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import type { Poll, PollStatus } from "#/lib/types";
import { getMe } from "#/services/auth";
import { getUserPolls, deletePoll } from "#/services/poll";

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

function ActionTooltip({
  text,
  show,
  children,
}: {
  text: string;
  show?: boolean;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isVisible = Boolean(show || hovered);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 6,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const handleMouseEnter = () => {
    updateCoords();
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  useLayoutEffect(() => {
    if (isVisible) {
      updateCoords();
    }
  }, [isVisible, text]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center justify-center cursor-pointer"
    >
      {children}
      {isVisible &&
        coords &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 99999,
            }}
            className="pointer-events-none bg-neutral-900/95 border border-white/15 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-2xl whitespace-nowrap animate-fade-in"
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  );
}

function PollRow({ poll }: { poll: Poll }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(
      `${window.location.origin}/poll/${poll.slug ?? poll.id}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCardClick = () => {
    if (poll.status === "DRAFT") {
      navigate({ to: "/create" });
    } else {
      navigate({
        to: "/analytics/$pollId",
        params: { pollId: poll.id },
      });
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 py-2 sm:py-0 min-w-0 select-none cursor-grab active:cursor-grabbing">
      {/* Top tier on mobile / left on desktop: Title + Meta (Draggable from anywhere) */}
      <div
        onClick={handleCardClick}
        className="min-w-0 flex-1 block focus:outline-none select-none cursor-grab active:cursor-grabbing"
      >
        <p className="text-[14px] font-medium text-ink-1 truncate hover:text-white transition-colors">
          {poll.title}
        </p>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5 text-[11px]">
          <span className="text-ink-2 truncate max-w-full">
            {metaLine(poll)}
          </span>
          {poll.totalResponses! > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-ink-2 shrink-0">
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

      {/* Bottom tier on mobile / right on desktop: Badges & Quick Action Icons */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          {poll.isAnonymous && <Badge variant="ANON" />}
          <Badge variant={poll.status as PollStatus} />
        </div>

        {/* Quick Action buttons */}
        {poll.status !== "DRAFT" && (
          <div
            className="flex items-center gap-1 ml-1"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Copy link button */}
            <ActionTooltip text={copied ? "Copied!" : "Copy link"} show={copied}>
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-md text-ink-2 hover:text-green-acc hover:bg-white/5 active:scale-95 transition-all opacity-80 sm:opacity-50 hover:opacity-100"
                aria-label="Copy poll link"
              >
                {copied ? (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-green-acc"
                  >
                    <path
                      d="M2 7L5 10L12 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
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
              </button>
            </ActionTooltip>

            {/* Analytics button */}
            <ActionTooltip text="Analytics">
              <Link
                to="/analytics/$pollId"
                params={{ pollId: poll.id }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="p-1.5 rounded-md text-ink-2 hover:text-white hover:bg-white/5 active:scale-95 transition-all opacity-80 sm:opacity-50 hover:opacity-100 block"
                aria-label="View analytics"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
            </ActionTooltip>

            {/* View live poll button */}
            <ActionTooltip text="View poll">
              <Link
                to="/poll/$pollId"
                params={{ pollId: poll.id }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="p-1.5 rounded-md text-ink-2 hover:text-white hover:bg-white/5 active:scale-95 transition-all opacity-80 sm:opacity-50 hover:opacity-100 block"
                aria-label="Open poll"
              >
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M6 2H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8M9 1h4m0 0v4m0-4L6 8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </ActionTooltip>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { polls, userData } = Route.useLoaderData();
  const [pollsList, setPollsList] = useState<Poll[]>(polls);
  const [toast, setToast] = useState<string | null>(null);
  const liveCount = pollsList.filter((p) => p.status === "LIVE").length;

  const handleRemovePoll = async (pollId: string) => {
    try {
      await deletePoll(pollId);
      setPollsList((prev) => prev.filter((p) => p.id !== pollId));
    } catch (err) {
      console.error("Failed to delete poll", err);
    }
  };

  const handleAction = async (pollId: string, actionId: string) => {
    if (actionId === "delete") {
      await handleRemovePoll(pollId);
    } else if (actionId === "archive") {
      setToast("Archiving coming soon!");
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-bg-0 bg-grid relative overflow-x-hidden">
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
        user={userData}
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
            {pollsList.length} total
          </p>
        </div>

        {pollsList.length === 0 ? (
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
            {pollsList.map((p) => (
              <SwipeRow
                key={p.id}
                actions={[
                  {
                    id: "delete",
                    label: "Delete",
                    icon: <HugeiconsIcon icon={Delete02Icon} size={20} />,
                  },
                  {
                    id: "archive",
                    label: "Archive",
                    icon: <HugeiconsIcon icon={Archive02Icon} size={20} />,
                  },
                ]}
                onAction={(action) => handleAction(p.id, action.id)}
                onCommit={() => handleRemovePoll(p.id)}
                actionColor="#dc2626"
                drawerColor="#272727"
                rowColor="#161616"
                textColor="#e8e8e6"
                radius={12}
                actionWidth={80}
                direction="left"
                snapBounce={0.2}
                resistance={0.55}
                collapseMs={240}
                commitAt={0.6}
                fullSwipe
                className="border border-white/5 hover:border-white/15 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
              >
                <PollRow poll={p} />
              </SwipeRow>
            ))}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-bg-2 border border-white/10 text-[12px] font-mono text-ink-1 shadow-2xl animate-slide-up">
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
