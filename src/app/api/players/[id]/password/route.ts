import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { isValidPlayerId } from "@/lib/players";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DEFAULT_PASSWORD = "12345";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !isValidPlayerId(id)) {
      return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
    }
    const db = getDb();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = body as Record<string, unknown>;
    if (
      currentPassword == null ||
      newPassword == null ||
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "currentPassword and newPassword are required" },
        { status: 400 }
      );
    }

    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .limit(1);

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    let valid = false;
    if (!player.passwordHash) {
      valid = currentPassword === DEFAULT_PASSWORD;
    } else {
      valid = await compare(currentPassword, player.passwordHash);
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const passwordHash = await hash(String(newPassword).trim(), 10);
    await db
      .update(players)
      .set({ passwordHash, mustChangePassword: false })
      .where(eq(players.id, id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
