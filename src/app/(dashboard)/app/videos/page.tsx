import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "./_components/delete-button";
import type { Video, VideoStatus } from "@/types/database";

const STATUS_LABELS: Record<VideoStatus | "all", string> = {
  all:        "Toutes",
  ready:      "Prêtes",
  generating: "En cours",
  pending:    "En attente",
  failed:     "Échouées",
};

const STATUS_BADGE: Record<VideoStatus, string> = {
  pending:    "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  generating: "text-blue-400   bg-blue-400/10   border-blue-400/20",
  ready:      "text-green-400  bg-green-400/10  border-green-400/20",
  failed:     "text-red-400    bg-red-400/10    border-red-400/20",
};

const VALID_STATUSES = ["pending", "generating", "ready", "failed"] as const;

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const statusFilter = VALID_STATUSES.includes(rawStatus as VideoStatus)
    ? (rawStatus as VideoStatus)
    : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const baseQuery = supabase
    .from("videos")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: videos } = await (
    statusFilter ? baseQuery.eq("status", statusFilter) : baseQuery
  ).returns<Video[]>();
  const all = videos ?? [];

  // Comptages pour les onglets (fetch unique sans filtre)
  const { data: allForCount } = statusFilter
    ? await supabase
        .from("videos")
        .select("id, status")
        .eq("user_id", user!.id)
        .returns<Pick<Video, "id" | "status">[]>()
    : { data: all };

  const counts = (allForCount ?? []).reduce<Record<string, number>>(
    (acc, v) => {
      acc.all = (acc.all ?? 0) + 1;
      acc[v.status] = (acc[v.status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const activeFilter = statusFilter ?? "all";

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mes vidéos</h1>
        <p className="text-sm text-white/40">
          Historique de toutes vos générations · Stockage 7 jours
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "ready", "generating", "pending", "failed"] as const).map(
          (s) => {
            const isActive = s === activeFilter;
            const count = counts[s] ?? 0;
            const href = s === "all" ? "/app/videos" : `/app/videos?status=${s}`;
            return (
              <a
                key={s}
                href={href}
                className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
                  isActive
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                }`}
              >
                {STATUS_LABELS[s]}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-xs ${
                      isActive ? "text-white/60" : "text-white/25"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </a>
            );
          }
        )}
      </div>

      {/* Liste */}
      {all.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <p className="text-3xl mb-3">🎬</p>
          <p className="text-white/40 text-sm">
            {statusFilter
              ? `Aucune vidéo avec le statut « ${STATUS_LABELS[statusFilter]} ».`
              : "Aucune vidéo générée pour l'instant."}
          </p>
          {!statusFilter && (
            <a
              href="/app"
              className="mt-4 inline-block px-5 py-2 rounded-xl bg-[#FF2D55] hover:bg-[#e0273e] text-sm font-semibold transition-colors"
            >
              Générer ma première vidéo ⚡
            </a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {all.map((video) => (
            <VideoRow key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoRow({ video }: { video: Video }) {
  const isActive =
    video.status === "pending" || video.status === "generating";
  const expiresIn = Math.ceil(
    (new Date(video.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const createdAt = new Date(video.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/15 transition-colors p-3">
      {/* Thumbnail */}
      <div className="w-10 h-[72px] shrink-0 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.product_title ?? "Vidéo"}
            className="w-full h-full object-cover"
          />
        ) : isActive ? (
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        ) : (
          <span className="text-lg opacity-20">🎬</span>
        )}
      </div>

      {/* Titre + URL */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">
          {video.product_title ?? "Produit en cours d'analyse…"}
        </p>
        <p className="text-xs text-white/30 truncate mt-0.5">
          {video.product_url}
        </p>
        {video.error_message && (
          <p className="text-xs text-red-400/70 mt-0.5 truncate">
            {video.error_message}
          </p>
        )}
      </div>

      {/* Statut */}
      <div className="shrink-0">
        <span
          className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${STATUS_BADGE[video.status]}`}
        >
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          )}
          {STATUS_LABELS[video.status]}
        </span>
      </div>

      {/* Date + expiry */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-xs text-white/40">{createdAt}</p>
        <p
          className={`text-xs mt-0.5 ${
            expiresIn <= 1
              ? "text-red-400/70"
              : expiresIn <= 3
              ? "text-yellow-400/70"
              : "text-white/20"
          }`}
        >
          {expiresIn > 0 ? `Expire dans ${expiresIn}j` : "Expiré"}
        </p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1">
        {video.status === "ready" && video.video_url && (
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            Télécharger
          </a>
        )}
        <DeleteButton videoId={video.id} />
      </div>
    </div>
  );
}
