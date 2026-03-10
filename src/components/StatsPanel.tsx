"use client";

import { useState, useEffect } from "react";
import { getRandomGif } from "@/lib/gifs";

type PlayerStats = {
  id: string;
  name: string;
  wins: number;
  gammonWins: number;
  backgammonWins: number;
  points: number;
  losses: number;
};

type Stats = {
  player1: PlayerStats;
  player2: PlayerStats;
  totalGames: number;
};

export default function StatsPanel({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [gif, setGif] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (!res.ok) {
        setStats(null);
        return;
      }
      setStats(data);
      setGif(getRandomGif("scoreEntered"));
      setTimeout(() => setGif(null), 4000);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  if (loading && !stats) {
    return (
      <section className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-lg border border-amber-200/60">
        <div className="animate-pulse text-stone-500">Loading statistics…</div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-lg border border-amber-200/60">
        <p className="text-stone-600">Statistics could not be loaded.</p>
      </section>
    );
  }

  const { player1, player2, totalGames } = stats;

  if (!player1 || !player2) {
    return (
      <section className="rounded-2xl bg-white/80 backdrop-blur p-6 shadow-lg border border-amber-200/60">
        <p className="text-stone-600">Statistics response has an unexpected shape.</p>
      </section>
    );
  }
  const leader =
    player1.points > player2.points
      ? player1
      : player2.points > player1.points
        ? player2
        : null;

  const labelFor = (p: PlayerStats) =>
    p.id === "player1" ? `💅 ${p.name}` :
    p.id === "player2" ? `💪 ${p.name}` :
    p.name;

  return (
    <section className="rounded-3xl bg-gradient-to-br from-white via-amber-50 to-amber-100/70 backdrop-blur p-6 sm:p-7 shadow-xl border border-amber-200/70">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-900 flex items-center gap-2">
          <span className="text-2xl">📊</span> Statistics
        </h2>
        <button
          onClick={fetchStats}
          className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-full bg-white/70 border border-amber-200/70 shadow-sm"
        >
          Recalculate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div
          className={`rounded-2xl border p-4 sm:p-5 transition ${
            leader && leader.id === player1.id
              ? "border-amber-500 bg-amber-50 shadow-md scale-[1.01]"
              : "border-amber-200 bg-white/80"
          }`}
        >
          <p className="font-bold text-amber-900 mb-1">{labelFor(player1)}</p>
          <p className="text-stone-600 text-sm">
            Wins (games): <strong>{player1.wins}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Gammons: <strong className="text-amber-700">{player1.gammonWins}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Backgammons: <strong className="text-amber-700">{player1.backgammonWins}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Points (gammon = 2, backgammon = 3): <strong>{player1.points}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Losses: <strong>{player1.losses}</strong>
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 sm:p-5 transition ${
            leader && leader.id === player2.id
              ? "border-amber-500 bg-amber-50 shadow-md scale-[1.01]"
              : "border-amber-200 bg-white/80"
          }`}
        >
          <p className="font-bold text-amber-900 mb-1">{labelFor(player2)}</p>
          <p className="text-stone-600 text-sm">
            Wins (games): <strong>{player2.wins}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Gammons: <strong className="text-amber-700">{player2.gammonWins}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Backgammons: <strong className="text-amber-700">{player2.backgammonWins}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Points (gammon = 2, backgammon = 3): <strong>{player2.points}</strong>
          </p>
          <p className="text-stone-600 text-sm">
            Losses: <strong>{player2.losses}</strong>
          </p>
        </div>
      </div>

      <p className="text-sm text-stone-500 mb-2">
        Total games: <strong>{totalGames}</strong>
      </p>
      {leader && (
        <p className="text-sm font-semibold text-amber-800">
          🏆 Currently ahead (by points): <strong>{labelFor(leader)}</strong> ({leader.points} points)
        </p>
      )}
      {!leader && totalGames > 0 && (
        <p className="text-sm font-semibold text-amber-800">Tied. 🎲</p>
      )}

      {gif && (
        <div className="mt-4 animate-bounce-in">
          <img
            src={gif}
            alt="Recalculate"
            className="rounded-xl max-h-32 object-cover border-2 border-amber-200"
          />
        </div>
      )}
    </section>
  );
}
