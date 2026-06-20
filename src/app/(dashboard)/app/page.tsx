import { createClient } from "@/lib/supabase/server";
import { generateVideo } from "./actions";
import type { Video } from "@/types/database";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

      {/* Generate form */}
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

      {/* Videos history */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          Vidéos récentes
        </h2>

        {!videos || videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <p className="text-3xl mb-3">🎬</p>
            <p className="text-white/40 text-sm">Aucune vidéo pour l&apos;instant.</p>
            <p className="text-white/20 text-xs mt-1">
              Colle un lien produit ci-dessus pour commencer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  const statusConfig = {
    pending:    { label: "En attente",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    generating: { label: "Génération…",  color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    ready:      { label: "Prête",        color: "text-green-400 bg-green-400/10 border-green-400/20" },
    failed:     { label: "Échec",        color: "text-red-400 bg-red-400/10 border-red-400/20" },
  };

  const s = statusConfig[video.status];

  const expiresIn = Math.ceil(
    (new Date(video.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-colors group">
      {/* Thumbnail */}
      <div className="aspect-[9/16] bg-white/5 relative flex items-center justify-center">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.product_title ?? "Vidéo"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl opacity-20">🎬</span>
        )}

        {video.status === "ready" && video.video_url && (
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl">
              ▶
            </span>
          </a>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-white/60 truncate mb-2">
          {video.product_title ?? video.product_url}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${s.color}`}>
            {s.label}
          </span>
          <span className="text-xs text-white/20">
            {expiresIn > 0 ? `Expire dans ${expiresIn}j` : "Expiré"}
          </span>
        </div>
      </div>
    </div>
  );
}
