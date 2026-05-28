import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { passwordResetTokens, players } from "@/lib/db/schema";
import { isValidPlayerId } from "@/lib/players";
import { sendSmtpMail } from "@/lib/mailer";
import { renderResetPasswordEmail } from "@/lib/email-templates";
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

    try {
      const email = renderResetPasswordEmail({
        playerName: player.name,
        resetUrl,
      });
      await sendSmtpMail({
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send email.";
      console.error("SMTP send error:", e);
      const status =
        typeof msg === "string" && msg.startsWith("Missing ")
          ? 503
          : 502;
      return NextResponse.json({ error: msg }, { status });
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
