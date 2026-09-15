import crypto from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  usersTable,
  betterAuthUsersTable,
  betterAuthSessionsTable,
  betterAuthAccountsTable,
  betterAuthVerificationsTable,
} from "../db/schema";
import {
  FRONTEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  BETTER_AUTH_SECRET,
} from "../config";

// Mounted at a base path distinct from /api/auth (Iris's territory) so the
// two auth systems never collide on the same Express route — Better Auth's
// handler fully answers any request under its mount point itself (it never
// calls next()), so sharing /api/auth would silently swallow Iris's routes.
export const BETTER_AUTH_BASE_PATH = "/api/better-auth";

export const auth = betterAuth({
  basePath: BETTER_AUTH_BASE_PATH,
  // Must resolve to the frontend's own domain (proxied through to this
  // backend), not this server's own origin directly — otherwise Google's
  // OAuth redirect lands on a different registrable domain than the one the
  // browser later calls, and the session cookie never gets seen. This is
  // exactly the bug that broke Iris's login flow in production earlier.
  baseURL: `${FRONTEND_URL}${BETTER_AUTH_BASE_PATH}`,
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: betterAuthUsersTable,
      session: betterAuthSessionsTable,
      account: betterAuthAccountsTable,
      verification: betterAuthVerificationsTable,
    },
  }),
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      // Resolves every Better Auth identity (Google, and any future
      // provider) to Pulse's own canonical user id, so poll ownership
      // (pollsTable.creatorId) works the same regardless of which auth
      // system a request came through.
      //
      // No fieldName override here: the Drizzle adapter looks this field up
      // in the schema object by JS property key (defaulting to this config
      // key, "pulseUserId"), not by the underlying SQL column name — the
      // actual snake_case "pulse_user_id" column comes from how the property
      // is declared in schema.ts's betterAuthUsersTable, independent of this.
      pulseUserId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Runs once, before a new Better Auth user row is inserted. If an
        // Iris-created account already exists with this email, link to it
        // instead of creating a second, disconnected identity.
        before: async (user) => {
          const existing = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, user.email))
            .limit(1);

          if (existing[0]) {
            return { data: { ...user, pulseUserId: existing[0].id } };
          }

          const newId = crypto.randomUUID();
          const username: string =
            user.name || user.email.split("@")[0] || "user";
          await db.insert(usersTable).values({
            id: newId,
            username,
            email: user.email,
          });

          return { data: { ...user, pulseUserId: newId } };
        },
      },
    },
  },
});
