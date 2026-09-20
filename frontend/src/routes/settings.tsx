import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "#/components/ui/TopBar";
import { Button } from "#/components/ui/Button";
import { getMe, updateUsername, type AuthUser } from "#/services/auth";

export const Route = createFileRoute("/settings")({
  beforeLoad: async () => {
    const userData = await getMe();
    if (!userData) {
      throw redirect({ to: "/login", replace: true, search: {} });
    }
    return { userData };
  },
  loader: async ({ context }) => context.userData,
  component: SettingsPage,
});

function SettingsPage() {
  const initialData = Route.useLoaderData();
  const [user, setUser] = useState<AuthUser>(initialData);
  const [username, setUsername] = useState(initialData.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = username.trim() !== user.name && username.trim().length > 0;

  async function handleSave() {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateUsername(username.trim());
      setUser((u) => ({ ...u, name: updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update username");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-0 bg-grid relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 w-175 h-100 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)",
        }}
      />

      <TopBar backTo="/dashboard" title="Settings" user={user} />

      <main className="max-w-lg mx-auto px-4 py-8 animate-slide-up">
        <h1 className="text-[20px] font-bold text-ink-1 tracking-tight mb-6">
          Account
        </h1>

        <div className="bg-bg-1/90 border border-white/9 rounded-[14px] p-6 flex flex-col gap-5">
          <div>
            <label className="block text-[10px] font-mono font-medium text-ink-2 uppercase tracking-widest mb-2">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={45}
                className="flex-1 h-9 px-3 rounded-lg text-[13px]"
              />
              <Button
                variant="accent"
                onClick={handleSave}
                disabled={!dirty || saving}
              >
                {saving ? "Saving…" : saved ? "Saved" : "Save"}
              </Button>
            </div>
            {error && (
              <p className="text-[11px] text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="h-px bg-white/6" />

          <div>
            <label className="block text-[10px] font-mono font-medium text-ink-2 uppercase tracking-widest mb-2">
              Email
            </label>
            <p className="text-[13px] text-ink-2">{user.email}</p>
            <p className="text-[11px] text-ink-3 mt-1">
              Tied to your sign-in provider — can't be changed here.
            </p>
          </div>

          <div className="h-px bg-white/6" />

          <div>
            <label className="block text-[10px] font-mono font-medium text-ink-2 uppercase tracking-widest mb-2">
              Signed in with
            </label>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide bg-white/[0.05] text-ink-2 border border-white/[0.08]">
              {user.provider === "google" ? "Google" : "Iris"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
