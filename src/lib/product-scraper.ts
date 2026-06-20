export interface ProductInfo {
  title: string | null;
  imageUrl: string | null;
  description: string | null;
}

export async function extractProductInfo(url: string): Promise<ProductInfo> {
  const result: ProductInfo = { title: null, imageUrl: null, description: null };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return result;

    const html = await res.text();

    // OG tags
    result.title = extractMeta(html, "og:title") ?? extractMeta(html, "title");
    result.imageUrl = extractMeta(html, "og:image");
    result.description = extractMeta(html, "og:description") ?? extractMeta(html, "description");

    // JSON-LD fallback (TikTok Shop embeds product data)
    if (!result.imageUrl || !result.title) {
      const jsonLd = extractJsonLd(html);
      if (jsonLd) {
        result.title ??= typeof jsonLd.name === "string" ? jsonLd.name : null;
        const img = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
        result.imageUrl ??= typeof img === "string" ? img : null;
        result.description ??= typeof jsonLd.description === "string" ? jsonLd.description : null;
      }
    }
  } catch {
    // Network error or timeout — return empty result
  }

  return result;
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];

  if (property === "title") {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim();
  }

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const match = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}
