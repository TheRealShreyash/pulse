import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { toPng } from "html-to-image";
import { TopBar } from "#/components/ui/TopBar";
import { Badge } from "#/components/ui/Badge";
import { Button } from "#/components/ui/Button";
import { OptionBar } from "#/components/poll/OptionBar";
import { LiveDot } from "#/components/poll/LiveDot";
import { AnalyticsBar } from "#/components/poll/AnalyticsBar";
import { ShareCard } from "#/components/poll/ShareCard";
import { usePollSocket } from "#/hooks/usePollSocket";
import { useCountdown } from "#/hooks/useCountdown";
import type { PollWithOptions } from "#/lib/types";
import { getPoll, checkVote, respondToPoll } from "#/services/poll";
import { authenticate, redirectToIrisLogin } from "#/services/auth";
import { Share2 } from "lucide-react";

export const Route = createFileRoute("/poll/$pollId")({
  loader: async ({ params }) => {
    const [data, voted] = await Promise.all([
      getPoll(params.pollId),
      checkVote(params.pollId),
    ]);
    return { data, voted };
  },
  component: PollPage,
});

function calcPcts(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return counts.map(() => 0);
  return counts.map((c) => Math.round((c / total) * 100));
}

function PollPage() {
  const { pollId } = Route.useParams();
  const { data, voted } = Route.useLoaderData();

  const [poll, setPoll] = useState<PollWithOptions>(data);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(voted);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authenticate().then(setIsLoggedIn);
  }, []);

  const isActive = poll.status === "LIVE";
  const isPublished = poll.status === "PUBLISHED";
  const isClosed = poll.status === "ENDED";

  const showBars = hasVoted || isPublished || isClosed;
  const authBlocked = !poll.isAnonymous && isLoggedIn === false;
  const canVote = isActive && !hasVoted && !submitting && !authBlocked;

  const countdown = useCountdown(poll.expiresAt);
  const pcts = calcPcts(poll.options.map((o) => o.count));

  usePollSocket({
    pollId,
    enabled: (isActive && poll.showLiveResults) || hasVoted,
    onVoteUpdate: ({ counts, total }) => {
      setPoll((prev) => ({
        ...prev,
        options: prev.options.map((o, i) => ({ ...o, count: counts[i] })),
        totalResponses: total,
      }));
    },
    onPollClosed: () => setPoll((prev) => ({ ...prev, status: "ENDED" })),
  });

  async function handleVote() {
    if (selected === null || !canVote) return;
    setSubmitting(true);
    setError(null);
    try {
      const optionId = poll.options[selected].id;
      await respondToPoll({ pollId, optionId });
      setHasVoted(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShareImage() {
    if (!shareCardRef.current) return;
    setIsGeneratingImage(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#0f0f12",
      });
      const link = document.createElement("a");
      link.download = `pulse-poll-${poll.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      setError("Could not generate image. Try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // ─── PUBLISHED VIEW (final results) ─────────────────────────
  if (isPublished) {
    const leadingIdx = pcts.indexOf(Math.max(...pcts));
    return (
      <div className="min-h-screen bg-bg-0 bg-grid">
        <TopBar right={<Badge variant="PUBLISHED" />} />
        <main className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
          <p className="flex items-center gap-2 text-[10px] font-mono font-medium text-ink-3 uppercase tracking-widest mb-3">
            <span aria-hidden="true" className="w-4 h-px bg-ink-3" />
            Final results
          </p>
          <h1 className="text-[22px] font-bold text-ink-1 tracking-tight leading-snug mb-2">
            {poll.title}
          </h1>
          <p className="text-[11px] font-mono text-ink-3 mb-7 tabular-nums">
            {poll.totalResponses} responses ·{" "}
            {poll.isAnonymous ? "Anonymous" : "Authenticated"}
          </p>

          <div className="mb-6 px-4 py-3.5 rounded-lg bg-green-dim border border-green-bar/25 shadow-[0_0_24px_rgba(74,222,128,0.1)]">
            <p className="text-[11px] font-mono text-ink-3 mb-0.5 uppercase tracking-wide">
              Most voted
            </p>
            <p className="text-[16px] font-bold text-green-acc">
              {poll.options[leadingIdx].text}
            </p>
            <p className="text-[11px] font-mono text-ink-2 mt-0.5 tabular-nums">
              {poll.options[leadingIdx].count} votes · {pcts[leadingIdx]}%
            </p>
          </div>

          <div className="space-y-3.5">
            {poll.options.map((opt, i) => (
              <AnalyticsBar
                key={opt.id}
                label={opt.text}
                count={opt.count}
                pct={pcts[i]}
                isLeading={i === leadingIdx}
              />
            ))}
          </div>
        </main>

        <div className="fixed -left-2499.75 top-0">
          <ShareCard ref={shareCardRef} poll={poll} />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShareImage}
          disabled={isGeneratingImage}
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-bg-2 border border-white/10 hover:bg-white/5"
        >
          {isGeneratingImage ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Share as Image
            </>
          )}
        </Button>
      </div>
    );
  }

  // ─── ACTIVE / CLOSED VIEW (no share button) ─────────────────
  return (
    <div className="min-h-screen bg-bg-0 bg-grid relative">
      {isActive && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 w-175 h-100 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)",
          }}
        />
      )}

      <TopBar liveCount={isActive ? poll.totalResponses : undefined} />

      <main className="relative max-w-lg mx-auto px-4 py-10 animate-slide-up">
        <h1 className="text-[22px] font-bold text-ink-1 tracking-tight leading-snug mb-3">
          {poll.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-ink-3 mb-7">
          {isActive && (
            <>
              <span className="flex items-center gap-1.5">
                <LiveDot />
                Live
              </span>
              {poll.expiresAt && <span>{countdown}</span>}
              <span>·</span>
            </>
          )}
          {isClosed && <span>Poll ended</span>}
          <span>{poll.isAnonymous ? "Anonymous" : "Sign-in required"}</span>
          <span>·</span>
          <span>Single choice</span>
        </div>

        {authBlocked && (
          <div className="mb-6 px-4 py-4 rounded-lg border border-white/8 bg-bg-2 text-center animate-fade-in-up">
            <p className="text-[13px] text-ink-2 mb-3">
              This poll requires you to sign in to vote.
            </p>
            <Button
              variant="accent"
              size="sm"
              onClick={() => redirectToIrisLogin()}
            >
              Sign in to vote
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2.5 mb-5">
          {poll.options.map((opt, i) => (
            <OptionBar
              key={opt.id}
              label={opt.text}
              pct={pcts[i]}
              hasVoted={showBars}
              isSelected={selected === i}
              disabled={!canVote}
              onClick={() => {
                if (canVote) setSelected(i === selected ? null : i);
              }}
            />
          ))}
        </div>

        {isActive && !hasVoted && !authBlocked && (
          <div className="flex flex-col gap-2">
            <Button
              variant="accent"
              className="w-full justify-center"
              disabled={selected === null || submitting}
              onClick={handleVote}
            >
              {submitting ? "Submitting…" : "Submit vote"}
            </Button>
            {error && (
              <p className="text-[12px] text-red-400 text-center pl-3 border-l-2 border-red-900/60 mx-auto">
                {error}
              </p>
            )}
          </div>
        )}

        {hasVoted && (
          <div className="mt-4 space-y-1 text-center animate-fade-in-up">
            <p className="text-[12px] text-ink-3">Your vote is recorded</p>
            {isActive && poll.showLiveResults && (
              <p className="text-[11px] font-mono text-ink-3 flex items-center justify-center gap-1.5">
                <LiveDot />
                Results update live
              </p>
            )}
            <p className="text-[12px] font-mono text-ink-3 tabular-nums">
              {poll.totalResponses}{" "}
              {poll.totalResponses === 1 ? "response" : "responses"}
            </p>
          </div>
        )}

        {isClosed && !hasVoted && (
          <div className="mt-8 text-center">
            <p className="text-[14px] text-ink-2">This poll has ended</p>
            <p className="text-[12px] text-ink-3 mt-1">
              Results will appear here once the creator publishes them.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
