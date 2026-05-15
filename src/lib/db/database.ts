import Dexie, { type Table } from "dexie";

import type {
  LearningEntry,
  LearningPreset,
  UserSettings,
  WeeklyReview,
} from "./types";

const DATABASE_NAME = "what-did-you-learn-today";

export class LearningDatabase extends Dexie {
  entries!: Table<LearningEntry, string>;
  presets!: Table<LearningPreset, string>;
  weeklyReviews!: Table<WeeklyReview, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super(DATABASE_NAME);

    this.version(1).stores({
      entries: "id, date, source, presetId, createdAt, updatedAt",
      presets: "id, label, usageCount, createdAt, updatedAt",
      weeklyReviews: "id, weekStart, weekEnd, createdAt, updatedAt",
      settings: "id, userId, weekStartsOn, updatedAt",
    });
  }
}

export const db = new LearningDatabase();

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.db = db;
}
