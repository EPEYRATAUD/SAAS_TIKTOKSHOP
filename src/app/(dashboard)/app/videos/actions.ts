"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteVideo(videoId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { data: video } = await supabase
    .from("videos")
    .select("id, storage_path")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (!video) return { error: "Vidéo introuvable ou accès refusé" };

  if (video.storage_path) {
    await supabase.storage.from("videos").remove([video.storage_path]);
  }

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app/videos");
  return {};
}
