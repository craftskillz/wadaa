import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import {
  db,
  LOCAL_SETTINGS_ID,
  type LearningEntry,
  type UserSettings,
  type WeekStartDay,
  type WeeklyReview,
} from "../../lib/db";
import type { WeekRange } from "../../lib/dates";
import { buildWeeklyReviewId } from "./reviewStorage";

type WeekReviewData = {
  entries: LearningEntry[];
  review: WeeklyReview | undefined;
  isLoading: boolean;
};

const INITIAL_DATA: WeekReviewData = {
  entries: [],
  review: undefined,
  isLoading: true,
};

function buildRangeKey(range: WeekRange) {
  return `${range.weekStart}_${range.weekEnd}`;
}

export function useWeekReviewData(range: WeekRange): WeekReviewData {
  const [data, setData] = useState<WeekReviewData>(INITIAL_DATA);
  const [trackedRangeKey, setTrackedRangeKey] = useState<string | null>(null);
  const currentRangeKey = buildRangeKey(range);

  if (trackedRangeKey !== currentRangeKey) {
    setTrackedRangeKey(currentRangeKey);
    setData({ entries: [], review: undefined, isLoading: true });
  }

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const [entries, review] = await Promise.all([
        db.entries
          .where("date")
          .between(range.weekStart, range.weekEnd, true, true)
          .toArray(),
        db.weeklyReviews.get(buildWeeklyReviewId(range.weekStart)),
      ]);

      return {
        entries: entries
          .filter((entry) => entry.source !== "empty")
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
        review,
      };
    }).subscribe({
      next(payload) {
        setData({
          entries: payload.entries,
          review: payload.review,
          isLoading: false,
        });
      },
      error() {
        setData({ entries: [], review: undefined, isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [range.weekStart, range.weekEnd]);

  return data;
}

type WeekStartSetting = {
  weekStartsOn: WeekStartDay;
  isLoading: boolean;
};

const DEFAULT_WEEK_START: WeekStartDay = "monday";

export function useWeekStartSetting(): WeekStartSetting {
  const [setting, setSetting] = useState<WeekStartSetting>({
    weekStartsOn: DEFAULT_WEEK_START,
    isLoading: true,
  });

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const settings = (await db.settings.get(LOCAL_SETTINGS_ID)) as
        | UserSettings
        | undefined;
      return settings?.weekStartsOn ?? DEFAULT_WEEK_START;
    }).subscribe({
      next(weekStartsOn) {
        setSetting({ weekStartsOn, isLoading: false });
      },
      error() {
        setSetting({ weekStartsOn: DEFAULT_WEEK_START, isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return setting;
}
