import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "#/components/ui/Button";
import "#/index.css";
import { NODE_ENV } from "#/config";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

function RootLayout() {
  return (
    <>
      {/* This is where your pages (index, login, analytics) will render */}
      <div className="min-h-screen bg-bg-0 text-ink-1">
        <Outlet />
      </div>

      {/* TanStack Router Devtools - shows up as a small logo in the corner */}
      {NODE_ENV === "development" && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-0 bg-grid relative flex flex-col justify-between overflow-hidden">
      {/* Top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 w-175 h-100 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header with Pulse logo */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-[14px] font-semibold text-ink-1 tracking-tight hover:text-green-acc transition-colors shrink-0"
        >
          <img
            src="/favicon.png"
            alt="Pulse logo"
            className="w-4.5 h-4.5 rounded-[5px]"
          />
          Pulse
        </Link>
      </header>

      {/* Main 404 Hero */}
      <main className="relative z-10 max-w-md mx-auto px-6 py-16 text-center animate-slide-up my-auto">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-ink-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span>ERR_404 // ROUTE_NOT_FOUND</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink-1 tracking-tight mb-3 font-mono">
          Lost in void.
        </h1>

        <p className="text-[13px] text-ink-2 leading-relaxed mb-8 max-w-xs mx-auto">
          The page or poll you're looking for doesn't exist, was deleted, or never had a pulse.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="accent" className="w-full sm:w-auto justify-center">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto justify-center">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      {/* Subtle bottom footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 text-center">
        <p className="text-[11px] font-mono text-ink-3">
          Pulse · Real-time Polling
        </p>
      </footer>
    </div>
  );
}
