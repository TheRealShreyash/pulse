import { createRemoteJWKSet, jwtVerify } from "jose";
import type { UserTokenPayload } from "../auth.models";
import { IRIS_AUTH_URL } from "../../../../config";

const JWKS = createRemoteJWKSet(new URL(`${IRIS_AUTH_URL}/auth/certs`), {
  cacheMaxAge: 24 * 60 * 60 * 1000, // 24 hours, in ms
});

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    algorithms: ["RS256"],
  });
  return payload as unknown as UserTokenPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    algorithms: ["RS256"],
  });
  return payload as unknown as { id: string };
}

