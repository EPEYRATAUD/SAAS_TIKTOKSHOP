import { signup } from "../actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
        <p className="text-sm text-white/40 mb-8">
          Déjà inscrit ?{" "}
          <a href="/login" className="text-[#FF2D55] hover:underline">
            Se connecter
          </a>
        </p>

        <Messages searchParams={searchParams} />

        <form action={signup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-white/60">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="toi@exemple.com"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF2D55]/50 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-white/60">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              placeholder="8 caractères minimum"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF2D55]/50 text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-xl bg-[#FF2D55] hover:bg-[#e0273e] font-semibold text-sm transition-colors"
          >
            Créer mon compte →
          </button>
        </form>

        <p className="text-xs text-white/20 text-center mt-6">
          En créant un compte tu acceptes nos{" "}
          <a href="/terms" className="hover:text-white/40 transition-colors underline">CGU</a>{" "}
          et notre{" "}
          <a href="/privacy" className="hover:text-white/40 transition-colors underline">politique de confidentialité</a>.
        </p>
      </div>

      <div className="mt-4 text-center text-xs text-white/30">
        ✦ 3 vidéos gratuites incluses à l&apos;inscription
      </div>
    </div>
  );
}

async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  if (params.error) {
    return (
      <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {params.error}
      </div>
    );
  }

  if (params.success === "check-email") {
    return (
      <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        Vérifie ton email pour confirmer ton compte.
      </div>
    );
  }

  return null;
}
