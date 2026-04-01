-- Run once if you don't have this table yet.

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" serial PRIMARY KEY,
  "player_id" text NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp
);

CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_idx"
  ON "password_reset_tokens" ("token_hash");
