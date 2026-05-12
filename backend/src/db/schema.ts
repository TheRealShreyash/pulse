import {
  boolean,
  pgEnum,
  pgTable,
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

export const usersTable = pgTable("users", {
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
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  ],
);
