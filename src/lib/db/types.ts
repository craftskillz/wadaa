export const LOCAL_SETTINGS_ID = "local";

export type WeekStartDay = "monday" | "sunday";
export type EntrySource = "preset" | "custom" | "empty";
export type EntryMood = "low" | "neutral" | "high";
export type EntryRating = 1 | 2 | 3 | 4 | 5;

export type UserSettings = {
  id: typeof LOCAL_SETTINGS_ID;
  userId?: string;
  displayName?: string;
  reminderTimes: string[];
  weekStartsOn: WeekStartDay;
  createdAt: string;
  updatedAt: string;
};

export type LearningEntry = {
  id: string;
  date: string;
  content: string;
  source: EntrySource;
  presetId?: string;
  mood?: EntryMood;
  rating?: EntryRating;
  kept: boolean;
  discarded: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LearningPreset = {
  id: string;
  label: string;
  emoji?: string;
  usageCount: number;
  createdFromEntryId?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyReview = {
  id: string;
  weekStart: string;
  weekEnd: string;
  selectedEntryIds: string[];
  discardedEntryIds: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
};

export type LocalData = {
  entries: LearningEntry[];
  presets: LearningPreset[];
  weeklyReviews: WeeklyReview[];
  settings: UserSettings[];
};

export type LocalDataSummary = {
  entries: number;
  presets: number;
  weeklyReviews: number;
  settings: number;
};

export type LocalDataExport = {
  schemaVersion: 1;
  exportedAt: string;
  data: LocalData;
};
