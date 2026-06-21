"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Video } from "@/types/database";

const POLL_MS = 5_000;

const isActive = (status: Video["status"]) =>
  status === "pending" || status === "generating";

export function VideoGrid({
  initialVideos,
  generatingId,
}: {
  initialVideos: Video[];
  generatingId?: string;
}) {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>(initialVideos);

  // Ref → évite closure stale dans l'intervalle (jamais recréé)
  const activeIdsRef = useRef<Set<string>>(
    new Set(initialVideos.filter((v) => isActive(v.status)).map((v) => v.id))
  );

  // Maintenir activeIdsRef synchronisé après chaque update d'état
  useEffect(() => {
    activeIdsRef.current = new Set(
      videos.filter((v) => isActive(v.status)).map((v) => v.id)
    );
  });

  // Polling — intervalle stable, lit depuis le ref
  useEffect(() => {
    const poll = async () => {
      const ids = [...activeIdsRef.current];
      if (ids.length === 0) return;

      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/generate/status?video_id=${id}`);
            if (!res.ok) return;
            const data = (await res.json()) as Pick<
              Video,
              "status" | "video_url" | "thumbnail_url"
            >;
            setVideos((prev) =>
              prev.map((v) => (v.id === id ? { ...v, ...data } : v))
            );
          } catch {
            // réseau instable — réessaye au prochain tick
          }
        })
      );
    };

    poll(); // premier poll immédiat (rattrape état passé entre SSR et mount)
    const timerId = setInterval(poll, POLL_MS);
    return () => clearInterval(timerId);
  }, []); // mount only — ref évite stale closure

  // Nettoyage URL ?generating= dès que la vidéo atteint un état terminal
  useEffect(() => {
    if (!generatingId) return;
    const target = videos.find((v) => v.id === generatingId);
    if (target && !isActive(target.status)) {
      router.replace("/app", { scroll: false });
    }
  }, [videos, generatingId, router]);

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
        <p className="text-3xl mb-3">🎬</p>
        <p className="text-white/40 text-sm">Aucune vidéo pour l&apos;instant.</p>
        <p className="text-white/20 text-xs mt-1">
          Colle un lien produit ci-dessus pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          highlighted={video.id === generatingId}
        />
      ))}
    </div>
  );
}

function VideoCard({
  video,
  highlighted,
}: {
  video: Video;
  highlighted: boolean;
}) {
  const active = isActive(video.status);

  const statusConfig: Record<
    Video["status"],
    { label: string; color: string }
  > = {
    pending:    { label: "En attente",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    generating: { label: "Génération…",  color: "text-blue-400   bg-blue-400/10   border-blue-400/20"   },
    ready:      { label: "Prête",        color: "text-green-400  bg-green-400/10  border-green-400/20"  },
    failed:     { label: "Échec",        color: "text-red-400    bg-red-400/10    border-red-400/20"    },
  };

  const s = statusConfig[video.status];

  const expiresIn = Math.ceil(
    (new Date(video.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`rounded-xl border bg-white/5 overflow-hidden transition-colors group ${
        highlighted
          ? "border-[#FF2D55]/40 shadow-[0_0_20px_rgba(255,45,85,0.08)]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Thumbnail / Spinner */}
      <div className="aspect-[9/16] bg-white/5 relative flex items-center justify-center">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.product_title ?? "Vidéo"}
            className="w-full h-full object-cover"
          />
        ) : active ? (
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
            <p className="text-xs text-white/30 leading-snug">
              {video.status === "pending"
                ? "En attente de traitement…"
                : "Génération IA en cours…"}
            </p>
          </div>
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
            <span className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
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
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${s.color}`}
          >
            {active && (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
            )}
            {s.label}
          </span>
          <span className="text-xs text-white/20 shrink-0">
            {expiresIn > 0 ? `${expiresIn}j` : "Expiré"}
          </span>
        </div>
      </div>
    </div>
  );
}
