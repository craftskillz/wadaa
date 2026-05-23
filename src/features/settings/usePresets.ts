import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import { presetsRepository, type LearningPreset } from "../../lib/db";

type PresetsState = {
  presets: LearningPreset[];
  isLoading: boolean;
};

const INITIAL_STATE: PresetsState = {
  presets: [],
  isLoading: true,
};

export function usePresets(): PresetsState {
  const [state, setState] = useState<PresetsState>(INITIAL_STATE);

  useEffect(() => {
    const subscription = liveQuery(() => presetsRepository.getAll()).subscribe({
      next(presets) {
        setState({
          presets: [...presets].sort((left, right) =>
            left.label.localeCompare(right.label, "fr-FR"),
          ),
          isLoading: false,
        });
      },
      error() {
        setState({ presets: [], isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
