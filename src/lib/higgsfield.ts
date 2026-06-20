const BASE_URL = "https://platform.higgsfield.ai";

function authHeader(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HIGGSFIELD_API_SECRET;
  if (!key) throw new Error("HIGGSFIELD_API_KEY not set");
  return `Key ${secret ? `${key}:${secret}` : key}`;
}

export interface SubmitResult {
  request_id: string;
  status: string;
  status_url: string;
  cancel_url: string;
}

export interface StatusResult {
  request_id: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "nsfw";
  video_url?: string;
  image_url?: string;
  error?: string;
}

export async function submitVideoGeneration({
  imageUrl,
  prompt,
  duration = 5,
}: {
  imageUrl: string;
  prompt: string;
  duration?: number;
}): Promise<SubmitResult> {
  const model = process.env.HIGGSFIELD_MODEL ?? "higgsfield-ai/dop/standard";

  const res = await fetch(`${BASE_URL}/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({ image_url: imageUrl, prompt, duration }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Higgsfield submit failed (${res.status}): ${body}`);
  }

  return res.json();
}

export async function getGenerationStatus(requestId: string): Promise<StatusResult> {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Higgsfield status failed (${res.status})`);
  }

  return res.json();
}

export async function cancelGeneration(requestId: string): Promise<void> {
  await fetch(`${BASE_URL}/requests/${requestId}/cancel`, {
    method: "POST",
    headers: { Authorization: authHeader() },
  });
}
