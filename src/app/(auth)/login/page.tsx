import { login } from "../actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-bold mb-2">Connexion</h1>
        <p className="text-sm text-white/40 mb-8">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-[#FF2D55] hover:underline">
            S&apos;inscrire
          </a>
        </p>

        <ErrorMessage searchParams={searchParams} />

        <form action={login} className="flex flex-col gap-4">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm text-white/60">
                Mot de passe
              </label>
              <a href="/forgot-password" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Mot de passe oublié ?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF2D55]/50 text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-xl bg-[#FF2D55] hover:bg-[#e0273e] font-semibold text-sm transition-colors"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

async function ErrorMessage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params.error) return null;
  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {params.error}
    </div>
  );
}
