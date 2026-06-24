import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/ui/TopBar";
import { Button } from "../components/ui/Button";
import { Toggle } from "../components/ui/Toggle";
import { authenticate } from "#/services/auth";
import { createPoll } from "#/services/poll";

export const Route = createFileRoute("/create")({
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
  component: CreatePoll,
});

// ── types ─────────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  options: string[];
  isAnonymous: boolean;
  showLiveResults: boolean;
  expiryHours: number;
}

const EXPIRY_OPTIONS = [
  { label: "1 hour", value: 1 },
  { label: "2 hours", value: 2 },
  { label: "6 hours", value: 6 },
  { label: "1 day", value: 24 },
  { label: "3 days", value: 72 },
  { label: "1 week", value: 168 },
  { label: "No expiry", value: 0 },
];

// ── setting row wrapper ───────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  htmlFor,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 border-t border-white/[0.07]">
      <label
        htmlFor={htmlFor}
        className="flex flex-col gap-0.5 cursor-pointer flex-1"
      >
        <span className="text-[13px] text-ink-1">{label}</span>
        {description && (
          <span className="text-[11px] text-ink-3">{description}</span>
        )}
      </label>
      {children}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

function CreatePoll() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    title: "",
    options: ["", ""],
    isAnonymous: false,
    showLiveResults: true,
    expiryHours: 24,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filledOptions = form.options.filter((o) => o.trim().length > 0);
  const isValid = form.title.trim().length > 0 && filledOptions.length >= 2;

  function setOption(i: number, value: string) {
    setForm((f) => {
      const o = [...f.options];
      o[i] = value;
      return { ...f, options: o };
    });
  }
  function addOption() {
    if (form.options.length >= 10) return;
    setForm((f) => ({ ...f, options: [...f.options, ""] }));
  }
  function removeOption(i: number) {
    if (form.options.length <= 2) return;
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, idx) => idx !== i),
    }));
  }

  async function submit(asDraft: boolean) {
    if (!asDraft && !isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      let expiryDate;
      if (form.expiryHours > 0) {
        const date = new Date();
        date.setHours(date.getHours() + form.expiryHours);
        expiryDate = date.toISOString();
      }
      const payload = {
        title: form.title.trim(),
        options: filledOptions,
        description: "TEST",
        isAnonymous: form.isAnonymous,
        showLiveResults: form.showLiveResults,
        expiresAt: expiryDate || null,
        status: asDraft ? "DRAFT" : "LIVE",
      };

      const pollData = await createPoll(payload);
      navigate({
        to: "/analytics/$pollId",
        params: { pollId: pollData.id },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <TopBar backTo="/dashboard" title="New poll" />

      <main className="max-w-xl mx-auto px-4 py-8 animate-slide-up">
        {/* Question */}
        <section className="mb-7">
          <label className="block text-[10px] font-medium text-ink-2 uppercase tracking-widest mb-2">
            Question
          </label>
          <textarea
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ask something…"
            rows={2}
            maxLength={280}
            className="w-full px-3 py-2.5 rounded-lg bg-bg-2 border border-white/8 text-[14px] text-ink-1 placeholder-ink-3 resize-none focus:border-white/20 transition-colors"
          />
          <p className="text-[10px] text-ink-3 mt-1 text-right">
            {form.title.length}/280
          </p>
        </section>

        {/* Options */}
        <section className="mb-7">
          <label className="block text-[10px] font-medium text-ink-2 uppercase tracking-widest mb-2">
            Options
            <span className="normal-case text-ink-3 ml-1.5 font-normal tracking-normal">
              ({form.options.length}/10)
            </span>
          </label>

          <div className="flex flex-col gap-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] text-ink-3 w-4 text-right select-none shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  maxLength={120}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-2 border border-white/[0.07] text-[13px] placeholder-ink-3 focus:border-white/18 transition-colors"
                />
                {form.options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    aria-label={`Remove option ${i + 1}`}
                    className="text-ink-3 hover:text-red-400 transition-colors shrink-0"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 7h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {form.options.length < 10 && (
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 mt-3 text-[12px] text-ink-2 hover:text-ink-1 transition-colors"
            >
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
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add option
            </button>
          )}
        </section>

        {/* Settings */}
        <section className="mb-8">
          <p className="text-[10px] font-medium text-ink-2 uppercase tracking-widest mb-1">
            Settings
          </p>

          <SettingRow
            label="Anonymous responses"
            description="No sign-in required. Soft dedup via cookie + IP."
            htmlFor="tog-anon"
          >
            <Toggle
              id="tog-anon"
              checked={form.isAnonymous}
              onChange={(v) => setForm((f) => ({ ...f, isAnonymous: v }))}
            />
          </SettingRow>

          <SettingRow
            label="Show live results to respondents"
            description="Bars animate in real time while poll is active."
            htmlFor="tog-live"
          >
            <Toggle
              id="tog-live"
              checked={form.showLiveResults}
              onChange={(v) => setForm((f) => ({ ...f, showLiveResults: v }))}
            />
          </SettingRow>

          <SettingRow
            label="Expiry"
            description="Poll closes automatically after this duration."
          >
            <select
              value={form.expiryHours}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiryHours: Number(e.target.value) }))
              }
              className="px-2.5 py-1.5 rounded-lg bg-bg-2 border border-white/8 text-[12px] focus:border-white/20 cursor-pointer"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </SettingRow>
        </section>

        {error && <p className="text-[12px] text-red-400 mb-4">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => submit(true)}
            disabled={submitting || !form.title.trim()}
          >
            Save draft
          </Button>
          <Button
            variant="accent"
            onClick={() => submit(false)}
            disabled={submitting || !isValid}
          >
            {submitting ? "Creating…" : "Activate poll"}
          </Button>
        </div>
      </main>
    </>
  );
}
