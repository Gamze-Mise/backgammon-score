"use client";

import { useState, useCallback } from "react";
import { getRandomGif } from "@/lib/gifs";

type Player = { id: string; name: string };
type ResultType = "normal" | "gammon";
const RESULT_OPTIONS: Array<{ value: ResultType; label: string }> = [
  { value: "normal", label: "Normal win (1 point)" },
  { value: "gammon", label: "Gammon (2 points)" },
];
const LAST_RESORT_GIF = "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif";

export default function ScoreForm({
  players,
  onSuccess,
}: {
  players: Player[];
  onSuccess: () => void;
}) {
  const [winnerId, setWinnerId] = useState<string>("");
  const [resultType, setResultType] = useState<ResultType>("normal");
  const [loading, setLoading] = useState(false);
  const [approverPassword, setApproverPassword] = useState("");
  const [reactionGif, setReactionGif] = useState<string | null>(null);
  const [reactionType, setReactionType] = useState<"win" | "mars" | null>(null);
  const [gifRetryCount, setGifRetryCount] = useState(0);
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(
    null,
  );
  const [changePasswordFor, setChangePasswordFor] = useState<Player | null>(
    null,
  );
  const [changeCurrentPw, setChangeCurrentPw] = useState("");
  const [changeNewPw, setChangeNewPw] = useState("");
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwLoading, setChangePwLoading] = useState(false);

  const displayName = (p: Player) =>
    p.id === "player1"
      ? `💅 ${p.name}`
      : p.id === "player2"
        ? `💪 ${p.name}`
        : p.name;

  const submit = useCallback(async () => {
    if (!winnerId) return;
    const loser = players.find((p) => p.id !== winnerId);
    if (!loser) return;
    const approverId = loser.id;

    setLoading(true);
    setReactionGif(null);
    setGifRetryCount(0);
    setErrorModalMessage(null);
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
        const msg =
          typeof data?.error === "string" ? data.error : "Failed to save game";
        setErrorModalMessage(msg);
        setReactionGif(null);
        setReactionType(null);
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
        setGifRetryCount(0);
      }, 7000);
    } catch {
      setErrorModalMessage("Something went wrong. Please try again.");
      setReactionGif(null);
      setReactionType(null);
    } finally {
      setLoading(false);
    }
  }, [winnerId, resultType, approverPassword, players, onSuccess]);

  return (
    <section className="rounded-3xl bg-linear-to-br from-amber-50 via-orange-50 to-amber-100/90 p-6 sm:p-7 shadow-xl border border-amber-200/70">
      <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-900 mb-1 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl">🎲</span> Backgammon result
      </h2>
      <p className="mb-5 text-sm text-stone-600">
        Select the winner and confirm with the other player&apos;s password.
      </p>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (loading || !winnerId || !approverPassword) return;
          void submit();
        }}
      >
        <div className="rounded-2xl border border-amber-200/80 bg-white/70 p-4 sm:p-5">
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
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white/70 p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Result type
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RESULT_OPTIONS.map((option) => {
                const selected = resultType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setResultType(option.value)}
                    className={[
                      "rounded-2xl border px-3 py-2 text-xs sm:text-sm font-semibold transition text-left",
                      selected
                        ? "border-amber-500 bg-amber-100/90 text-amber-900 shadow-sm"
                        : "border-amber-200 bg-white/80 text-stone-700 hover:bg-amber-50",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {winnerId && (
          <div className="rounded-2xl border border-amber-200/80 bg-white/75 p-4 sm:p-5 flex flex-col gap-2">
            <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Approval password (
              {winnerId === "player1" ? "💪 Husband" : "💅 Wife"})
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
              Default first-time password is 12345. You&apos;ll be asked to set
              a new one after saving.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !winnerId || !approverPassword}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 sm:px-6 sm:py-3 font-bold text-white shadow-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span>{loading ? "Saving…" : "Save score"}</span>
          </button>
        </div>
      </form>

      {errorModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-red-200">
            <h3 className="font-heading text-lg font-bold text-red-700 mb-2">
              Password check failed
            </h3>
            <p className="text-sm text-stone-700 mb-4">{errorModalMessage}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setErrorModalMessage(null)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {changePasswordFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-amber-200">
            <h3 className="font-heading text-lg font-bold text-amber-900 mb-2">
              Set new password for {displayName(changePasswordFor)}
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              You’re still using the default password (12345). Set a new one now
              (one-time).
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="password"
                autoComplete="off"
                value={changeCurrentPw}
                onChange={(e) => {
                  setChangeCurrentPw(e.target.value);
                  setChangePwError(null);
                }}
                placeholder="Current password (e.g. 12345)"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
              />
              <input
                type="password"
                autoComplete="new-password"
                value={changeNewPw}
                onChange={(e) => {
                  setChangeNewPw(e.target.value);
                  setChangePwError(null);
                }}
                placeholder="New password"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
              />
              {changePwError && (
                <p className="text-sm font-semibold text-red-600">
                  {changePwError}
                </p>
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
                      const res = await fetch(
                        `/api/players/${changePasswordFor.id}/password`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            currentPassword: changeCurrentPw,
                            newPassword: changeNewPw,
                          }),
                        },
                      );
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setChangePwError(
                          typeof data?.error === "string"
                            ? data.error
                            : "Failed to update password",
                        );
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
        <div className="mt-4 animate-bounce-in">
          {reactionType === "mars" && (
            <p className="text-sm font-semibold text-stone-600 mb-2">🔥 Gammon.</p>
          )}
          <img
            src={reactionGif}
            alt="Reaction"
            onError={() => {
              if (!reactionType) {
                setReactionGif(LAST_RESORT_GIF);
                return;
              }
              if (gifRetryCount >= 8) {
                setReactionGif(LAST_RESORT_GIF);
                return;
              }
              const fallbackType =
                reactionType === "mars" && gifRetryCount < 4
                  ? "mars"
                  : "scoreEntered";
              setGifRetryCount((count) => count + 1);
              setReactionGif(getRandomGif(fallbackType));
            }}
            className="rounded-xl max-h-40 object-cover border-2 border-amber-200"
          />
        </div>
      )}
    </section>
  );
}
