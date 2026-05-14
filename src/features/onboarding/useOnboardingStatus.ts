import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import { LOCAL_SETTINGS_ID } from "../../lib/db";
import { settingsRepository } from "../../lib/db";

type OnboardingStatus = "loading" | "complete" | "missing";

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    const subscription = liveQuery(() =>
      settingsRepository.getById(LOCAL_SETTINGS_ID),
    ).subscribe({
      next(settings) {
        setStatus(settings ? "complete" : "missing");
      },
      error() {
        setStatus("missing");
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return status;
}
