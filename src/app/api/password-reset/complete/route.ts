import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { passwordResetTokens, players } from "@/lib/db/schema";
import { hashToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

const MIN_PW = 4;
const MAX_PW = 200;

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { token, newPassword } = body as Record<string, unknown>;
    if (
      typeof token !== "string" ||
      typeof newPassword !== "string" ||
      !token.trim()
    ) {
      return NextResponse.json(
        { error: "token and newPassword required" },
        { status: 400 },
      );
    }

    const pw = newPassword.trim();
    if (pw.length < MIN_PW || pw.length > MAX_PW) {
      return NextResponse.json(
        {
          error: `Password must be between ${MIN_PW} and ${MAX_PW} characters`,
        },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(token.trim());
    const db = getDb();
    const now = new Date();

    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .limit(1);

    if (!row || row.expiresAt <= now) {
      return NextResponse.json({ error: "Link invalid or expired" }, { status: 400 });
    }

    const passwordHash = await hash(pw, 10);

    await db
      .update(players)
      .set({ passwordHash, mustChangePassword: false })
      .where(eq(players.id, row.playerId));

    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, row.id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Couldn't update password" }, { status: 500 });
  }
}
