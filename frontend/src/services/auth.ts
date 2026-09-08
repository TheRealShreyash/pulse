// import { BACKEND_URL } from "#/config";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
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

