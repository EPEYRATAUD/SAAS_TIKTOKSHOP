import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 100;

Deno.serve(async (req: Request) => {
  // Vérification CRON_SECRET (optionnel mais recommandé)
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const now = new Date().toISOString();

  const { data: expired, error: fetchError } = await supabase
    .from("videos")
    .select("id, storage_path")
    .lt("expires_at", now)
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error("[cleanup] Fetch error:", fetchError.message);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!expired || expired.length === 0) {
    console.info("[cleanup] Rien à supprimer.");
    return new Response(JSON.stringify({ deleted: 0, storage: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Supprimer les fichiers Supabase Storage
  const paths = expired
    .map((v) => v.storage_path as string | null)
    .filter((p): p is string => Boolean(p));

  let storageDeleted = 0;
  if (paths.length > 0) {
    const { data: removed, error: storageError } = await supabase.storage
      .from("videos")
      .remove(paths);
    if (storageError) {
      console.warn("[cleanup] Storage error:", storageError.message);
    } else {
      storageDeleted = removed?.length ?? 0;
    }
  }

  // Supprimer les lignes en base
  const ids = expired.map((v) => v.id as string);
  const { error: deleteError } = await supabase
    .from("videos")
    .delete()
    .in("id", ids);

  if (deleteError) {
    console.error("[cleanup] Delete error:", deleteError.message);
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.info(
    `[cleanup] ${ids.length} vidéos supprimées, ${storageDeleted} fichiers storage nettoyés.`
  );

  return new Response(
    JSON.stringify({ deleted: ids.length, storage: storageDeleted }),
    { headers: { "Content-Type": "application/json" } }
  );
});
