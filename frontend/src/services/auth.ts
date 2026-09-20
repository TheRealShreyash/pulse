// import { BACKEND_URL } from "#/config";
import { authClient } from "#/lib/auth-client";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  // Only present for Iris-authenticated users — Google (via Better Auth)
  // doesn't supply these, so they're never guaranteed.
  given_name?: string;
  family_name?: string;
  picture?: string;
  provider?: "iris" | "google";
}

export const redirectToIrisLogin = () => {
  window.location.href = `/api/auth/iris-login`;
};

export const redirectToIrisSignup = () => {
  window.location.href = `/api/auth/iris-signup`;
};

export const authenticate = async () => {
  const me = await getMe();
  return me !== null;
};

// Fetches the authenticated user in a single round-trip (falling back to a
// token refresh + retry once), instead of making a separate boolean auth
// check and then a separate /userinfo call.
export const getMe = async (): Promise<AuthUser | null> => {
  try {
    let response = await fetch(`/api/auth/me`, {
      credentials: "include",
    });

    if (response.status === 401) {
      const refreshRes = await fetch(`/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) return null;

      response = await fetch(`/api/auth/me`, {
        credentials: "include",
      });
    }

    if (!response.ok) return null;

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log(`[AUTH] error: ${error}`);
    return null;
  }
};

export const updateUsername = async (username: string): Promise<string> => {
  const response = await fetch(`/api/auth/username`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to update username");
  }

  const { data } = await response.json();
  return data.username;
};

// Clears both providers' sessions regardless of which one is actually
// active — cheaper and more robust than checking `provider` first, and
// harmless to call the one that has nothing to clear.
export const logout = async () => {
  await Promise.allSettled([
    fetch(`/api/auth/logout`, { method: "POST", credentials: "include" }),
    authClient.signOut(),
  ]);
};

