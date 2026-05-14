import {
  LOCAL_SETTINGS_ID,
  type EntryMood,
  type EntryRating,
  type EntrySource,
  type LearningEntry,
  type LearningPreset,
  type LocalDataExport,
  type UserSettings,
  type WeekStartDay,
  type WeeklyReview,
} from "./types";

const SUPPORTED_SCHEMA_VERSION = 1;
const entrySources = new Set<EntrySource>(["preset", "custom", "empty"]);
const entryMoods = new Set<EntryMood>(["low", "neutral", "high"]);
const entryRatings = new Set<EntryRating>([1, 2, 3, 4, 5]);
const weekStartDays = new Set<WeekStartDay>(["monday", "sunday"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isEntrySource(value: unknown): value is EntrySource {
  return isString(value) && entrySources.has(value as EntrySource);
}

function isEntryMood(value: unknown): value is EntryMood | undefined {
  return (
    value === undefined ||
    (isString(value) && entryMoods.has(value as EntryMood))
  );
}

function isEntryRating(value: unknown): value is EntryRating | undefined {
  return (
    value === undefined ||
    (isNumber(value) && entryRatings.has(value as EntryRating))
  );
}

function isWeekStartDay(value: unknown): value is WeekStartDay {
  return isString(value) && weekStartDays.has(value as WeekStartDay);
}

function isUserSettings(value: unknown): value is UserSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.id === LOCAL_SETTINGS_ID &&
    isOptionalString(value.userId) &&
    isOptionalString(value.displayName) &&
    isStringArray(value.reminderTimes) &&
    isWeekStartDay(value.weekStartsOn) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isLearningEntry(value: unknown): value is LearningEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.date) &&
    isString(value.content) &&
    isOptionalString(value.description) &&
    isOptionalString(value.url) &&
    isEntrySource(value.source) &&
    isOptionalString(value.presetId) &&
    isEntryMood(value.mood) &&
    isEntryRating(value.rating) &&
    isBoolean(value.kept) &&
    isBoolean(value.discarded) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isLearningPreset(value: unknown): value is LearningPreset {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.label) &&
    isOptionalString(value.emoji) &&
    isNumber(value.usageCount) &&
    isOptionalString(value.createdFromEntryId) &&
    isBoolean(value.archived) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isWeeklyReview(value: unknown): value is WeeklyReview {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.weekStart) &&
    isString(value.weekEnd) &&
    isStringArray(value.selectedEntryIds) &&
    isStringArray(value.discardedEntryIds) &&
    isOptionalString(value.summary) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function assertTable<TRecord>(
  value: unknown,
  name: string,
  guard: (item: unknown) => item is TRecord,
): asserts value is TRecord[] {
  if (!Array.isArray(value) || !value.every(guard)) {
    throw new Error(`Import JSON invalide : table ${name} incorrecte.`);
  }
}

export function parseLocalDataExport(value: unknown): LocalDataExport {
  if (!isRecord(value)) {
    throw new Error("Import JSON invalide : le fichier doit contenir un objet.");
  }

  if (value.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error("Import JSON invalide : version de schéma non supportée.");
  }

  if (!isString(value.exportedAt) || !isRecord(value.data)) {
    throw new Error("Import JSON invalide : métadonnées manquantes.");
  }

  assertTable(value.data.entries, "entries", isLearningEntry);
  assertTable(value.data.presets, "presets", isLearningPreset);
  assertTable(value.data.weeklyReviews, "weeklyReviews", isWeeklyReview);
  assertTable(value.data.settings, "settings", isUserSettings);

  return {
    schemaVersion: SUPPORTED_SCHEMA_VERSION,
    exportedAt: value.exportedAt,
    data: {
      entries: value.data.entries,
      presets: value.data.presets,
      weeklyReviews: value.data.weeklyReviews,
      settings: value.data.settings,
    },
  };
}
