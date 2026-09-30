import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import AppShell from "@/app/components/app-shell";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return <AppShell user={session?.user ?? null} />;
}
