import { createClient } from "@/lib/supabase/server";
import { ResetPasswordButton, DeleteAccountButton } from "./_components/action-buttons";
import type { Plan, Profile } from "@/types/database";

const PLAN_INFO: Record<
  Plan,
  { label: string; color: string; description: string }
> = {
  free:    { label: "Gratuit",  color: "text-white/50 bg-white/5 border-white/10",       description: "3 crédits de démarrage offerts." },
  starter: { label: "Starter",  color: "text-blue-400 bg-blue-400/10 border-blue-400/20", description: "15 crédits renouvelés chaque mois." },
  pro:     { label: "Pro",      color: "text-purple-400 bg-purple-400/10 border-purple-400/20", description: "50 crédits renouvelés chaque mois." },
  scale:   { label: "Scale",   color: "text-[#FF2D55] bg-[#FF2D55]/10 border-[#FF2D55]/20", description: "200 crédits renouvelés chaque mois." },
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const plan = profile?.plan ?? "free";
  const credits = profile?.credits ?? 0;
  const planInfo = PLAN_INFO[plan];

  const memberSince = new Date(user!.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const whopPortalUrl = process.env.NEXT_PUBLIC_WHOP_PORTAL_URL ?? "https://whop.com";

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Paramètres</h1>
        <p className="text-sm text-white/40">Compte, abonnement et préférences.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Section : Mon compte ──────────────────────────────────── */}
        <Section title="Mon compte">
          <Field label="Adresse email">
            <p className="text-sm text-white/80">{user!.email}</p>
          </Field>
          <Field label="Membre depuis">
            <p className="text-sm text-white/80">{memberSince}</p>
          </Field>
          <Field label="Mot de passe">
            <ResetPasswordButton />
          </Field>
        </Section>

        {/* ── Section : Abonnement ─────────────────────────────────── */}
        <Section title="Abonnement">
          <Field label="Plan actuel">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${planInfo.color}`}
              >
                {planInfo.label}
              </span>
              <p className="text-sm text-white/50">{planInfo.description}</p>
            </div>
          </Field>
          <Field label="Crédits restants">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{credits}</span>
              <span className="text-sm text-white/30">crédits</span>
            </div>
          </Field>
          {plan === "free" ? (
            <Field label="Passer à un plan payant">
              <a
                href={whopPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#e0273e] text-sm font-semibold transition-colors"
              >
                Voir les offres →
              </a>
            </Field>
          ) : (
            <Field label="Gérer l'abonnement">
              <a
                href={whopPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
              >
                Portail Whop →
              </a>
              <p className="text-xs text-white/25 mt-2">
                Annuler, modifier ou consulter tes factures directement sur Whop.
              </p>
            </Field>
          )}
        </Section>

        {/* ── Section : Zone de danger ─────────────────────────────── */}
        <Section title="Zone de danger" danger>
          <Field label="Supprimer le compte">
            <p className="text-sm text-white/40 mb-3">
              Efface définitivement ton compte, toutes tes vidéos et tes données.
              Aucune récupération possible.
            </p>
            <DeleteAccountButton />
          </Field>
        </Section>
      </div>
    </div>
  );
}

// ── Composants de structure ───────────────────────────────────────────────────

function Section({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col gap-6 ${
        danger
          ? "border-red-500/20 bg-red-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      <h2
        className={`text-xs font-semibold uppercase tracking-wider ${
          danger ? "text-red-400/70" : "text-white/40"
        }`}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-white/30">{label}</p>
      {children}
    </div>
  );
}
