import { Suspense } from "react";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/90 to-amber-100/50 flex flex-col items-center justify-center px-4 py-10">
      <p className="mb-4 text-sm text-stone-600">
        <Link href="/" className="text-amber-800 font-semibold hover:underline">
          ← Backgammon Scoreboard
        </Link>
      </p>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-amber-200 bg-white/90 px-8 py-10 text-stone-600">
            Loading…
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
