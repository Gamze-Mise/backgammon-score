import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { games, players } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { gamesErrorResponse, postGameHandler } from "./post-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  const run = async () => {
    const db = getDb();
    const list = await db
      .select({
        id: games.id,
        winnerId: games.winnerId,
        loserId: games.loserId,
        isMars: games.isMars,
        resultType: games.resultType,
        createdAt: games.createdAt,
        winnerName: players.name,
      })
      .from(games)
      .leftJoin(players, eq(games.winnerId, players.id))
      .orderBy(desc(games.createdAt))
      .limit(100);

    const loserQuery = await db.select().from(players);
    const loserMap = Object.fromEntries(loserQuery.map((p) => [p.id, p.name]));
    const withLoserName = list.map((g) => ({
      ...g,
      loserName: loserMap[g.loserId] ?? g.loserId,
    }));

    return NextResponse.json(withLoserName);
  };
  return run().catch((e) => {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load games" },
      { status: 500 },
    );
  });
}

export async function POST(req: Request) {
  return postGameHandler(req).catch((e) => {
    console.error(e);
    return gamesErrorResponse();
  });
}

export async function DELETE() {
  const run = async () => {
    const db = getDb();
    const [last] = await db
      .select()
      .from(games)
      .orderBy(desc(games.id))
      .limit(1);

    if (!last) {
      return NextResponse.json({ error: "No games to undo" }, { status: 400 });
    }

    await db.delete(games).where(eq(games.id, last.id));
    return NextResponse.json(last);
  };
  return run().catch((e) => {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to undo last game" },
      { status: 500 },
    );
  });
}
