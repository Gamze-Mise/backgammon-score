"use client";

import { useEffect, useMemo, useState } from "react";

type GameRow = {
  id: number;
  winnerId: string;
  loserId: string;
  winnerName: string | null;
  loserName: string;
  resultType: "normal" | "gammon" | "backgammon";
  createdAt: string;
};

function formatResult(resultType: GameRow["resultType"]) {
  if (resultType === "gammon") return "Gammon (2)";
  if (resultType === "backgammon") return "Backgammon (3)";
  return "Normal (1)";
}

export default function RecentGames({ refreshKey }: { refreshKey?: number }) {
  const [rows, setRows] = useState<GameRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoPassword, setUndoPassword] = useState("");
  const [showUndoPassword, setShowUndoPassword] = useState(false);

  const list = useMemo(() => (rows ?? []).slice(0, 10), [rows]);
  const last = rows?.[0] ?? null;
  const undoApproverId =
    last?.winnerId === "player1" || last?.winnerId === "player2"
      ? (last.winnerId as "player1" | "player2")
      : null;
  const undoApproverLabel =
    undoApproverId === "player1"
      ? `💅 ${last?.winnerName ?? "Player 1"}`
      : undoApproverId === "player2"
        ? `💪 ${last?.winnerName ?? "Player 2"}`
        : null;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games");
      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data)) {
        setRows(null);
        setError(typeof data?.error === "string" ? data.error : "Could not load games.");
        return;
      }
      setRows(data as GameRow[]);
    } catch {
      setRows(null);
      setError("Could not load games.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const undo = async () => {
    setUndoLoading(true);
    setUndoError(null);
    try {
      if (!undoApproverId) {
        setUndoError("Could not determine who must confirm this undo.");
        return;
      }
      const res = await fetch("/api/games/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverId: undoApproverId,
          password: undoPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUndoError(
          typeof data?.error === "string"
            ? data.error
            : "Could not undo. Please try again.",
        );
        return;
      }
      setUndoOpen(false);
      setUndoPassword("");
      setShowUndoPassword(false);
      await load();
    } catch {
      setUndoError("Could not undo.");
    } finally {
      setUndoLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur p-6 sm:p-7 shadow-xl border border-amber-200/70">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-900">
          Recent games
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-full bg-white/70 border border-amber-200/70 shadow-sm"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              if (!last) {
                setUndoError("No games to undo.");
                return;
              }
              setUndoOpen(true);
              setUndoError(null);
              setUndoPassword("");
              setShowUndoPassword(false);
            }}
            className="text-xs sm:text-sm font-semibold text-white px-3 py-1.5 rounded-full bg-stone-800/90 hover:bg-stone-900 disabled:opacity-50 shadow-sm"
            title="Remove the most recent game"
          >
            Undo last…
          </button>
        </div>
      </div>

      {undoError ? (
        <p className="text-sm font-semibold text-red-600 mb-3">{undoError}</p>
      ) : null}

      {loading ? (
        <div className="animate-pulse text-stone-500">Loading games…</div>
      ) : error ? (
        <p className="text-stone-600">{error}</p>
      ) : list.length === 0 ? (
        <p className="text-stone-600">No games yet. Add the first one above.</p>
      ) : (
        <ul className="divide-y divide-amber-100/80">
          {list.map((g) => (
            <li key={g.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {g.winnerName ?? g.winnerId} beat {g.loserName}
                </p>
                <p className="text-xs text-stone-500">
                  {formatResult(g.resultType)}
                </p>
              </div>
              <time className="text-[11px] text-stone-500 shrink-0">
                {new Date(g.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}

      {undoOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-amber-200">
            <h3 className="font-heading text-lg font-bold text-amber-900 mb-2">
              Undo last game
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              This removes the most recent game. To prevent accidental deletes, it
              must be confirmed by the winner of the last game.
            </p>

            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (undoLoading || !undoPassword.trim()) return;
                void undo();
              }}
            >
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                Confirm with:{" "}
                <span className="font-bold">
                  {undoApproverLabel ?? "Winner"}
                </span>
              </div>

              <div className="relative">
                <input
                  type={showUndoPassword ? "text" : "password"}
                  autoComplete="off"
                  value={undoPassword}
                  onChange={(e) => setUndoPassword(e.target.value)}
                  placeholder="Enter their password"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 pr-12 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowUndoPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-stone-600 hover:bg-amber-50"
                  aria-label={showUndoPassword ? "Hide password" : "Show password"}
                  title={showUndoPassword ? "Hide" : "Show"}
                >
                  {showUndoPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {undoError ? (
                <p className="text-sm font-semibold text-red-600">{undoError}</p>
              ) : null}

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUndoOpen(false);
                    setUndoError(null);
                    setUndoPassword("");
                    setShowUndoPassword(false);
                  }}
                  className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-amber-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={undoLoading || !undoPassword.trim()}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-950 disabled:opacity-50"
                >
                  {undoLoading ? "Undoing…" : "Confirm undo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

