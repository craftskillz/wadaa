import type { Table } from "dexie";

import { db } from "./database";
import type {
  LearningEntry,
  LearningPreset,
  UserSettings,
  WeeklyReview,
} from "./types";

type EntityWithId = {
  id: string;
};

function createCrudRepository<TRecord extends EntityWithId>(
  table: Table<TRecord, string>,
) {
  return {
    getAll() {
      return table.toArray();
    },
    getById(id: string) {
      return table.get(id);
    },
    put(record: TRecord) {
      return table.put(record);
    },
    bulkPut(records: TRecord[]) {
      return table.bulkPut(records);
    },
    delete(id: string) {
      return table.delete(id);
    },
    clear() {
      return table.clear();
    },
  };
}

export const entriesRepository = createCrudRepository<LearningEntry>(db.entries);
export const presetsRepository = createCrudRepository<LearningPreset>(db.presets);
export const weeklyReviewsRepository =
  createCrudRepository<WeeklyReview>(db.weeklyReviews);
export const settingsRepository = createCrudRepository<UserSettings>(db.settings);
