import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const credits = profile?.credits ?? 0;
  const plan = profile?.plan ?? "free";

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* SIDEBAR */}
      <aside className="fixed top-0 left-0 bottom-0 w-60 flex flex-col border-r border-white/10 bg-black z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <a href="/" className="text-xl font-bold tracking-tight">
            Viral<span className="text-[#FF2D55]">Clip</span>
          </a>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <SidebarLink href="/app" icon="⚡" label="Générer" />
          <SidebarLink href="/app/videos" icon="🎬" label="Mes vidéos" />
          <SidebarLink href="/app/settings" icon="⚙️" label="Paramètres" />
        </nav>

        {/* Credits + User */}
        <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-3">
          {/* Credits badge */}
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/40">Crédits</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#FF2D55]/20 text-[#FF2D55] capitalize">
                {plan}
              </span>
            </div>
            <p className="text-2xl font-bold">{credits}</p>
            {credits === 0 && (
              <a
                href="/app/settings"
                className="mt-2 block text-center text-xs py-1.5 rounded-lg bg-[#FF2D55] hover:bg-[#e0273e] transition-colors font-medium"
              >
                Recharger →
              </a>
            )}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
                title="Déconnexion"
              >
                ⎋
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
    >
      <span className="text-base">{icon}</span>
      {label}
    </a>
  );
}
