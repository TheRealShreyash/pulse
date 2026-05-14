import { Link } from "@tanstack/react-router";
import { LiveDot } from "../poll/LiveDot";

interface TopBarProps {
  backTo?:     string;
  title?:      string;
  right?:      React.ReactNode;
  showAvatar?: boolean;
  initials?:   string;
  liveCount?:  number;
}

export function TopBar({ backTo, title, right, showAvatar, initials = "AK", liveCount }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-11 px-5 bg-bg-0 border-b border-white/[0.07]">
      {/* Left */}
      <div className="flex items-center gap-2.5">
        {backTo && (
          <Link to={backTo} aria-label="Back" className="text-ink-2 hover:text-ink-1 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
        {title ? (
          <span className="text-[14px] font-medium text-ink-1">{title}</span>
        ) : (
          <Link to="/" className="text-[14px] font-medium text-ink-1 hover:text-green-acc transition-colors">
            Pulse
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {liveCount !== undefined && (
          <div className="flex items-center gap-1.5">
            <LiveDot />
            <span className="text-[11px] text-ink-2 tabular-nums">{liveCount} votes</span>
          </div>
        )}
        {right}
        {showAvatar && (
          <div className="w-[26px] h-[26px] rounded-full bg-green-dim border border-green-bar/30 flex items-center justify-center text-[11px] font-medium text-green-acc select-none">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}