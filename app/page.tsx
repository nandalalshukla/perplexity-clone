import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import AuthForm from "@/app/components/auth-form";
import SignOutButton from "@/app/components/sign-out-button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6 py-12 text-stone-950">
      <div className="w-full max-w-5xl">
        <div className="mb-12 flex items-center justify-between">
       
          {session ? <SignOutButton /> : null}
        </div>

        {session ? (
          <section className="rounded-3xl bg-white p-8 shadow-xl shadow-stone-300/40 sm:p-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
              Private workspace
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Welcome back, {session.user.name}.
            </h1>
            <p className="mt-5 text-lg text-stone-600">{session.user.email}</p>
          </section>
        ) : (
          <section className="grid gap-10 rounded-3xl bg-white p-8 shadow-xl shadow-stone-300/40 sm:p-12 lg:grid-cols-[1fr_420px] lg:items-center">

            <AuthForm />
          </section>
        )}
      </div>
    </main>
  );
}
