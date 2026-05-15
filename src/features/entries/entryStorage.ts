import { db, entriesRepository, presetsRepository } from "../../lib/db";
import type { LearningEntry, LearningPreset } from "../../lib/db";
import { getTodayDateKey } from "../../lib/dates";
import { createId } from "../../lib/ids";
import { resolveAndStoreCoverImage } from "./coverImage";

const ENTRY_ID_PREFIX = "entry";
const PRESET_ID_PREFIX = "preset";
export const EMPTY_ENTRY_CONTENT = "Rien pour le moment";
export const EMPTY_PRESET_LABEL = "Je n'ai rien appris pour le moment";

type CreatePresetFromEntryResult = {
  preset: LearningPreset;
  status: "created" | "alreadyExists" | "restored";
};

type EntryDetails = {
  description?: string;
  url?: string;
};

function createBaseEntry(
  source: LearningEntry["source"],
  content: string,
  presetId?: string,
  details: EntryDetails = {},
): LearningEntry {
  const now = new Date().toISOString();
  const description = details.description?.trim();
  const url = details.url?.trim();

  return {
    id: createId(ENTRY_ID_PREFIX),
    date: getTodayDateKey(),
    content,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
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

function scheduleCoverImageResolution(entry: LearningEntry) {
  if (!entry.url) {
    return;
  }

  void resolveAndStoreCoverImage(entry.id, entry.url);
}

export async function createEntryFromPreset(
  preset: LearningPreset,
  details?: EntryDetails,
): Promise<string | undefined> {
  if (isEmptyPreset(preset)) {
    return createEmptyEntry(details);
  }

  const entry = createBaseEntry("preset", preset.label, preset.id, details);
  const updatedAt = new Date().toISOString();

  await db.transaction("rw", db.entries, db.presets, async () => {
    await entriesRepository.put(entry);
    await presetsRepository.put({
      ...preset,
      usageCount: preset.usageCount + 1,
      updatedAt,
    });
  });

  scheduleCoverImageResolution(entry);
  return entry.id;
}

export async function createCustomEntry(
  content: string,
  details?: EntryDetails,
): Promise<string | undefined> {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return undefined;
  }

  const entry = createBaseEntry("custom", trimmedContent, undefined, details);
  await entriesRepository.put(entry);
  scheduleCoverImageResolution(entry);
  return entry.id;
}

export async function createEmptyEntry(
  details?: EntryDetails,
): Promise<string> {
  const entry = createBaseEntry("empty", EMPTY_ENTRY_CONTENT, undefined, details);
  await entriesRepository.put(entry);
  scheduleCoverImageResolution(entry);
  return entry.id;
}

export function normalizePresetLabel(label: string) {
  return label.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr-FR");
}

function createPresetFromEntry(entry: LearningEntry): LearningPreset {
  const now = new Date().toISOString();

  return {
    id: createId(PRESET_ID_PREFIX),
    label: entry.content.trim(),
    usageCount: 0,
    createdFromEntryId: entry.id,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createPresetFromCustomEntry(
  entry: LearningEntry,
): Promise<CreatePresetFromEntryResult> {
  if (entry.source !== "custom") {
    throw new Error("Seules les réponses libres peuvent devenir un choix rapide.");
  }

  const normalizedLabel = normalizePresetLabel(entry.content);

  if (!normalizedLabel) {
    throw new Error("Cette réponse est vide.");
  }

  const existingPresets = await presetsRepository.getAll();
  const existingPreset = existingPresets.find(
    (preset) => normalizePresetLabel(preset.label) === normalizedLabel,
  );

  if (!existingPreset) {
    const preset = createPresetFromEntry(entry);
    await presetsRepository.put(preset);

    return { preset, status: "created" };
  }

  if (!existingPreset.archived) {
    return { preset: existingPreset, status: "alreadyExists" };
  }

  const restoredPreset = {
    ...existingPreset,
    archived: false,
    createdFromEntryId: existingPreset.createdFromEntryId ?? entry.id,
    updatedAt: new Date().toISOString(),
  };

  await presetsRepository.put(restoredPreset);

  return { preset: restoredPreset, status: "restored" };
}

export function deleteEntry(entryId: string) {
  return entriesRepository.delete(entryId);
}
