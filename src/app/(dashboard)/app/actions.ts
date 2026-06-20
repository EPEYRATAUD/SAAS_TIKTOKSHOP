"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function generateVideo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const productUrl = formData.get("product_url") as string;

  // Vérif crédits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single<Pick<Profile, "credits">>();

  if (!profile || profile.credits <= 0) {
    redirect("/app?error=no-credits");
  }

  // Crée l'entrée vidéo en statut pending
  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      product_url: productUrl,
      status: "pending",
    })
    .select()
    .single();

  if (error || !video) {
    redirect("/app?error=db-error");
  }

  // Décrémente 1 crédit
  await supabase
    .from("profiles")
    .update({ credits: profile.credits - 1 })
    .eq("id", user.id);

  // TODO: déclencher l'appel Higgsfield API via une route API ou queue
  // Pour l'instant redirect avec l'id vidéo pour polling futur
  redirect(`/app?generating=${video.id}`);
}
