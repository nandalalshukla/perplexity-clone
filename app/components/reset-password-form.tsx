"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!token) return setError("This reset link is missing or invalid.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");
    setPending(true);
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setPending(false);
    if (result.error)
      return setError(result.error.message ?? "Unable to update password.");
    setComplete(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#141414] px-4 text-white">
      <div className="w-full max-w-[430px] rounded-3xl border border-white/10 bg-[#202020] p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
          Northstar
        </p>
        <h1 className="mt-3 text-2xl font-medium">
          {complete ? "Password updated" : "Create a new password"}
        </h1>
        {complete ? (
          <>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Your password has been changed. You can now sign in with your new
              password.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-7 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950"
            >
              Return to sign in
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm text-white/60">
              New password
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
              />
            </label>
            <label className="block text-sm text-white/60">
              Confirm password
              <input
                required
                minLength={8}
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyan-300/60"
              />
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              disabled={pending}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 disabled:opacity-50"
            >
              {pending ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
