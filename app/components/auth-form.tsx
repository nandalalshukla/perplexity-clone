"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { signInSchema, signUpSchema } from "@/app/lib/auth-schemas";
import { useAuthStore } from "@/app/lib/auth-store";

export default function AuthForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mode, setMode } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const emailMutation = useMutation({
    mutationFn: async () => {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ name, email, password });

      if (result.error) {
        throw new Error(result.error.message ?? "Authentication failed.");
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      router.refresh();
    },
  });

  const socialMutation = useMutation({
    mutationFn: async (provider: "google" | "github") => {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? `Unable to sign in with ${provider}.`,
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      router.refresh();
    },
  });

  const isPending = emailMutation.isPending || socialMutation.isPending;
  const mutationError = emailMutation.error ?? socialMutation.error;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    emailMutation.reset();

    const parsed =
      mode === "sign-in"
        ? signInSchema.safeParse({ email, password })
        : signUpSchema.safeParse({ name, email, password });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Check your details and try again.",
      );
      return;
    }

    setError("");
    emailMutation.mutate();
  };

  const signInWith = async (provider: "google" | "github") => {
    setError("");
    socialMutation.reset();
    socialMutation.mutate(provider);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-8">
      <div className="mb-6 flex gap-6 border-b border-stone-200">
        {(["sign-in", "sign-up"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              emailMutation.reset();
              socialMutation.reset();
              setError("");
            }}
            className={`border-b-2 pb-3 text-sm font-semibold transition ${mode === item ? "border-emerald-700 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-900"}`}
          >
            {item === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => signInWith("google")}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold transition hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Google
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => signInWith("github")}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold transition hover:border-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        or use email
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "sign-up" ? (
          <label className="block text-sm font-medium text-stone-700">
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
          </label>
        ) : null}
        <label className="block text-sm font-medium text-stone-700">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Password
          <input
            required
            minLength={8}
            type="password"
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
          />
        </label>
        {error || mutationError ? (
          <p role="alert" className="text-sm text-red-700">
            {error || mutationError?.message}
          </p>
        ) : null}
        <button
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
