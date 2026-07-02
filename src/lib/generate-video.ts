import { createAdminClient } from "@/lib/supabase/admin";
import { submitVideoGeneration } from "@/lib/higgsfield";
import { extractProductInfo } from "@/lib/product-scraper";

export async function triggerVideoGeneration(videoId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: video } = await supabase
    .from("videos")
    .select("product_url, product_image_url, user_id")
    .eq("id", videoId)
    .single();

  if (!video) throw new Error(`Video ${videoId} not found`);

  let imageUrl: string;
  let productTitle: string | null = null;

  if (video.product_image_url) {
    // Image déjà fournie (bypass scraper)
    imageUrl = video.product_image_url;
  } else {
    // 1. Extraction infos produit
    let product: Awaited<ReturnType<typeof extractProductInfo>>;
    try {
      product = await extractProductInfo(video.product_url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await supabase.from("videos").update({
        status: "failed",
        error_message: errorMessage,
      }).eq("id", videoId);
      throw err;
    }

    if (!product.imageUrl) {
      await supabase.from("videos").update({
        status: "failed",
        product_title: product.title,
        error_message: "Impossible d'extraire l'image produit depuis l'URL fournie.",
      }).eq("id", videoId);
      throw new Error("Impossible d'extraire l'image produit depuis l'URL fournie.");
    }

    imageUrl = product.imageUrl;
    productTitle = product.title;
  }

  await supabase.from("videos").update({
    product_title: productTitle,
    product_image_url: imageUrl,
    status: "generating",
  }).eq("id", videoId);

  // 2. Prompt UGC
  const productName = productTitle ?? "ce produit";
  const prompt = [
    `UGC TikTok video showcase for ${productName}.`,
    "Creator picks up the product, inspects it with genuine curiosity,",
    "reacts with authentic excitement and satisfaction.",
    "Handheld camera, natural warm lighting, vertical 9:16 format.",
    "Realistic skin, natural movement, no CGI feel.",
  ].join(" ");

  // 3. Submit Higgsfield — remboursement crédit si échec
  try {
    const result = await submitVideoGeneration({
      imageUrl,
      prompt,
    });

    console.log("[higgsfield] submit result:", JSON.stringify(result));

    await supabase.from("videos").update({
      higgsfield_job_id: result.request_id,
    }).eq("id", videoId);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Remboursement atomique : lecture puis écriture (chemin d'erreur, pas de concurrence)
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", video.user_id)
      .single();

    await supabase
      .from("profiles")
      .update({ credits: (profile?.credits ?? 0) + 1 })
      .eq("id", video.user_id);

    await supabase.from("videos").update({
      status: "failed",
      error_message: errorMessage,
    }).eq("id", videoId);

    throw err;
  }
}

export async function syncVideoStatus(videoId: string): Promise<void> {
  const { getGenerationStatus } = await import("@/lib/higgsfield");
  const supabase = createAdminClient();

  const { data: video } = await supabase
    .from("videos")
    .select("higgsfield_job_id, status")
    .eq("id", videoId)
    .single();

  if (!video?.higgsfield_job_id || video.status === "ready" || video.status === "failed") return;

  const statusResult = await getGenerationStatus(video.higgsfield_job_id);

  if (statusResult.status === "completed" && statusResult.video?.url) {
    await supabase.from("videos").update({
      status: "ready",
      video_url: statusResult.video.url,
      thumbnail_url: statusResult.images?.[0]?.url ?? null,
    }).eq("id", videoId);
  } else if (statusResult.status === "failed" || statusResult.status === "nsfw") {
    await supabase.from("videos").update({
      status: "failed",
      error_message: statusResult.error ?? statusResult.status,
    }).eq("id", videoId);
  }
}
