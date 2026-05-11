import { redirectToIrisLogin } from '#/services/auth'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

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
  )
}

function LoginPage() {
  function handleLogin() {
    redirectToIrisLogin()
  }

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4 relative overflow-hidden">
      {/* subtle grid bg */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* center glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
        }}
      />

      {/* card */}
      <div className="relative z-10 w-full max-w-75 bg-bg-1 border border-white/9 rounded-[14px] p-7 flex flex-col items-center hover:border-green-bar/20 transition-colors duration-200">
        {/* iris logo mark */}
        <div className="w-9 h-9 rounded-[10px] bg-green-dim border border-green-bar/20 flex items-center justify-center mb-4">
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

        <h1 className="text-[18px] font-medium text-ink-1 tracking-tight mb-1">
          Pulse
        </h1>
        <p className="text-[11px] text-ink-3 mb-5">Sign in to your account</p>

        <div className="w-full h-px bg-white/6 mb-5" />

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[9px] border border-green-bar/35 bg-green-dim text-green-acc text-[13px] font-medium hover:bg-green-dimhover hover:border-green-bar/55 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc mb-5"
        >
          <IrisIcon />
          Login with Iris
        </button>

        <p className="text-[11px] text-ink-3">
          No account?{' '}
          <Link
            to="/signup"
            className="text-ink-2 underline underline-offset-2 hover:text-ink-1 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
