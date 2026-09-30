"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GitBranch, Mail, ShieldCheck } from "lucide-react";
import { authClient } from "@/app/lib/auth-client";
import { signInSchema, signUpSchema } from "@/app/lib/auth-schemas";

type AuthMode = "sign-in" | "sign-up" | "forgot" | "verify";

type AuthFormProps = {
  initialMode?: "sign-in" | "sign-up";
  onSuccess?: () => void;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AuthForm({
  initialMode = "sign-in",
  onSuccess,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const emailMutation = useMutation({
    mutationFn: async () => {
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) throw new Error(result.error.message);
        return "forgot" as const;
      }

      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ name, email, password });
      if (result.error) throw new Error(result.error.message);
      return mode;
    },
    onSuccess: (result) => {
      if (result === "sign-up") {
        setMode("verify");
        setNotice(`We sent a verification link to ${email}.`);
      } else if (result === "forgot") {
        setNotice(
          "If an account exists for that email, a reset link is on its way.",
        );
      } else {
        onSuccess?.();
      }
    },
  });

  const socialMutation = useMutation({
    mutationFn: async (provider: "google" | "github") => {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess,
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/",
      });
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () =>
      setNotice(`A fresh verification link was sent to ${email}.`),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    emailMutation.reset();

    if (mode === "forgot") {
      if (!signInSchema.shape.email.safeParse(email).success) {
        setError("Enter a valid email address.");
        return;
      }
    } else {
      const parsed =
        mode === "sign-in"
          ? signInSchema.safeParse({ email, password })
          : signUpSchema.safeParse({ name, email, password });
      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ??
            "Check your details and try again.",
        );
        return;
      }
    }
    emailMutation.mutate();
  };

  const isPending =
    emailMutation.isPending ||
    socialMutation.isPending ||
    resendMutation.isPending;
  const mutationError =
    emailMutation.error ?? socialMutation.error ?? resendMutation.error;

  if (mode === "verify") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
          <ShieldCheck size={27} />
        </div>
        <div>
          <h2 className="text-xl font-medium text-white">Check your inbox</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">{notice}</p>
        </div>
        {mutationError ? (
          <p className="text-sm text-rose-300">
            {errorMessage(mutationError, "Unable to send email.")}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => resendMutation.mutate()}
          disabled={isPending}
          className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5 disabled:opacity-50"
        >
          {resendMutation.isPending
            ? "Sending..."
            : "Resend verification email"}
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className="text-sm text-white/50 hover:text-white"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  const isForgot = mode === "forgot";
  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/80">
            Northstar
          </p>
          <h2 className="mt-2 text-2xl font-medium text-white">
            {isForgot
              ? "Reset your password"
              : mode === "sign-in"
                ? "Welcome back"
                : "Create your account"}
          </h2>
        </div>
        <Mail className="text-white/25" size={21} />
      </div>
      {!isForgot ? (
        <div className="mb-6 grid grid-cols-2 gap-2">
          {(["sign-in", "sign-up"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item);
                setError("");
                setNotice("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm transition ${mode === item ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
            >
              {item === "sign-in" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      ) : null}
      {!isForgot ? (
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => socialMutation.mutate("google")}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm text-white transition hover:border-white/25 hover:bg-white/5 disabled:opacity-50"
          >
            Google
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => socialMutation.mutate("github")}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm text-white transition hover:border-white/25 hover:bg-white/5 disabled:opacity-50"
          >
            <GitBranch size={16} /> GitHub
          </button>
        </div>
      ) : null}
      {!isForgot ? (
        <div className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-white/25">
          <span className="h-px flex-1 bg-white/10" />
          or email
          <span className="h-px flex-1 bg-white/10" />
        </div>
      ) : null}
      <form onSubmit={submit} className="space-y-4">
        {mode === "sign-up" ? (
          <label className="block text-sm text-white/60">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
            />
          </label>
        ) : null}
        <label className="block text-sm text-white/60">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
          />
        </label>
        {!isForgot ? (
          <label className="block text-sm text-white/60">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
            />
          </label>
        ) : null}
        {mode === "sign-in" ? (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError("");
            }}
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            Forgot password?
          </button>
        ) : null}
        {error || mutationError ? (
          <p role="alert" className="text-sm text-rose-300">
            {error || errorMessage(mutationError, "Authentication failed.")}
          </p>
        ) : null}
        {notice && isForgot ? (
          <p className="text-sm leading-6 text-emerald-300">{notice}</p>
        ) : null}
        <button
          disabled={isPending}
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-100 disabled:opacity-50"
        >
          {isPending
            ? "Please wait..."
            : isForgot
              ? "Send reset link"
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
        </button>
      </form>
      {isForgot ? (
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setNotice("");
            setError("");
          }}
          className="mt-5 w-full text-center text-sm text-white/45 hover:text-white"
        >
          Back to sign in
        </button>
      ) : null}
    </div>
  );
}
