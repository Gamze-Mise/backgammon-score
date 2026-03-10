import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { isValidPlayerId } from "@/lib/players";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

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
    if (!body || typeof body !== "object" || !("name" in body)) {
      return NextResponse.json(
        { error: "id and name are required" },
        { status: 400 }
      );
    }
    const name = String(body.name).trim();
    if (!name) {
      return NextResponse.json(
        { error: "name cannot be empty" },
        { status: 400 }
      );
    }
    await db
      .update(players)
      .set({ name })
      .where(eq(players.id, id));
    const [updated] = await db
      .select({
        id: players.id,
        name: players.name,
        mustChangePassword: players.mustChangePassword,
      })
      .from(players)
      .where(eq(players.id, id))
      .limit(1);
    return NextResponse.json(updated ?? null);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update player name" },
      { status: 500 }
    );
  }
}
