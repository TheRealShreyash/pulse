import { Link } from "@tanstack/react-router";
import { LiveDot } from "../poll/LiveDot";

interface TopBarProps {
  backTo?: string;
  title?: string;
  right?: React.ReactNode;
  showAvatar?: boolean;
  initials?: string;
  liveCount?: number;
}

export function TopBar({
  backTo,
  title,
  right,
  showAvatar,
  initials = "AK",
  liveCount,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-11 px-5 bg-bg-0/85 backdrop-blur-md border-b border-white/[0.07] shadow-[0_1px_0_rgba(74,222,128,0.06)]">
      {/* Left */}
      <div className="flex items-center gap-2.5">
        {backTo && (
          <Link
            to={backTo}
            aria-label="Back"
            className="text-ink-2 hover:text-green-acc transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
        {title ? (
          <span className="text-[14px] font-semibold text-ink-1 tracking-tight">
            {title}
          </span>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-2 text-[14px] font-semibold text-ink-1 tracking-tight hover:text-green-acc transition-colors"
          >
            <img
              src="/favicon.png"
              alt=""
              className="w-4.5 h-4.5 rounded-[5px]"
            />
            Pulse
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {liveCount !== undefined && (
          <div className="flex items-center gap-1.5">
            <LiveDot />
            <span className="text-[11px] font-mono text-ink-2 tabular-nums">
              {liveCount} votes
            </span>
          </div>
        )}
        {right}
        {showAvatar && (
          <div className="w-6.5 h-6.5 rounded-full bg-green-dim border border-green-bar/30 flex items-center justify-center text-[11px] font-mono font-medium text-green-acc select-none hover:border-green-bar/50 transition-colors">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
