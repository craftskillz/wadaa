import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import { db } from "../../lib/db";
import type { LearningEntry, LearningPreset } from "../../lib/db";
import { getLastDaysKeys, getTodayDateKey } from "../../lib/dates";
import { EMPTY_PRESET_LABEL } from "./entryStorage";

export type TimelineDay = {
  dateKey: string;
  entries: LearningEntry[];
};

export type TimelineData = {
  days: TimelineDay[];
  todayKey: string;
  presets: LearningPreset[];
};

const INITIAL_DATA: TimelineData = {
  days: [],
  todayKey: getTodayDateKey(),
  presets: [],
};

export function useTimelineData(daysCount: number): TimelineData {
  const [data, setData] = useState<TimelineData>(() => ({
    ...INITIAL_DATA,
    todayKey: getTodayDateKey(),
    days: getLastDaysKeys(daysCount).map((dateKey) => ({
      dateKey,
      entries: [],
    })),
  }));

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const todayKey = getTodayDateKey();
      const dayKeys = getLastDaysKeys(daysCount);
      const oldestKey = dayKeys[0];

      const [windowEntries, allPresets] = await Promise.all([
        db.entries
          .where("date")
          .between(oldestKey, todayKey, true, true)
          .toArray(),
        db.presets.toArray(),
      ]);

      const entriesByDate = new Map<string, LearningEntry[]>();
      windowEntries.forEach((entry) => {
        const bucket = entriesByDate.get(entry.date) ?? [];
        bucket.push(entry);
        entriesByDate.set(entry.date, bucket);
      });

      const days: TimelineDay[] = dayKeys.map((dateKey) => ({
        dateKey,
        entries: (entriesByDate.get(dateKey) ?? []).sort((left, right) =>
          left.createdAt.localeCompare(right.createdAt),
        ),
      }));

      const presets = allPresets
        .filter(
          (preset) => !preset.archived && preset.label !== EMPTY_PRESET_LABEL,
        )
        .sort((left, right) => {
          const usageDifference = right.usageCount - left.usageCount;
          if (usageDifference !== 0) {
            return usageDifference;
          }
          return left.createdAt.localeCompare(right.createdAt);
        });

      return { days, presets, todayKey };
    }).subscribe({
      next(payload) {
        setData(payload);
      },
      error() {
        setData(INITIAL_DATA);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [daysCount]);

  return data;
}
