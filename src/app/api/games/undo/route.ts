import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { games, players } from "@/lib/db/schema";
import { isValidPlayerId } from "@/lib/players";

export const dynamic = "force-dynamic";

const DEFAULT_PASSWORD = "12345";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }
    const { approverId, password } = body as Record<string, unknown>;
    if (
      typeof approverId !== "string" ||
      typeof password !== "string" ||
      !isValidPlayerId(approverId) ||
      !password.trim()
    ) {
      return NextResponse.json(
        { error: "approverId and password are required" },
        { status: 400 },
      );
    }

    const db = getDb();

    const [approver] = await db
      .select()
      .from(players)
      .where(eq(players.id, approverId))
      .limit(1);

    if (!approver) {
      return NextResponse.json({ error: "Approver not found" }, { status: 400 });
    }

    if (!approver.passwordHash) {
      if (password !== DEFAULT_PASSWORD) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    } else {
      const ok = await compare(password, approver.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
    }

    const [last] = await db
      .select()
      .from(games)
      .orderBy(desc(games.id))
      .limit(1);

    if (!last) {
      return NextResponse.json({ error: "No games to undo" }, { status: 400 });
    }

    // Require the winner of the last game to approve the undo.
    if (approverId !== last.winnerId) {
      return NextResponse.json(
        {
          error:
            "Undo must be confirmed by the winner of the last game.",
        },
        { status: 403 },
      );
    }

    await db.delete(games).where(eq(games.id, last.id));
    return NextResponse.json({ ok: true, deleted: last });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not undo last game" }, { status: 500 });
  }
}

