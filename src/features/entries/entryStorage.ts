import { db, entriesRepository, presetsRepository } from "../../lib/db";
import type { LearningEntry, LearningPreset } from "../../lib/db";
import { getTodayDateKey } from "../../lib/dates";
import { createId } from "../../lib/ids";

const ENTRY_ID_PREFIX = "entry";
export const EMPTY_ENTRY_CONTENT = "Rien pour le moment";
export const EMPTY_PRESET_LABEL = "Je n'ai rien appris pour le moment";

function createBaseEntry(
  source: LearningEntry["source"],
  content: string,
  presetId?: string,
): LearningEntry {
  const now = new Date().toISOString();

  return {
    id: createId(ENTRY_ID_PREFIX),
    date: getTodayDateKey(),
    content,
    source,
    presetId,
    kept: false,
    discarded: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function isEmptyPreset(preset: LearningPreset) {
  return preset.label === EMPTY_PRESET_LABEL;
}

export async function createEntryFromPreset(preset: LearningPreset) {
  if (isEmptyPreset(preset)) {
    return createEmptyEntry();
  }

  const entry = createBaseEntry("preset", preset.label, preset.id);
  const updatedAt = new Date().toISOString();

  await db.transaction("rw", db.entries, db.presets, async () => {
    await entriesRepository.put(entry);
    await presetsRepository.put({
      ...preset,
      usageCount: preset.usageCount + 1,
      updatedAt,
    });
  });
}

export async function createCustomEntry(content: string) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return;
  }

  await entriesRepository.put(createBaseEntry("custom", trimmedContent));
}

export function createEmptyEntry() {
  return entriesRepository.put(createBaseEntry("empty", EMPTY_ENTRY_CONTENT));
}

export function deleteEntry(entryId: string) {
  return entriesRepository.delete(entryId);
}
