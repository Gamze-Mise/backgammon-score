import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("mail"),
  passwordHash: text("password_hash"),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  winnerId: text("winner_id").notNull().references(() => players.id),
  loserId: text("loser_id").notNull().references(() => players.id),
  isMars: boolean("is_mars").notNull().default(false),
  resultType: text("result_type", {
    enum: ["normal", "gammon", "backgammon"],
  }).notNull().default("normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  playerId: text("player_id").notNull().references(() => players.id),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

export type Player = typeof players.$inferSelect;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
