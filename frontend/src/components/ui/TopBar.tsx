import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LiveDot } from "../poll/LiveDot";
import { logout, type AuthUser } from "#/services/auth";
import { getInitials } from "#/lib/utils";

interface TopBarProps {
  backTo?: string;
  title?: string;
  right?: React.ReactNode;
  user?: AuthUser | null;
  liveCount?: number;
}

function ProfileMenu({ user }: { user: AuthUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-6.5 h-6.5 rounded-full bg-green-dim border border-green-bar/30 flex items-center justify-center text-[11px] font-mono font-medium text-green-acc select-none hover:border-green-bar/50 transition-colors"
      >
        {getInitials(user.name)}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 w-56 rounded-xl border border-white/10 bg-bg-1/95 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.45)] py-1.5 animate-fade-in">
          <div className="px-3.5 py-2.5 border-b border-white/[0.07]">
            <p className="text-[13px] font-medium text-ink-1 truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-ink-3 truncate">{user.email}</p>
            {user.provider && (
              <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wide bg-white/[0.05] text-ink-2 border border-white/[0.08]">
                via {user.provider === "google" ? "Google" : "Iris"}
              </span>
            )}
          </div>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-ink-2 hover:text-ink-1 hover:bg-white/[0.04] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M13 8.5v-1l-1.3-.2a4.4 4.4 0 0 0-.5-1.2l.8-1.1-.7-.7-1.1.8a4.4 4.4 0 0 0-1.2-.5L8.8 3h-1l-.2 1.3a4.4 4.4 0 0 0-1.2.5l-1.1-.8-.7.7.8 1.1a4.4 4.4 0 0 0-.5 1.2L3.5 7.5v1l1.3.2c.1.4.3.8.5 1.2l-.8 1.1.7.7 1.1-.8c.4.2.8.4 1.2.5l.2 1.3h1l.2-1.3c.4-.1.8-.3 1.2-.5l1.1.8.7-.7-.8-1.1c.2-.4.4-.8.5-1.2l1.3-.2Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
            Settings
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-ink-2 hover:text-red-400 hover:bg-red-900/10 transition-colors disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 2H3.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1H6M10.5 11l3-3-3-3M13.25 8H6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar({ backTo, title, right, user, liveCount }: TopBarProps) {
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
        {user && <ProfileMenu user={user} />}
      </div>
    </header>
  );
}
