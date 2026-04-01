"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!token) {
      setErr("Use the email link.");
      return;
    }
    if (pw1 !== pw2) {
      setErr("Passwords do not match.");
      return;
    }
    if (pw1.length < 4) {
      setErr("Password must be at least 4 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(
          typeof data?.error === "string"
            ? data.error
            : "Could not update password.",
        );
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-lg max-w-md w-full text-center">
        <p className="text-stone-700 mb-4">Open this from the link in your email.</p>
        <Link
          href="/"
          className="text-amber-800 font-semibold underline hover:text-amber-900"
        >
          Back to scoreboard
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white/90 p-6 shadow-lg max-w-md w-full text-center">
        <p className="text-stone-800 font-semibold mb-4">
          Password saved. Use it on the scoreboard.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-white hover:bg-amber-600"
        >
          Go to scoreboard
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="rounded-2xl border border-amber-200 bg-white/90 p-6 sm:p-8 shadow-lg max-w-md w-full"
    >
      <h1 className="font-heading text-xl font-bold text-amber-900 mb-1">
        Set a new password
      </h1>
      <p className="text-sm text-stone-600 mb-5">
        Enter your new password twice, then save.
      </p>
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
            New password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            required
            minLength={4}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
            Confirm new password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            required
            minLength={4}
          />
        </div>
      </div>
      {err && (
        <p className="text-sm font-semibold text-red-600 mb-3">{err}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-amber-500 py-2.5 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
