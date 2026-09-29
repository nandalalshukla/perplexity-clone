"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(["auth", "session"], null);
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      router.refresh();
    },
  });

  return (
    <button
      type="button"
      onClick={() => signOutMutation.mutate()}
      disabled={signOutMutation.isPending}
      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
    >
      {signOutMutation.isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
