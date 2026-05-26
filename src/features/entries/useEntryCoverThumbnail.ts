import { useEffect, useMemo } from "react";

export function useEntryCoverThumbnail(coverImage: Blob | undefined) {
  const objectUrl = useMemo(
    () => (coverImage ? URL.createObjectURL(coverImage) : undefined),
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
