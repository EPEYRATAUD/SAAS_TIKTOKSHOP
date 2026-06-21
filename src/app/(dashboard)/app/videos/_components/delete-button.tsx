"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVideo } from "../actions";

export function DeleteButton({ videoId }: { videoId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Supprimer définitivement cette vidéo ?")) return;
    startTransition(async () => {
      const result = await deleteVideo(videoId);
      if (result.error) {
        alert(`Erreur : ${result.error}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
    >
      {isPending ? "…" : "Supprimer"}
    </button>
  );
}
