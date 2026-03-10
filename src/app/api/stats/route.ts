import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { games, players } from "@/lib/db/schema";
import type { Game } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export type PlayerStats = {
  id: string;
  name: string;
  wins: number;
  gammonWins: number;
  backgammonWins: number;
  points: number;
  losses: number;
};

export type StatsResponse = {
  player1: PlayerStats;
  player2: PlayerStats;
  totalGames: number;
};

function resultType(g: Game): "normal" | "gammon" | "backgammon" {
  if (g.resultType === "gammon" || g.resultType === "backgammon") return g.resultType;
  return g.isMars ? "gammon" : "normal";
}

export async function GET() {
  try {
    const db = getDb();
    const playerList = await db.select().from(players).orderBy(players.id);
    if (playerList.length < 2) {
      return NextResponse.json({
        player1: {
          id: "player1",
          name: "Player 1",
          wins: 0,
          gammonWins: 0,
          backgammonWins: 0,
          points: 0,
          losses: 0,
        },
        player2: {
          id: "player2",
          name: "Player 2",
          wins: 0,
          gammonWins: 0,
          backgammonWins: 0,
          points: 0,
          losses: 0,
        },
        totalGames: 0,
      } satisfies StatsResponse);
    }

    const [p1, p2] = playerList;
    const allGames = await db.select().from(games);

    const p1Wins = allGames.filter((g) => g.winnerId === p1.id).length;
    const p1GammonWins = allGames.filter(
      (g) => g.winnerId === p1.id && resultType(g) === "gammon"
    ).length;
    const p1BackgammonWins = allGames.filter(
      (g) => g.winnerId === p1.id && resultType(g) === "backgammon"
    ).length;
    const p1Losses = allGames.filter((g) => g.loserId === p1.id).length;

    const p2Wins = allGames.filter((g) => g.winnerId === p2.id).length;
    const p2GammonWins = allGames.filter(
      (g) => g.winnerId === p2.id && resultType(g) === "gammon"
    ).length;
    const p2BackgammonWins = allGames.filter(
      (g) => g.winnerId === p2.id && resultType(g) === "backgammon"
    ).length;
    const p2Losses = allGames.filter((g) => g.loserId === p2.id).length;

    const p1Points =
      p1Wins - p1GammonWins - p1BackgammonWins +
      2 * p1GammonWins +
      3 * p1BackgammonWins;

    const p2Points =
      (p2Wins - p2GammonWins - p2BackgammonWins) +
      2 * p2GammonWins +
      3 * p2BackgammonWins;

    const stats: StatsResponse = {
      player1: {
        id: p1.id,
        name: p1.name,
        wins: p1Wins,
        gammonWins: p1GammonWins,
        backgammonWins: p1BackgammonWins,
        points: p1Points,
        losses: p1Losses,
      },
      player2: {
        id: p2.id,
        name: p2.name,
        wins: p2Wins,
        gammonWins: p2GammonWins,
        backgammonWins: p2BackgammonWins,
        points: p2Points,
        losses: p2Losses,
      },
      totalGames: allGames.length,
    };

    return NextResponse.json(stats);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to calculate statistics" },
      { status: 500 }
    );
  }
}
