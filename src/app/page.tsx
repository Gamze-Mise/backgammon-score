"use client";

import { useState, useEffect, useCallback } from "react";
import ScoreForm from "@/components/ScoreForm";
import StatsPanel from "@/components/StatsPanel";
import PasswordResetTrigger from "@/components/PasswordResetTrigger";

type Player = { id: string; name: string };

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [listKey, setListKey] = useState(0);

  const loadPlayers = useCallback(async () => {
    try {
      const res = await fetch("/api/players");
      const data = await res.json();
      setPlayers(res.ok && Array.isArray(data) ? data : []);
    } catch {
      setPlayers([]);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const onScoreSuccess = useCallback(() => {
    setListKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/90 to-amber-100/50">
      <header className="border-b border-amber-200/60 bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-amber-50/80 border border-amber-200/80 shadow-sm min-w-0">
            <span className="text-3xl shrink-0" role="img" aria-hidden>🎲</span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-amber-900 truncate">
              Backgammon Scoreboard
            </h1>
          </div>
          {players.length >= 2 ? (
            <PasswordResetTrigger players={players} />
          ) : null}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {players.length >= 2 ? (
          <ScoreForm players={players} onSuccess={onScoreSuccess} />
        ) : (
          <div className="rounded-2xl bg-amber-100/80 p-6 text-center text-stone-600">
            Loading players…
          </div>
        )}
        <StatsPanel refreshKey={listKey} />
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-stone-500">
        Two-player backgammon scores.
      </footer>
    </div>
  );
}
