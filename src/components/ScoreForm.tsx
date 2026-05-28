"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { getRandomGif } from "@/lib/gifs";

type Player = { id: string; name: string };
type ResultType = "normal" | "gammon";
const RESULT_OPTIONS: Array<{ value: ResultType; label: string }> = [
  { value: "normal", label: "Normal win (1 point)" },
  { value: "gammon", label: "Gammon (2 points)" },
];
const fallbackGif =
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif";

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
  const [showApprovePw, setShowApprovePw] = useState(false);
  const [showChangeCurrentPw, setShowChangeCurrentPw] = useState(false);
  const [showChangeNewPw, setShowChangeNewPw] = useState(false);

  const displayName = (p: Player) =>
    p.id === "player1" ? `💅 ${p.name}` : p.id === "player2" ? `💪 ${p.name}` : p.name;

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
      setShowApprovePw(false);
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
        <span className="text-2xl sm:text-3xl" aria-hidden>
          🎲
        </span>{" "}
        Record a result
      </h2>
      <p className="mb-5 text-sm text-stone-600">
        Pick the winner, then confirm with the other player&apos;s password.
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
                    <span className="font-semibold">{displayName(p)}</span>
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
              Confirmation password ({displayName(players.find((p) => p.id !== winnerId) ?? { id: "", name: "Other player" })})
            </span>
            <div className="relative">
              <input
                type={showApprovePw ? "text" : "password"}
                autoComplete="off"
                value={approverPassword}
                onChange={(e) => setApproverPassword(e.target.value)}
                className="w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-2.5 pr-12 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Enter the other player's password"
              />
              <button
                type="button"
                onClick={() => setShowApprovePw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs font-bold text-stone-600 hover:bg-amber-50"
                aria-label={showApprovePw ? "Hide password" : "Show password"}
                title={showApprovePw ? "Hide" : "Show"}
              >
                {showApprovePw ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              First-time password is <strong>12345</strong>. After a successful save,
              you&apos;ll be prompted to change it.
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
              Change password for {displayName(changePasswordFor)}
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              You&apos;re still using the default password (<strong>12345</strong>). Please
              set a new one now (one-time).
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showChangeCurrentPw ? "text" : "password"}
                  autoComplete="off"
                  value={changeCurrentPw}
                  onChange={(e) => {
                    setChangeCurrentPw(e.target.value);
                    setChangePwError(null);
                  }}
                  placeholder="Current password (e.g. 12345)"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 pr-12 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowChangeCurrentPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-stone-600 hover:bg-amber-50"
                  aria-label={showChangeCurrentPw ? "Hide password" : "Show password"}
                  title={showChangeCurrentPw ? "Hide" : "Show"}
                >
                  {showChangeCurrentPw ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showChangeNewPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={changeNewPw}
                  onChange={(e) => {
                    setChangeNewPw(e.target.value);
                    setChangePwError(null);
                  }}
                  placeholder="New password"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 pr-12 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowChangeNewPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-stone-600 hover:bg-amber-50"
                  aria-label={showChangeNewPw ? "Hide password" : "Show password"}
                  title={showChangeNewPw ? "Hide" : "Show"}
                >
                  {showChangeNewPw ? "🙈" : "👁️"}
                </button>
              </div>
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
                    setShowChangeCurrentPw(false);
                    setShowChangeNewPw(false);
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
                      setShowChangeCurrentPw(false);
                      setShowChangeNewPw(false);
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
        <div className="fixed left-1/2 -translate-x-1/2 top-[72px] sm:top-[84px] z-50 w-[min(560px,calc(100vw-2rem))] animate-bounce-in">
          <div className="rounded-2xl border border-amber-200 bg-white/85 shadow-xl backdrop-blur px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-stone-700">
                {reactionType === "mars" ? "Gammon!" : "Score saved"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setReactionGif(null);
                  setReactionType(null);
                  setGifRetryCount(0);
                }}
                className="rounded-lg px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div className="mt-2">
              <Image
                src={reactionGif}
                alt="Reaction"
                width={640}
                height={360}
                onError={() => {
                  if (!reactionType) {
                    setReactionGif(fallbackGif);
                    return;
                  }
                  if (gifRetryCount >= 8) {
                    setReactionGif(fallbackGif);
                    return;
                  }
                  const fallbackType =
                    reactionType === "mars" && gifRetryCount < 4
                      ? "mars"
                      : "scoreEntered";
                  setGifRetryCount((count) => count + 1);
                  setReactionGif(getRandomGif(fallbackType));
                }}
                unoptimized
                className="rounded-xl border border-amber-200 bg-amber-50/60 w-full h-auto aspect-video object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
