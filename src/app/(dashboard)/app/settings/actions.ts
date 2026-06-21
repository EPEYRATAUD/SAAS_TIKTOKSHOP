"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Supprimer les fichiers storage (best-effort)
  const { data: videos } = await supabase
    .from("videos")
    .select("storage_path")
    .eq("user_id", user.id)
    .not("storage_path", "is", null);

  const paths = (videos ?? [])
    .map((v) => v.storage_path as string)
    .filter(Boolean);

  if (paths.length > 0) {
    await supabase.storage.from("videos").remove(paths);
  }

  // Supprimer l'utilisateur auth (cascade → profiles + videos via FK)
  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(user.id);

  if (error) return { error: error.message };

  // Déconnexion + redirect
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: "Email introuvable" };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/app/settings`,
  });

  if (error) return { error: error.message };
  return {};
}
