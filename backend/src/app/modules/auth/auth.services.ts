import { ApiError } from "../../common/utils";
import { CLIENT_ID, CLIENT_SECRET, IRIS_AUTH_URL } from "../../../config";
import { db } from "../../../db";
import { usersTable, betterAuthUsersTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

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

export const registerUser = async (payload: any) => {
  const { sub, name, email } = payload;

  const [byId] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sub))
    .limit(1);

  if (byId) return;

  // Iris issued a sub we haven't seen before — if that's because this email
  // is already registered under a different identity (a prior Iris account,
  // or a Google account linked via Better Auth), reject rather than crash on
  // the unique email constraint or silently create a disconnected account.
  const [byEmail] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (byEmail) {
    const [googleLinked] = await db
      .select()
      .from(betterAuthUsersTable)
      .where(eq(betterAuthUsersTable.pulseUserId, byEmail.id))
      .limit(1);

    if (googleLinked) {
      throw ApiError.conflict(
        "This email is already registered via Google. Please sign in with Google instead.",
      );
    }

    throw ApiError.conflict(
      "This email is already registered. Please log in instead.",
    );
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      id: sub,
      username: name,
      email,
    })
    .returning();

  if (!user) throw ApiError.internalError("Internal server error");
};

export const updateUsername = async (userId: string, username: string) => {
  const [user] = await db
    .update(usersTable)
    .set({ username })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!user) throw ApiError.notFound("User not found");

  // Keeps a linked Google session in sync immediately — Better Auth reads
  // name fresh from its own user table on every session check, so this
  // takes effect on the very next request without touching auth middleware.
  // An Iris session can't be updated this way (the name is baked into an
  // already-issued JWT); it catches up on next login instead.
  await db
    .update(betterAuthUsersTable)
    .set({ name: username })
    .where(eq(betterAuthUsersTable.pulseUserId, userId));

  return user;
};
