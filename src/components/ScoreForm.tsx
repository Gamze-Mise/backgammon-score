"use client";

import { useState, useCallback } from "react";
import { getRandomGif } from "@/lib/gifs";

type Player = { id: string; name: string; mustChangePassword?: boolean };

export default function ScoreForm({
  players,
  onSuccess,
}: {
  players: Player[];
  onSuccess: () => void;
}) {
  const [winnerId, setWinnerId] = useState<string>("");
  const [resultType, setResultType] = useState<"normal" | "gammon" | "backgammon">("normal");
  const [loading, setLoading] = useState(false);
  const [approverPassword, setApproverPassword] = useState("");
  const [reactionGif, setReactionGif] = useState<string | null>(null);
  const [reactionType, setReactionType] = useState<"win" | "lose" | "mars" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [changePasswordFor, setChangePasswordFor] = useState<Player | null>(null);
  const [changeCurrentPw, setChangeCurrentPw] = useState("");
  const [changeNewPw, setChangeNewPw] = useState("");
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwLoading, setChangePwLoading] = useState(false);

  const displayName = (p: Player) =>
    p.id === "player1" ? `💅 ${p.name}` :
    p.id === "player2" ? `💪 ${p.name}` :
    p.name;

  const submit = useCallback(async () => {
    if (!winnerId) return;
    const loser = players.find((p) => p.id !== winnerId);
    if (!loser) return;
    const approverId = loser.id;

    setLoading(true);
    setReactionGif(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId,
          loserId: loser.id,
          resultType,
          approverId,
          password: approverPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Failed to save game";
        setErrorMessage(msg);
        setReactionGif(getRandomGif("lose"));
        setReactionType("lose");
        setTimeout(() => {
          setReactionGif(null);
          setReactionType(null);
          setErrorMessage(null);
        }, 4000);
        return;
      }
      const isSpecial = resultType !== "normal";
      const gifType = isSpecial ? "mars" : "scoreEntered";
      setReactionGif(getRandomGif(gifType));
      setReactionType(isSpecial ? "mars" : "win");
      setWinnerId("");
      setApproverPassword("");
      setResultType("normal");
      onSuccess();
      if (data.mustChangePassword && data.approverId) {
        const approver = players.find((p) => p.id === data.approverId);
        if (approver) setChangePasswordFor(approver);
      }
      setTimeout(() => {
        setReactionGif(null);
        setReactionType(null);
      }, 3500);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setReactionGif(getRandomGif("lose"));
      setReactionType("lose");
      setTimeout(() => {
        setReactionGif(null);
        setReactionType(null);
        setErrorMessage(null);
      }, 4000);
    } finally {
      setLoading(false);
    }
  }, [winnerId, resultType, approverPassword, players, onSuccess]);

  return (
    <section className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/80 backdrop-blur p-6 sm:p-7 shadow-xl border border-amber-200/70">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl">🎲</span> Backgammon result
      </h2>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Winner
          </span>
          <div className="grid grid-cols-2 gap-3">
            {players.map((p) => {
              const selected = winnerId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setWinnerId(p.id)}
                  className={[
                    "flex flex-col items-center justify-center rounded-2xl border px-3 py-3 sm:py-4 text-sm sm:text-base transition",
                    selected
                      ? "border-amber-500 bg-amber-100/90 shadow-md text-amber-900"
                      : "border-amber-200 bg-white/70 hover:bg-amber-50 text-stone-700",
                  ].join(" ")}
                >
                  <span className="text-lg sm:text-xl mb-1">
                    {p.id === "player1" ? "💅" : "💪"}
                  </span>
                  <span className="font-semibold">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Result type
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {["normal", "gammon", "backgammon"].map((type) => {
              const selected = resultType === type;
              const label =
                type === "normal"
                  ? "Normal win (1 point)"
                  : type === "gammon"
                  ? "Gammon (2 points)"
                  : "Backgammon (3 points)";
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setResultType(type as "normal" | "gammon" | "backgammon")
                  }
                  className={[
                    "rounded-2xl border px-3 py-2 text-xs sm:text-sm font-semibold transition text-left",
                    selected
                      ? "border-amber-500 bg-amber-100/90 text-amber-900 shadow-sm"
                      : "border-amber-200 bg-white/80 text-stone-700 hover:bg-amber-50",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {winnerId && (
          <div className="flex flex-col gap-2">
            <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Approval password ({winnerId === "player1" ? "💪 Husband" : "💅 Wife"})
            </span>
            <input
              type="password"
              autoComplete="off"
              value={approverPassword}
              onChange={(e) => setApproverPassword(e.target.value)}
              className="w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Enter other player's password"
            />
            <p className="text-[11px] text-stone-500">
              Default first-time password is 12345. You&apos;ll be asked to set a new one after saving.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={submit}
            disabled={loading || !winnerId || !approverPassword}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 sm:px-6 sm:py-3 font-bold text-white shadow-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-0.5"
          >
            <span>{loading ? "Saving…" : "Save score"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-3 text-sm font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
          {errorMessage}
        </p>
      )}
      {changePasswordFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-amber-200">
            <h3 className="font-heading text-lg font-bold text-amber-900 mb-2">
              Set new password for {displayName(changePasswordFor)}
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              You’re still using the default password (12345). Set a new one now (one-time).
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="password"
                autoComplete="off"
                value={changeCurrentPw}
                onChange={(e) => { setChangeCurrentPw(e.target.value); setChangePwError(null); }}
                placeholder="Current password (e.g. 12345)"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={changeNewPw}
                onChange={(e) => { setChangeNewPw(e.target.value); setChangePwError(null); }}
                placeholder="New password"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
              />
              {changePwError && (
                <p className="text-sm font-semibold text-red-600">{changePwError}</p>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordFor(null);
                    setChangeCurrentPw("");
                    setChangeNewPw("");
                    setChangePwError(null);
                  }}
                  className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-amber-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={changePwLoading || !changeCurrentPw || !changeNewPw}
                  onClick={async () => {
                    setChangePwLoading(true);
                    setChangePwError(null);
                    try {
                      const res = await fetch(`/api/players/${changePasswordFor.id}/password`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          currentPassword: changeCurrentPw,
                          newPassword: changeNewPw,
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setChangePwError(typeof data?.error === "string" ? data.error : "Failed to update password");
                        return;
                      }
                      setChangePasswordFor(null);
                      setChangeCurrentPw("");
                      setChangeNewPw("");
                      setChangePwError(null);
                      onSuccess();
                    } finally {
                      setChangePwLoading(false);
                    }
                  }}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {changePwLoading ? "Updating…" : "Update password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reactionGif && (
        <div className={`mt-4 animate-bounce-in ${reactionType === "lose" ? "animate-wiggle" : ""}`}>
          <p className="text-sm font-semibold text-stone-600 mb-2">
            {reactionType === "mars" && "🔥 Gammon / Backgammon."}
            {reactionType === "win" && "✅ Result saved."}
            {reactionType === "lose" && (errorMessage || "Something went wrong. Please try again.")}
          </p>
          <img
            src={reactionGif}
            alt="Reaction"
            className="rounded-xl max-h-40 object-cover border-2 border-amber-200"
          />
        </div>
      )}
    </section>
  );
}
