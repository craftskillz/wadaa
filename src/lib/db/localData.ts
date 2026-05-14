import { db } from "./database";
import { parseLocalDataExport } from "./validation";
import type { LocalDataExport, LocalDataSummary } from "./types";

const LOCAL_DATA_SCHEMA_VERSION = 1;

export async function exportLocalData(): Promise<LocalDataExport> {
  const [entries, presets, weeklyReviews, settings] = await Promise.all([
    db.entries.toArray(),
    db.presets.toArray(),
    db.weeklyReviews.toArray(),
    db.settings.toArray(),
  ]);

  return {
    schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      entries,
      presets,
      weeklyReviews,
      settings,
    },
  };
}

export async function importLocalData(value: unknown) {
  const backup = parseLocalDataExport(value);

  await db.transaction(
    "rw",
    db.entries,
    db.presets,
    db.weeklyReviews,
    db.settings,
    async () => {
      await Promise.all([
        db.entries.clear(),
        db.presets.clear(),
        db.weeklyReviews.clear(),
        db.settings.clear(),
      ]);

      if (backup.data.entries.length > 0) {
        await db.entries.bulkPut(backup.data.entries);
      }

      if (backup.data.presets.length > 0) {
        await db.presets.bulkPut(backup.data.presets);
      }

      if (backup.data.weeklyReviews.length > 0) {
        await db.weeklyReviews.bulkPut(backup.data.weeklyReviews);
      }

      if (backup.data.settings.length > 0) {
        await db.settings.bulkPut(backup.data.settings);
      }
    },
  );
}

export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  const [entries, presets, weeklyReviews, settings] = await Promise.all([
    db.entries.count(),
    db.presets.count(),
    db.weeklyReviews.count(),
    db.settings.count(),
  ]);

  return {
    entries,
    presets,
    weeklyReviews,
    settings,
  };
}
