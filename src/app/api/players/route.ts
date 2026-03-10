import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { players } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const list = await db
      .select({
        id: players.id,
        name: players.name,
        mustChangePassword: players.mustChangePassword,
      })
      .from(players)
      .orderBy(players.id);
    if (list.length === 0) {
      await db.insert(players).values([
        { id: "player1", name: "Player 1" },
        { id: "player2", name: "Player 2" },
      ]);
      const again = await db
        .select({
          id: players.id,
          name: players.name,
          mustChangePassword: players.mustChangePassword,
        })
        .from(players)
        .orderBy(players.id);
      return NextResponse.json(again);
    }
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load players" },
      { status: 500 }
    );
  }
}
