import {
  db,
  LOCAL_SETTINGS_ID,
  settingsRepository,
  type UserSettings,
  type WeekStartDay,
} from "../../lib/db";

async function updateLocalSettings(
  mutator: (current: UserSettings) => UserSettings,
): Promise<UserSettings> {
  const current = await settingsRepository.getById(LOCAL_SETTINGS_ID);

  if (!current) {
    throw new Error("Réglages locaux introuvables.");
  }

  const next = mutator(current);
  await settingsRepository.put(next);
  return next;
}

function normalizeReminderTime(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d{2}:\d{2}$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export async function addReminderTime(time: string): Promise<void> {
  const normalized = normalizeReminderTime(time);

  if (!normalized) {
    throw new Error("Heure de rappel invalide.");
  }

  await updateLocalSettings((current) => {
    if (current.reminderTimes.includes(normalized)) {
      return current;
    }

    return {
      ...current,
      reminderTimes: [...current.reminderTimes, normalized].sort(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function removeReminderTime(time: string): Promise<void> {
  await updateLocalSettings((current) => {
    if (!current.reminderTimes.includes(time)) {
      return current;
    }

    return {
      ...current,
      reminderTimes: current.reminderTimes.filter(
        (reminderTime) => reminderTime !== time,
      ),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function updateWeekStartsOn(
  weekStartsOn: WeekStartDay,
): Promise<void> {
  await updateLocalSettings((current) => {
    if (current.weekStartsOn === weekStartsOn) {
      return current;
    }

    return {
      ...current,
      weekStartsOn,
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function resetLocalData(): Promise<void> {
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
    },
  );
}
