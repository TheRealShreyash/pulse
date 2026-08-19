// import { BACKEND_URL } from "#/config";

export const redirectToIrisLogin = () => {
  window.location.href = `/api/auth/iris-login`;
};

export const redirectToIrisSignup = () => {
  window.location.href = `/api/auth/iris-signup`;
};

export const authenticate = async () => {
  try {
    const response = await fetch(`/api/auth/me`, {
      credentials: "include",
    });

    if (response.ok) return true;

    if (response.status === 401) {
      const refreshRes = await fetch(`/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      return refreshRes.ok;
    }
    return false;
  } catch (error) {
    console.log(`[AUTH] error: ${error}`);
    return false;
  }
};

export const getUserInfo = async () => {
  const response = await fetch(`/api/auth/userinfo`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message ?? "Failed to fetch user info");
  }

  const userData = await response.json();

  return userData;
};
