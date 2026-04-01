import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { getDb } from "@/lib/db";
import { passwordResetTokens, players } from "@/lib/db/schema";
import { isValidPlayerId } from "@/lib/players";
import { generateRawToken, getBaseUrl, hashToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id || !isValidPlayerId(id)) {
      return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    if (!apiKey || !from) {
      return NextResponse.json(
        { error: "Set RESEND_API_KEY and EMAIL_FROM." },
        { status: 503 },
      );
    }

    const db = getDb();
    const [player] = await db
      .select({ name: players.name, email: players.email })
      .from(players)
      .where(eq(players.id, id))
      .limit(1);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const to = player.email?.trim() ?? "";
    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "No email for this player." },
        { status: 400 },
      );
    }

    const raw = generateRawToken();
    const tokenHash = hashToken(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.playerId, id));

    await db.insert(passwordResetTokens).values({
      playerId: id,
      tokenHash,
      expiresAt,
    });

    const base = getBaseUrl();
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(raw)}`;

    const resend = new Resend(apiKey);
    const { error: resendError } = await resend.emails.send({
      from,
      to,
      subject: "Reset your password (Backgammon Scoreboard)",
      html: `
        <p>Hi${player.name ? ` ${escapeHtml(player.name)}` : ""},</p>
        <p>Someone requested a new password for this scoreboard account.</p>
        <p><a href="${resetUrl}">Set a new password</a></p>
        <p>This link expires in one hour and works only once.</p>
        <p>If you did not ask for this, you can ignore this email.</p>
      `,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json(
        { error: resendError.message || "Could not send email." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not send reset email." },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
