import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Plan } from "@/types/database";

// ── Mapping plan Whop → crédits ──────────────────────────────────────────────
// Configurer WHOP_PLAN_ID_STARTER / _PRO / _SCALE dans les env vars Vercel
// après avoir récupéré les IDs depuis le dashboard Whop.
const PLAN_MAP: Record<string, { plan: Plan; credits: number }> = {
  [process.env.WHOP_PLAN_ID_STARTER ?? "starter"]: { plan: "starter", credits: 15 },
  [process.env.WHOP_PLAN_ID_PRO ?? "pro"]: { plan: "pro", credits: 50 },
  [process.env.WHOP_PLAN_ID_SCALE ?? "scale"]: { plan: "scale", credits: 200 },
};

// ── Types payload Whop ────────────────────────────────────────────────────────
interface WhopUser {
  id: string;
  email: string;
}

interface WhopPlan {
  id: string;
  name: string;
}

interface WhopMembership {
  id: string;
  user: WhopUser;
  plan: WhopPlan;
  status: string;
}

interface WhopPayload {
  action: string;
  data: WhopMembership;
}

// ── Vérification signature HMAC-SHA256 ────────────────────────────────────────
async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[whop] WHOP_WEBHOOK_SECRET non configuré — signature ignorée");
    return process.env.NODE_ENV === "development"; // autorisé en dev uniquement
  }

  const signature = req.headers.get("whop-signature");
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hexDigest = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === `sha256=${hexDigest}`;
}

// ── Résoudre user_id Supabase depuis un email Whop ───────────────────────────
async function resolveUserId(
  supabase: ReturnType<typeof createServiceClient>,
  email: string,
  whopUserId: string
): Promise<string | null> {
  // 1. Chercher par whop_customer_id déjà connu (renouvellements)
  const { data: byWhopId } = await supabase
    .from("profiles")
    .select("id")
    .eq("whop_customer_id", whopUserId)
    .maybeSingle();

  if (byWhopId) return byWhopId.id;

  // 2. Première activation : chercher dans auth.users par email
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("[whop] Erreur listUsers:", error.message);
    return null;
  }

  const authUser = users.find((u) => u.email === email);
  return authUser?.id ?? null;
}

// ── Handler principal ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!(await verifySignature(req, rawBody))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WhopPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, data } = payload;
  const supabase = createServiceClient();

  console.info(`[whop] Event: ${action} | plan: ${data.plan?.id} | user: ${data.user?.email}`);

  // ── membership.went_valid : activation ou renouvellement ──────────────────
  if (action === "membership.went_valid") {
    const planInfo = PLAN_MAP[data.plan?.id];
    if (!planInfo) {
      console.warn(`[whop] Plan ID inconnu: "${data.plan?.id}" — configurer WHOP_PLAN_ID_*`);
      return NextResponse.json({ ok: true }); // 200 pour éviter retry Whop
    }

    const userId = await resolveUserId(supabase, data.user.email, data.user.id);
    if (!userId) {
      console.warn(`[whop] Aucun compte Supabase pour: ${data.user.email}`);
      return NextResponse.json({ ok: true }); // pas encore inscrit sur notre app
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        plan: planInfo.plan,
        credits: planInfo.credits,
        whop_customer_id: data.user.id,
      })
      .eq("id", userId);

    if (error) {
      console.error("[whop] Erreur update profile:", error.message);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.info(`[whop] Profil mis à jour — user: ${userId} | plan: ${planInfo.plan} | crédits: ${planInfo.credits}`);
    return NextResponse.json({ ok: true });
  }

  // ── membership.went_invalid : annulation ou expiration ───────────────────
  if (action === "membership.went_invalid") {
    const userId = await resolveUserId(supabase, data.user.email, data.user.id);
    if (!userId) return NextResponse.json({ ok: true });

    const { error } = await supabase
      .from("profiles")
      .update({ plan: "free" })
      .eq("id", userId);

    if (error) {
      console.error("[whop] Erreur downgrade plan:", error.message);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.info(`[whop] Plan rétrogradé → free | user: ${userId}`);
    return NextResponse.json({ ok: true });
  }

  // Événement non géré — toujours 200 pour éviter retry Whop
  return NextResponse.json({ ok: true, skipped: action });
}
