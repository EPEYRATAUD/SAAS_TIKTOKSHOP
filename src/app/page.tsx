export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-sm bg-black/80">
        <span className="text-xl font-bold tracking-tight">
          Viral<span className="text-[#FF2D55]">Clip</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
          <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
            Connexion
          </a>
          <a
            href="/signup"
            className="text-sm font-medium px-4 py-2 rounded-full bg-[#FF2D55] hover:bg-[#e0273e] transition-colors"
          >
            Essai gratuit
          </a>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative flex flex-col items-center justify-center text-center pt-40 pb-24 px-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FF2D55]/20 blur-[120px] rounded-full" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[#FF2D55]/40 bg-[#FF2D55]/10 text-[#FF2D55] mb-6">
              ✦ Propulsé par Higgsfield AI
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              Transforme tes produits{" "}
              <span className="bg-gradient-to-r from-[#FF2D55] to-[#FF6B35] bg-clip-text text-transparent">
                TikTok Shop
              </span>
              <br />
              en vidéos UGC virales
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10">
              Colle un lien produit TikTok Shop. Notre IA génère une vidéo UGC réaliste en quelques secondes, prête à publier.
            </p>

            {/* URL Input mock */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
              <input
                type="url"
                placeholder="https://shop.tiktok.com/product/..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF2D55]/50 text-sm"
                readOnly
              />
              <button className="px-6 py-3 rounded-xl bg-[#FF2D55] hover:bg-[#e0273e] font-semibold text-sm transition-colors whitespace-nowrap">
                Générer la vidéo →
              </button>
            </div>

            <p className="text-xs text-white/30">
              Aucune carte bancaire requise · 3 vidéos gratuites à l&apos;inscription
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-white/10 py-10 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "< 30s", label: "Temps de génération" },
              { value: "4K", label: "Résolution vidéo" },
              { value: "99%", label: "Taux de réalisme" },
              { value: "10K+", label: "Vidéos générées" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">3 étapes, c&apos;est tout</h2>
              <p className="text-white/40">Pas besoin de compétences vidéo. Pas d&apos;acteurs. Pas de tournage.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Colle ton lien produit",
                  desc: "N'importe quel produit TikTok Shop — copie-colle l'URL dans notre interface.",
                  icon: "🔗",
                },
                {
                  step: "02",
                  title: "L'IA analyse & génère",
                  desc: "Higgsfield AI extrait les infos produit et génère une vidéo UGC ultra-réaliste.",
                  icon: "⚡",
                },
                {
                  step: "03",
                  title: "Télécharge & publie",
                  desc: "Ta vidéo est prête en 30 secondes. Publie directement sur TikTok.",
                  icon: "🚀",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-[#FF2D55]/30 transition-colors group"
                >
                  <span className="text-3xl mb-4 block">{item.icon}</span>
                  <span className="text-xs font-mono text-[#FF2D55] mb-2 block">{item.step}</span>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-24 px-6 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tout ce dont tu as besoin</h2>
              <p className="text-white/40">Une plateforme complète pour scaler tes contenus TikTok Shop.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "🎭", title: "Avatars UGC réalistes", desc: "Des créateurs virtuels indiscernables des vrais humains." },
                { icon: "🎵", title: "Sons tendance auto", desc: "Intégration automatique des sons viraux du moment." },
                { icon: "📦", title: "Extraction produit IA", desc: "Analyse automatique du titre, prix et images produit." },
                { icon: "🔄", title: "Variations illimitées", desc: "Génère 10 variantes en un clic pour tester ce qui convertit." },
                { icon: "🗑️", title: "Stockage auto-géré", desc: "Vidéos supprimées après 7 jours. Zéro surcoût stockage." },
                { icon: "📊", title: "Dashboard analytique", desc: "Suivi des crédits, historique et performances en temps réel." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <span className="text-2xl mb-3 block">{f.icon}</span>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-white/40">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-24 px-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifs simples</h2>
              <p className="text-white/40">Paye selon ton volume. Sans engagement.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Starter",
                  price: "9€",
                  credits: "20 vidéos/mois",
                  features: ["Résolution HD", "1 style UGC", "Support email"],
                  popular: false,
                },
                {
                  name: "Pro",
                  price: "29€",
                  credits: "100 vidéos/mois",
                  features: ["Résolution 4K", "5 styles UGC", "Variations A/B", "Support prioritaire"],
                  popular: true,
                },
                {
                  name: "Scale",
                  price: "79€",
                  credits: "Illimité",
                  features: ["Résolution 4K", "Styles illimités", "API access", "Account manager"],
                  popular: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-2xl border flex flex-col ${
                    plan.popular
                      ? "border-[#FF2D55] bg-[#FF2D55]/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-[#FF2D55] text-white">
                      Populaire
                    </span>
                  )}
                  <div className="mb-6">
                    <p className="text-sm text-white/50 mb-1">{plan.name}</p>
                    <p className="text-4xl font-bold">{plan.price}<span className="text-base font-normal text-white/40">/mois</span></p>
                    <p className="text-sm text-white/40 mt-1">{plan.credits}</p>
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-white/60 flex items-center gap-2">
                        <span className="text-[#FF2D55]">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/signup"
                    className={`w-full text-center py-3 rounded-xl font-medium text-sm transition-colors ${
                      plan.popular
                        ? "bg-[#FF2D55] hover:bg-[#e0273e] text-white"
                        : "border border-white/20 hover:border-white/40 text-white"
                    }`}
                  >
                    Commencer
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="py-24 px-6 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à exploser tes ventes TikTok ?
            </h2>
            <p className="text-white/40 mb-8">
              Rejoins des centaines de vendeurs TikTok Shop qui automatisent leur contenu UGC.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF2D55] hover:bg-[#e0273e] font-semibold transition-colors"
            >
              Commencer gratuitement →
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold">
            Viral<span className="text-[#FF2D55]">Clip</span>
          </span>
          <p className="text-xs text-white/30">© 2026 ViralClip. Tous droits réservés.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="/terms" className="hover:text-white transition-colors">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
