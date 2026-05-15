import { useCallback, useEffect, useRef, useState } from "react";

import type { StatusToastTone, StatusToastValue } from "./StatusToast";

const STATUS_TOAST_VISIBLE_MS = 2800;
const STATUS_TOAST_FADE_MS = 300;

export function useStatusToast() {
  const [statusToast, setStatusToast] = useState<StatusToastValue | null>(null);
  const [isStatusToastVisible, setIsStatusToastVisible] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    if (!statusToast) {
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsStatusToastVisible(false);
    }, STATUS_TOAST_VISIBLE_MS);
    const clearTimer = window.setTimeout(() => {
      setStatusToast((current) =>
        current?.id === statusToast.id ? null : current,
      );
    }, STATUS_TOAST_VISIBLE_MS + STATUS_TOAST_FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [statusToast]);

  const showStatusToast = useCallback(
    (message: string, tone: StatusToastTone = "success") => {
      idRef.current += 1;
      setIsStatusToastVisible(true);
      setStatusToast({ id: idRef.current, message, tone });
    },
    [],
  );

  return { statusToast, isStatusToastVisible, showStatusToast };
}
