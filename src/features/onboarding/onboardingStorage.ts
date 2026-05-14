import { db } from "../../lib/db";
import {
  LOCAL_SETTINGS_ID,
  type LearningPreset,
  type UserSettings,
} from "../../lib/db/types";
import { createId } from "../../lib/ids";
import {
  DEFAULT_REMINDER_TIMES,
  INITIAL_PRESET_OPTIONS,
  type InitialPresetId,
} from "./onboardingOptions";

const PRESET_ID_PREFIX = "preset";

type CompleteOnboardingInput = {
  reminderTimes: string[];
  selectedPresetIds: InitialPresetId[];
  weekStartsOn: UserSettings["weekStartsOn"];
};

export async function completeOnboarding({
  reminderTimes,
  selectedPresetIds,
  weekStartsOn,
}: CompleteOnboardingInput) {
  const now = new Date().toISOString();
  const selectedPresetIdSet = new Set(selectedPresetIds);
  const selectedPresets: LearningPreset[] = INITIAL_PRESET_OPTIONS.filter((option) =>
    selectedPresetIdSet.has(option.id),
  ).map((option) => ({
    id: createId(PRESET_ID_PREFIX),
    label: option.label,
    emoji: option.emoji,
    usageCount: 0,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }));

  const settings: UserSettings = {
    id: LOCAL_SETTINGS_ID,
    reminderTimes: reminderTimes.length > 0 ? reminderTimes : DEFAULT_REMINDER_TIMES,
    weekStartsOn,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction("rw", db.settings, db.presets, async () => {
    await db.settings.put(settings);

    if (selectedPresets.length > 0) {
      await db.presets.bulkPut(selectedPresets);
    }
  });
}
