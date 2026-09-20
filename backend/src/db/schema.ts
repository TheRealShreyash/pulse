import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const pollStatusEnum = pgEnum("poll_status", [
  "DRAFT",
  "LIVE",
  "ENDED",
  "PUBLISHED",
]);

export const usersTable = pgTable("users_pulse", {
  id: varchar("id").primaryKey(),
  username: varchar("username", { length: 45 }).notNull(),
  email: varchar("email", { length: 322 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const pollsTable = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: varchar("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 300 }),
  status: pollStatusEnum("status").notNull().default("DRAFT"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  showLiveResults: boolean("show_live_results").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Nullable and generated only for new polls going forward — existing
  // polls keep working via their id alone, no backfill needed. Postgres
  // allows multiple NULLs under a unique constraint (same pattern already
  // used for votesTable's fingerprint column).
  slug: varchar("slug", { length: 32 }).unique(),
});

export const optionsTable = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => pollsTable.id, { onDelete: "cascade" }),
  text: varchar("text", { length: 120 }).notNull(),
  displayOrder: integer("display_order").notNull(),
});

export const votesTable = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id")
      .notNull()
      .references(() => pollsTable.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => optionsTable.id, { onDelete: "cascade" }),
    userId: varchar("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    fingerprint: varchar("fingerprint", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("votes_poll_user_unique").on(table.pollId, table.userId),
    uniqueIndex("votes_poll_fingerprint_unique").on(
      table.pollId,
      table.fingerprint,
    ),
  ],
);

// ── Better Auth (Google sign-in) ────────────────────────────────────────────
// Owned by the Better Auth Drizzle adapter — table names ("user", "session",
// "account", "verification") are fixed by Better Auth itself and must not
// change. Every Better Auth user is linked back to usersTable via
// pulse_user_id (see backend/src/lib/auth.ts's databaseHooks), which is what
// poll ownership actually keys off of — these tables never appear as a
// foreign key elsewhere in this schema.

export const betterAuthUsersTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  pulseUserId: text("pulse_user_id"),
});

export const betterAuthSessionsTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => betterAuthUsersTable.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const betterAuthAccountsTable = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => betterAuthUsersTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const betterAuthVerificationsTable = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const betterAuthUserRelations = relations(
  betterAuthUsersTable,
  ({ many }) => ({
    sessions: many(betterAuthSessionsTable),
    accounts: many(betterAuthAccountsTable),
  }),
);

export const betterAuthSessionRelations = relations(
  betterAuthSessionsTable,
  ({ one }) => ({
    user: one(betterAuthUsersTable, {
      fields: [betterAuthSessionsTable.userId],
      references: [betterAuthUsersTable.id],
    }),
  }),
);

export const betterAuthAccountRelations = relations(
  betterAuthAccountsTable,
  ({ one }) => ({
    user: one(betterAuthUsersTable, {
      fields: [betterAuthAccountsTable.userId],
      references: [betterAuthUsersTable.id],
    }),
  }),
);
