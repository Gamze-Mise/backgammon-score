import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
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

export type Player = typeof players.$inferSelect;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
