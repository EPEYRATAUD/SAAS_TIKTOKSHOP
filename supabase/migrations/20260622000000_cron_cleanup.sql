-- Extensions requises (activer dans Supabase Dashboard → Database → Extensions si nécessaire)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─────────────────────────────────────────────────────────────────────────────
-- Configurer l'URL du projet et le secret cron (à exécuter UNE FOIS manuellement
-- dans le SQL Editor Supabase après avoir défini CRON_SECRET dans les secrets
-- de l'Edge Function via : supabase secrets set CRON_SECRET=<valeur>)
--
--   ALTER DATABASE postgres SET app.supabase_url = 'https://XXXX.supabase.co';
--   ALTER DATABASE postgres SET app.cron_secret  = 'VOTRE_CRON_SECRET';
-- ─────────────────────────────────────────────────────────────────────────────

-- Supprimer l'ancien job si existe (idempotent)
SELECT cron.unschedule('cleanup-expired-videos')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-videos'
);

-- Planifier le nettoyage quotidien à 3h00 UTC
SELECT cron.schedule(
  'cleanup-expired-videos',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url     := current_setting('app.supabase_url')
               || '/functions/v1/cleanup-expired-videos',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body    := '{}'::jsonb
  );
  $$
);
