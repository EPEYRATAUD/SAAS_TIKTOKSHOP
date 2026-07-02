import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerVideoGeneration, syncVideoStatus } from "@/lib/generate-video";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const videoId = req.nextUrl.searchParams.get("video_id");
  if (!videoId) return NextResponse.json({ error: "Missing video_id" }, { status: 400 });

  // Vérif ownership
  const { data: video } = await supabase
    .from("videos")
    .select("id, status, video_url, thumbnail_url, higgsfield_job_id")
    .eq("id", videoId)
    .eq("user_id", user.id)
    .single();

  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // pending → déclenche la génération (after() non fiable en dev)
  if (video.status === "pending") {
    console.log(`[status] video ${videoId} pending → triggering generation`);
    try {
      await triggerVideoGeneration(videoId);
      console.log(`[status] video ${videoId} generation triggered OK`);
    } catch (err) {
      console.error(`[status] video ${videoId} trigger failed:`, err);
    }
    const { data: updated } = await supabase
      .from("videos")
      .select("status, video_url, thumbnail_url")
      .eq("id", videoId)
      .single();
    console.log(`[status] video ${videoId} after trigger: status=${updated?.status}`);
    return NextResponse.json(updated ?? video);
  }

  // generating → synchro avec Higgsfield
  if (video.status === "generating" && video.higgsfield_job_id) {
    await syncVideoStatus(videoId);

    const { data: updated } = await supabase
      .from("videos")
      .select("status, video_url, thumbnail_url")
      .eq("id", videoId)
      .single();

    return NextResponse.json(updated ?? video);
  }

  return NextResponse.json({
    status: video.status,
    video_url: video.video_url,
    thumbnail_url: video.thumbnail_url,
  });
}
