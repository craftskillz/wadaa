import { useEffect, useMemo } from "react";

export function useEntryCoverThumbnail(coverImage: Blob | undefined) {
  const objectUrl = useMemo(
    () =>
      coverImage instanceof Blob && coverImage.size > 0
        ? URL.createObjectURL(coverImage)
        : undefined,
    [coverImage],
  );

  useEffect(() => {
    if (!objectUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return objectUrl;
}

export function getYouTubeThumbnailUrl(entryUrl?: string) {
  if (!entryUrl) {
    return undefined;
  }

  try {
    const url = new URL(entryUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:shorts|embed)\/([^/?#]+)/)?.[1];

      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
