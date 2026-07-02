"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";

export async function generateVideo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const productUrl = formData.get("product_url") as string;
  const imageFile = formData.get("product_image") as File | null;

  // Upload image si fournie
  let productImageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const admin = createAdminClient();
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = await imageFile.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(filePath, bytes, { contentType: imageFile.type, upsert: false });

    if (!uploadError) {
      const { data: { publicUrl } } = admin.storage
        .from("product-images")
        .getPublicUrl(filePath);
      productImageUrl = publicUrl;
    }
  }

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
    .insert({ user_id: user.id, product_url: productUrl, product_image_url: productImageUrl, status: "pending" })
    .select()
    .single();

  if (error || !video) redirect("/app?error=db-error");

  await supabase
    .from("profiles")
    .update({ credits: profile.credits - 1 })
    .eq("id", user.id);

  redirect(`/app?generating=${video.id}`);
}
