"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerVideoGeneration } from "@/lib/generate-video";
import type { Profile } from "@/types/database";

export async function generateVideo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const productUrl = formData.get("product_url") as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single<Pick<Profile, "credits">>();

  if (!profile || profile.credits <= 0) {
    redirect("/app?error=no-credits");
  }

  const { data: video, error } = await supabase
    .from("videos")
    .insert({ user_id: user.id, product_url: productUrl, status: "pending" })
    .select()
    .single();

  if (error || !video) redirect("/app?error=db-error");

  await supabase
    .from("profiles")
    .update({ credits: profile.credits - 1 })
    .eq("id", user.id);

  // Déclenche la génération Higgsfield après la réponse (non bloquant)
  after(async () => {
    try {
      await triggerVideoGeneration(video.id);
    } catch (err) {
      console.error(`[generate] video ${video.id} failed:`, err);
    }
  });

  redirect(`/app?generating=${video.id}`);
}
