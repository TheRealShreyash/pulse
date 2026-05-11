// src/routes/signup.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  function handleSignup() {
    // TODO: redirect to your Iris OIDC registration endpoint
    // window.location.href = `${import.meta.env.VITE_IRIS_URL}/register?...`
  }

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-[22px] font-medium text-ink-1">Pulse</h1>
          <p className="text-[13px] text-ink-3 mt-1.5">Create your account</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-white/8 bg-bg-1 p-8 flex flex-col items-center gap-6">
          <div className="text-center space-y-1">
            <p className="text-[14px] font-medium text-ink-1">Get started</p>
            <p className="text-[12px] text-ink-3">
              Use your Iris account to create polls
            </p>
          </div>

          <button
            onClick={handleSignup}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-green-bar/40 bg-green-dim text-green-acc text-[13px] font-medium hover:bg-green-dimhover hover:border-green-bar/60 transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-acc"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle
                cx="8"
                cy="8"
                r="3"
                fill="currentColor"
                fillOpacity="0.4"
              />
              <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            </svg>
            Sign up with Iris
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-ink-3 mt-6">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-ink-2 hover:text-ink-1 transition-colors underline underline-offset-2"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
