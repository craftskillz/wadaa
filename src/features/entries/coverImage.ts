import { entriesRepository } from "../../lib/db";

const COVER_IMAGE_MAX_WIDTH = 720;
const COVER_IMAGE_JPEG_QUALITY = 0.8;
const COVER_IMAGE_MIME_TYPE = "image/jpeg";
const FAVICON_SIZE = 128;
const MICROLINK_ENDPOINT = "https://api.microlink.io/";
const DUCKDUCKGO_FAVICON_ENDPOINT = "https://icons.duckduckgo.com/ip3/";

type MicrolinkEmbed = "image.url" | "logo.url";

function getYouTubeThumbnailFromUrl(parsedUrl: URL): string | undefined {
  const hostname = parsedUrl.hostname.replace(/^www\./, "");

  if (hostname === "youtu.be") {
    const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : undefined;
  }

  if (hostname === "youtube.com" || hostname === "m.youtube.com") {
    const videoId =
      parsedUrl.searchParams.get("v") ??
      parsedUrl.pathname.match(/^\/(?:shorts|embed)\/([^/?#]+)/)?.[1];

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : undefined;
  }

  return undefined;
}

async function fetchAsBlob(url: string): Promise<Blob | undefined> {
  try {
    const response = await fetch(url, { mode: "cors", credentials: "omit" });

    if (!response.ok) {
      return undefined;
    }

    const blob = await response.blob();
    return blob.size > 0 ? blob : undefined;
  } catch {
    return undefined;
  }
}

function buildMicrolinkEmbedUrl(targetUrl: string, embed: MicrolinkEmbed): string {
  return `${MICROLINK_ENDPOINT}?url=${encodeURIComponent(targetUrl)}&embed=${embed}`;
}

function getFaviconUrl(parsedUrl: URL): string {
  return `${DUCKDUCKGO_FAVICON_ENDPOINT}size/${FAVICON_SIZE}/${parsedUrl.hostname}.ico`;
}

async function resizeImageBlob(blob: Blob): Promise<Blob> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return blob;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return blob;
  }

  try {
    if (bitmap.width <= COVER_IMAGE_MAX_WIDTH) {
      return blob;
    }

    const scale = COVER_IMAGE_MAX_WIDTH / bitmap.width;
    const targetWidth = COVER_IMAGE_MAX_WIDTH;
    const targetHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      return blob;
    }

    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const resized = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, COVER_IMAGE_MIME_TYPE, COVER_IMAGE_JPEG_QUALITY);
    });

    return resized ?? blob;
  } finally {
    bitmap.close?.();
  }
}

export function prepareCoverImageBlob(blob: Blob): Promise<Blob> {
  return resizeImageBlob(blob);
}

async function resolveCoverBlob(entryUrl: string): Promise<Blob | undefined> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(entryUrl);
  } catch {
    return undefined;
  }

  const youtubeThumbnail = getYouTubeThumbnailFromUrl(parsedUrl);
  if (youtubeThumbnail) {
    const blob = await fetchAsBlob(youtubeThumbnail);
    if (blob) {
      return blob;
    }
  }

  const ogImageBlob = await fetchAsBlob(
    buildMicrolinkEmbedUrl(parsedUrl.toString(), "image.url"),
  );
  if (ogImageBlob) {
    return ogImageBlob;
  }

  const logoBlob = await fetchAsBlob(
    buildMicrolinkEmbedUrl(parsedUrl.toString(), "logo.url"),
  );
  if (logoBlob) {
    return logoBlob;
  }

  return fetchAsBlob(getFaviconUrl(parsedUrl));
}

export async function resolveAndStoreCoverImage(
  entryId: string,
  entryUrl: string,
): Promise<void> {
  const rawBlob = await resolveCoverBlob(entryUrl);

  if (!rawBlob) {
    return;
  }

  const finalBlob = await resizeImageBlob(rawBlob);
  const entry = await entriesRepository.getById(entryId);

  if (!entry || entry.url !== entryUrl) {
    return;
  }

  await entriesRepository.put({
    ...entry,
    coverImage: finalBlob,
    updatedAt: new Date().toISOString(),
  });
}
