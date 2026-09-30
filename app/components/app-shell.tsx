"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ChevronRight,
  CircleUserRound,
  Folder,
  Grid2X2,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthForm from "@/app/components/auth-form";
import { authClient } from "@/app/lib/auth-client";

type User = { name: string; email: string; image?: string | null };

export default function AppShell({ user }: { user: User | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [query, setQuery] = useState("");

  const signOut = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(["auth", "session"], null);
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      setAccountOpen(false);
      router.refresh();
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const result = await authClient.deleteUser({
        password: deletePassword || undefined,
      });
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => router.refresh(),
    onError: (error) =>
      setDeleteError(
        error instanceof Error ? error.message : "Unable to delete account.",
      ),
  });

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "G";

  return (
    <div className="flex min-h-screen bg-[#141414] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[268px] flex-col border-r border-white/[0.06] bg-[#1d1d1d] px-3 py-3 max-md:w-[74px] max-md:px-2">
        <div className="flex items-center justify-between px-2 py-1 max-md:justify-center">
          <div className="flex size-9 items-center justify-center rounded-xl text-white">
            <Sparkles size={22} strokeWidth={1.7} />
          </div>
          <button
            className="rounded-lg p-2 text-white/35 hover:bg-white/5 hover:text-white max-md:hidden"
            aria-label="Collapse sidebar"
          >
            <PanelLeft size={17} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setQuery("")}
          className="mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.06] max-md:justify-center max-md:px-2"
        >
          <Plus size={18} />
          <span className="max-md:hidden">New</span>
        </button>
        <nav className="mt-4 space-y-1 border-b border-white/[0.06] pb-4">
          <SidebarLink icon={<Search size={17} />} label="Search" />
          <SidebarLink icon={<Grid2X2 size={17} />} label="Discover" />
          <SidebarLink icon={<Folder size={17} />} label="Library" />
        </nav>
        <div className="mt-5 px-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 max-md:hidden">
          Projects
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/35 max-md:justify-center max-md:px-2">
          <Folder size={16} />
          <span className="max-md:hidden">No projects</span>
        </div>
        <div className="mt-6 px-3 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 max-md:hidden">
          Sessions
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/35 max-md:justify-center max-md:px-2">
          <MessageSquare size={16} />
          <span className="max-md:hidden">No recent sessions</span>
        </div>
        <div className="mt-auto border-t border-white/[0.06] pt-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.06] max-md:justify-center"
              >
                <Avatar initials={initials} image={user.image} />
                <span className="min-w-0 flex-1 max-md:hidden">
                  <span className="block truncate text-sm text-white/85">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-white/35">
                    {user.email}
                  </span>
                </span>
                <MoreHorizontal
                  size={17}
                  className="text-white/35 max-md:hidden"
                />
              </button>
              {accountOpen ? (
                <AccountMenu
                  onClose={() => setAccountOpen(false)}
                  onSignOut={() => signOut.mutate()}
                  onDelete={() => {
                    setAccountOpen(false);
                    setDeleteOpen(true);
                  }}
                  pending={signOut.isPending}
                />
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.06] max-md:justify-center"
            >
              <Avatar initials="G" />
              <span className="text-sm text-white/80 max-md:hidden">
                Sign in
              </span>
              <ChevronRight
                size={16}
                className="ml-auto text-cyan-300 max-md:hidden"
              />
            </button>
          )}
        </div>
      </aside>

      <main className="ml-[268px] flex min-h-screen flex-1 flex-col max-md:ml-[74px]">
        <header className="flex h-16 items-center justify-end gap-2 px-5">
          <button
            className="rounded-xl border border-white/10 p-2.5 text-white/55 hover:bg-white/5 hover:text-white"
            aria-label="Computer"
          >
            <Archive size={17} />
          </button>
          <button
            className="rounded-xl border border-white/10 p-2.5 text-white/55 hover:bg-white/5 hover:text-white"
            aria-label="Menu"
          >
            <Menu size={17} />
          </button>
        </header>
        <section className="flex flex-1 flex-col items-center px-5 pt-[15vh] sm:pt-[19vh]">
          <div className="w-full max-w-[714px]">
            <p className="mb-3 text-sm text-white/40">Search</p>
            <h1 className="mb-8 text-[28px] font-medium tracking-tight text-white/90">
              What do you want to know?
            </h1>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="rounded-2xl border border-white/10 bg-[#1b1b1b] p-4 shadow-2xl shadow-black/10"
            >
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask anything..."
                rows={2}
                className="w-full resize-none bg-transparent text-[16px] text-white outline-none placeholder:text-white/35"
              />
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white"
                    aria-label="Add attachment"
                  >
                    <Plus size={19} />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
                  >
                    <Search size={15} /> Search{" "}
                    <ChevronRight
                      size={14}
                      className="rotate-90 text-white/35"
                    />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white/50 hover:bg-white/5"
                  >
                    <Archive size={15} /> Computer
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">
                    Model{" "}
                    <ChevronRight size={13} className="inline rotate-90" />
                  </span>
                  <button
                    type="submit"
                    className="flex size-9 items-center justify-center rounded-full bg-white text-neutral-900 transition hover:bg-cyan-100"
                    aria-label="Submit search"
                  >
                    <ChevronRight size={18} className="-rotate-90" />
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <FeatureCard
                icon={<Search size={18} />}
                title="Search anything"
                body="Get fast and accurate answers from the most trusted sources."
                active
              />
              <FeatureCard
                icon={<Archive size={18} />}
                title="Get work done with Computer"
                body="Hand off your projects to get polished, reliable deliverables around the clock."
                badge="NEW"
              />
            </div>
          </div>
        </section>
      </main>

      {authOpen ? (
        <Dialog onClose={() => setAuthOpen(false)}>
          <AuthForm
            onSuccess={() => {
              setAuthOpen(false);
              router.refresh();
            }}
          />
        </Dialog>
      ) : null}
      {deleteOpen ? (
        <Dialog onClose={() => setDeleteOpen(false)}>
          <div>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-300/80">
                  Danger zone
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">
                  Delete account?
                </h2>
              </div>
              <button
                onClick={() => setDeleteOpen(false)}
                className="text-white/40 hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm leading-6 text-white/55">
              This permanently removes your account, sessions, and saved data.
              This action cannot be undone.
            </p>
            <label className="mt-6 block text-sm text-white/60">
              Confirm with your password
              <input
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                type="password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-rose-300/60"
                placeholder="Leave blank for email confirmation"
              />
            </label>
            {deleteError ? (
              <p className="mt-3 text-sm text-rose-300">{deleteError}</p>
            ) : null}
            <button
              onClick={() => {
                setDeleteError("");
                deleteAccount.mutate();
              }}
              disabled={deleteAccount.isPending}
              className="mt-5 w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
            >
              {deleteAccount.isPending ? "Deleting..." : "Delete my account"}
            </button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}

function SidebarLink({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/55 transition hover:bg-white/[0.06] hover:text-white max-md:justify-center max-md:px-2">
      {icon}
      <span className="max-md:hidden">{label}</span>
    </button>
  );
}
function Avatar({
  initials,
  image,
}: {
  initials: string;
  image?: string | null;
}) {
  return image ? (
    <Image
      src={image}
      alt=""
      width={32}
      height={32}
      className="size-8 rounded-full object-cover"
    />
  ) : (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-300 text-xs font-semibold text-neutral-950">
      {initials}
    </div>
  );
}
function AccountMenu({
  onClose,
  onSignOut,
  onDelete,
  pending,
}: {
  onClose: () => void;
  onSignOut: () => void;
  onDelete: () => void;
  pending: boolean;
}) {
  return (
    <div className="absolute bottom-14 left-0 w-56 rounded-2xl border border-white/10 bg-[#272727] p-1.5 shadow-2xl">
      <button
        onClick={onClose}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10"
      >
        <CircleUserRound size={16} /> Account
      </button>
      <button
        onClick={onClose}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10"
      >
        <Settings size={16} /> Settings
      </button>
      <div className="my-1 border-t border-white/10" />
      <button
        onClick={onSignOut}
        disabled={pending}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10"
      >
        {pending ? (
          <Archive size={16} />
        ) : (
          <ChevronRight size={16} className="rotate-180" />
        )}{" "}
        Sign out
      </button>
      <button
        onClick={onDelete}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 hover:bg-rose-400/10"
      >
        <Trash2 size={16} /> Delete account
      </button>
    </div>
  );
}
function Dialog({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[430px] rounded-3xl border border-white/10 bg-[#202020] p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-white/35 hover:text-white"
          aria-label="Close dialog"
        >
          <X size={19} />
        </button>
        {children}
      </div>
    </div>
  );
}
function FeatureCard({
  icon,
  title,
  body,
  active,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <button
      className={`rounded-xl p-4 text-left transition hover:-translate-y-0.5 ${active ? "bg-cyan-500/85 hover:bg-cyan-400" : "bg-cyan-950/45 hover:bg-cyan-950/65"}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        {icon}
        {title}
        {badge ? (
          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] text-cyan-300">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-5 text-white/65">{body}</p>
    </button>
  );
}
