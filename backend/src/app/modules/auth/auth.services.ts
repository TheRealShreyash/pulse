import { ApiError } from "../../common/utils";
import { CLIENT_ID, CLIENT_SECRET, IRIS_AUTH_URL } from "../../config";

export const callback = async (code: string) => {
  const response = await fetch(`${IRIS_AUTH_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      code,
    }),
  });

  if (!response.ok) throw ApiError.badRequest("Iris token request error");

  const data = await response.json();

  return data as { data: Object };
};

export const refreshTokens = async (refreshToken: string) => {
  const response = await fetch(`${IRIS_AUTH_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  if (!response.ok) throw ApiError.unauthorized("Failed to refresh tokens");

  const { data } = (await response.json()) as {
    data: { refreshToken: string; accessToken: string };
  };

  return data;
};
