"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Player = { id: string; name: string };

function labelFor(p: Player) {
  if (p.id === "player1") return `💅 ${p.name}`;
  if (p.id === "player2") return `💪 ${p.name}`;
  return p.name;
}

export default function PasswordResetTrigger({ players }: { players: Player[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const send = async () => {
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/players/${encodeURIComponent(playerId)}/password-reset-email`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data?.error === "string" ? data.error : "Couldn't send email.",
        );
        return;
      }
      setMsg("Check your email — we sent a link to set a new password.");
    } catch {
      setErr("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  if (players.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setErr(null);
          setMsg(null);
        }}
        className="shrink-0 rounded-full border border-amber-300/80 bg-white/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-50 transition"
      >
        Change password
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                id="reset-password-title"
                className="font-heading text-lg font-bold text-amber-900 mb-1"
              >
                Reset password by email
              </h3>
              <p className="text-sm text-stone-600 mb-4">
                We&apos;ll email a one-time link. Choose whose password this is:
              </p>
              <div className="flex flex-col gap-2 mb-4">
                {players.map((p) => {
                  const selected = playerId === p.id;
                  return (
                    <label
                      key={p.id}
                      className={[
                        "flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer text-sm",
                        selected
                          ? "border-amber-500 bg-amber-50"
                          : "border-amber-200 bg-white",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="reset-player"
                        checked={selected}
                        onChange={() => setPlayerId(p.id)}
                        className="accent-amber-600"
                      />
                      <span className="font-medium text-stone-800">
                        {labelFor(p)}
                      </span>
                    </label>
                  );
                })}
              </div>
              {err && (
                <p className="text-sm font-semibold text-red-600 mb-2">{err}</p>
              )}
              {msg && (
                <p className="text-sm font-semibold text-amber-800 mb-2">{msg}</p>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-amber-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={loading || !playerId}
                  onClick={() => void send()}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send email"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
