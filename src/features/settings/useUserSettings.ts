import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import {
  LOCAL_SETTINGS_ID,
  settingsRepository,
  type UserSettings,
} from "../../lib/db";

type UserSettingsState = {
  settings: UserSettings | undefined;
  isLoading: boolean;
};

const INITIAL_STATE: UserSettingsState = {
  settings: undefined,
  isLoading: true,
};

export function useUserSettings(): UserSettingsState {
  const [state, setState] = useState<UserSettingsState>(INITIAL_STATE);

  useEffect(() => {
    const subscription = liveQuery(() =>
      settingsRepository.getById(LOCAL_SETTINGS_ID),
    ).subscribe({
      next(settings) {
        setState({ settings, isLoading: false });
      },
      error() {
        setState({ settings: undefined, isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
