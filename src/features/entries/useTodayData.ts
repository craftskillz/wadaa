import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import { db } from "../../lib/db";
import type { LearningEntry, LearningPreset } from "../../lib/db";
import { getTodayDateKey } from "../../lib/dates";
import { EMPTY_PRESET_LABEL } from "./entryStorage";

const EMPTY_COLLECTIONS = {
  entries: [] as LearningEntry[],
  presets: [] as LearningPreset[],
};

export function useTodayData() {
  const [entries, setEntries] = useState<LearningEntry[]>(EMPTY_COLLECTIONS.entries);
  const [presets, setPresets] = useState<LearningPreset[]>(EMPTY_COLLECTIONS.presets);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const today = getTodayDateKey();
      const [todayEntries, activePresets] = await Promise.all([
        db.entries.where("date").equals(today).toArray(),
        db.presets.toArray(),
      ]);

      return {
        entries: todayEntries.sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
        presets: activePresets
          .filter(
            (preset) => !preset.archived && preset.label !== EMPTY_PRESET_LABEL,
          )
          .sort((left, right) => {
            const usageDifference = right.usageCount - left.usageCount;

            if (usageDifference !== 0) {
              return usageDifference;
            }

            return left.createdAt.localeCompare(right.createdAt);
          }),
      };
    }).subscribe({
      next(data) {
        setEntries(data.entries);
        setPresets(data.presets);
      },
      error() {
        setEntries(EMPTY_COLLECTIONS.entries);
        setPresets(EMPTY_COLLECTIONS.presets);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { entries, presets };
}
