import { createClient } from "@/lib/supabase/server";
import { generateVideo } from "./actions";
import { VideoGrid } from "@/components/video-grid";
import type { Video } from "@/types/database";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ generating?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Video[]>();

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Générer une vidéo</h1>
        <p className="text-sm text-white/40">
          Colle un lien produit TikTok Shop — l&apos;IA fait le reste.
        </p>
      </div>

      {/* Erreur crédits */}
      {params.error === "no-credits" && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/10 text-red-400 text-sm">
          Crédits insuffisants.{" "}
          <a href="/app/settings" className="underline underline-offset-2">
            Recharger →
          </a>
        </div>
      )}

      {/* Formulaire génération */}
      <form action={generateVideo} className="mb-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="product_url" className="text-sm text-white/60">
              Lien produit TikTok Shop
            </label>
            <input
              id="product_url"
              name="product_url"
              type="url"
              required
              placeholder="https://shop.tiktok.com/product/..."
              className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF2D55]/50 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="product_image" className="text-sm text-white/60">
              Image produit <span className="text-white/30">(PNG / JPG — optionnel si le scraper fonctionne)</span>
            </label>
            <input
              id="product_image"
              name="product_image"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white/60 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white/80 file:text-xs file:cursor-pointer cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <p className="text-xs text-white/30">
              1 crédit par vidéo générée · Stockée 7 jours
            </p>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF2D55] hover:bg-[#e0273e] font-semibold text-sm transition-colors"
            >
              Générer ⚡
            </button>
          </div>
        </div>
      </form>

      {/* Grille vidéos avec polling */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          Vidéos récentes
        </h2>
        <VideoGrid
          initialVideos={videos ?? []}
          generatingId={params.generating}
        />
      </div>
    </div>
  );
}
