const BASE_URL = "https://platform.higgsfield.ai";

function authHeader(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HIGGSFIELD_API_SECRET;
  if (!key) throw new Error("HIGGSFIELD_API_KEY not set");
  return `Key ${secret ? `${key}:${secret}` : key}`;
}

export interface SubmitResult {
  request_id: string; // mappé depuis response.id
  job_id: string;     // mappé depuis response.jobs[0].id
  status: string;
}

export interface StatusResult {
  request_id: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "nsfw";
  video?: { url: string };
  images?: { url: string }[];
  error?: string;
}

export async function submitVideoGeneration({
  imageUrl,
  prompt,
}: {
  imageUrl: string;
  prompt: string;
}): Promise<SubmitResult> {
  const model = process.env.HIGGSFIELD_MODEL ?? "dop-turbo";

  const res = await fetch(`${BASE_URL}/v1/image2video/dop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      params: {
        model,
        prompt,
        input_images: [{ type: "image_url", image_url: imageUrl }],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Higgsfield submit failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  console.log("[higgsfield] raw submit response:", JSON.stringify(json));
  return {
    request_id: json.id,
    job_id: json.jobs?.[0]?.id ?? "",
    status: json.jobs?.[0]?.status ?? "queued",
  };
}

export async function getGenerationStatus(requestId: string): Promise<StatusResult> {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Higgsfield status failed (${res.status})`);
  }

  const json = await res.json();
  console.log("[higgsfield] raw status response:", JSON.stringify(json));
  return json;
}

export async function cancelGeneration(requestId: string): Promise<void> {
  await fetch(`${BASE_URL}/requests/${requestId}/cancel`, {
    method: "POST",
    headers: { Authorization: authHeader() },
  });
}
