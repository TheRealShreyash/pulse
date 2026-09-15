import { useState } from "react";
import { z } from "zod";
import { authenticate, redirectToIrisLogin } from "#/services/auth";
import { authClient } from "#/lib/auth-client";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    error: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    // A redirect-back error (e.g. "email already registered elsewhere")
    // means the user is deliberately NOT authenticated yet, so skip the
    // authenticated-redirect check entirely rather than racing a fetch
    // against showing them the message they were just sent here to see.
    if (search.error) return;

    const isAuthenticated = await authenticate();
    if (isAuthenticated) {
      throw redirect({
        to: "/dashboard",
        replace: true,
        search: {},
      });
    }
  },
  component: LoginPage,
});

function IrisIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="3" fill="currentColor" fillOpacity="0.3" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 35.6 26.9 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 40.6 16.3 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.5 5.5C41.4 35.8 45 30.4 45 24c0-1.4-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function LoginPage() {
  const { error: redirectError } = Route.useSearch();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(redirectError ?? null);

  function handleLogin() {
    redirectToIrisLogin();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError("Couldn't start Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-0 bg-grid flex items-center justify-center px-4 relative overflow-hidden">
      {/* center glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 460,
          height: 460,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.09) 0%, transparent 70%)",
        }}
      />

      {/* card */}
      <div className="relative z-10 w-full max-w-75 bg-bg-1/90 backdrop-blur-sm border border-white/9 rounded-[14px] p-7 flex flex-col items-center shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:border-green-bar/25 transition-colors duration-200 animate-fade-in-up">
        {/* iris logo mark */}
        <div className="w-9 h-9 rounded-[10px] bg-green-dim border border-green-bar/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(74,222,128,0.12)]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6.5" stroke="#4ade80" strokeWidth="1.3" />
            <circle cx="8" cy="8" r="3" fill="#4ade80" fillOpacity="0.3" />
            <circle cx="8" cy="8" r="1.3" fill="#4ade80" />
            <line
              x1="8"
              y1="1"
              x2="8"
              y2="3"
              stroke="#4ade80"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="13"
              x2="8"
              y2="15"
              stroke="#4ade80"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="1"
              y1="8"
              x2="3"
              y2="8"
              stroke="#4ade80"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="13"
              y1="8"
              x2="15"
              y2="8"
              stroke="#4ade80"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-[20px] font-bold text-ink-1 tracking-tight mb-1">
          Pulse
        </h1>
        <p className="text-[11px] font-mono text-ink-3 mb-5 tracking-wide">
          Sign in to your account
        </p>

        <div className="w-full h-px bg-white/6 mb-5" />

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[9px] border border-green-bar/35 bg-green-dim text-green-acc text-[13px] font-medium hover:bg-green-dimhover hover:border-green-bar/55 hover:shadow-[0_4px_16px_rgba(74,222,128,0.18)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc mb-5"
        >
          <IrisIcon />
          Login with Iris
        </button>

        <div className="w-full flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-[10px] font-mono text-ink-3 uppercase tracking-widest">
            or
          </span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[9px] border border-white/[0.13] bg-white/[0.04] text-ink-1 text-[13px] font-medium hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && (
          <p className="text-[11px] text-red-400 mb-4 text-center">{error}</p>
        )}

        <p className="text-[11px] text-ink-3">
          No account?{" "}
          <Link
            to="/signup"
            className="text-ink-2 underline underline-offset-2 hover:text-green-acc transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
