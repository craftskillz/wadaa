import { useEffect, useState } from "react";
import { liveQuery } from "dexie";

import { db, type LearningEntry } from "../../lib/db";

export const FALLBACK_RATING = 0;

export type DailySummary = {
  dateKey: string;
  entries: LearningEntry[];
  totalScore: number;
  keptCount: number;
};

type MonthlyEntriesState = {
  byDate: Map<string, DailySummary>;
  isLoading: boolean;
};

const INITIAL_STATE: MonthlyEntriesState = {
  byDate: new Map(),
  isLoading: true,
};

function buildSummary(entries: LearningEntry[]): Map<string, DailySummary> {
  const byDate = new Map<string, DailySummary>();

  for (const entry of entries) {
    if (!entry.kept || entry.discarded || entry.source === "empty") {
      continue;
    }

    const current = byDate.get(entry.date) ?? {
      dateKey: entry.date,
      entries: [],
      totalScore: 0,
      keptCount: 0,
    };

    current.entries.push(entry);
    current.totalScore += entry.rating ?? FALLBACK_RATING;
    current.keptCount += 1;
    byDate.set(entry.date, current);
  }

  for (const summary of byDate.values()) {
    summary.entries.sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt),
    );
  }

  return byDate;
}

export function useMonthlyEntries(): MonthlyEntriesState {
  const [state, setState] = useState<MonthlyEntriesState>(INITIAL_STATE);

  useEffect(() => {
    const subscription = liveQuery(() => db.entries.toArray()).subscribe({
      next(entries) {
        setState({ byDate: buildSummary(entries), isLoading: false });
      },
      error() {
        setState({ byDate: new Map(), isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
