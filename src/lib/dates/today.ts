const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getTodayDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatTimeLabel(isoDate: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function getLastDaysKeys(daysCount: number, today = new Date()): string[] {
  const todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0);

  const keys: string[] = [];
  for (let offset = daysCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(todayMidnight.getTime() - offset * MS_PER_DAY);
    keys.push(getTodayDateKey(date));
  }
  return keys;
}

const FULL_DAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatDayLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) {
    return "Aujourd'hui";
  }

  const todayParts = todayKey.split("-").map(Number);
  const dateParts = dateKey.split("-").map(Number);
  const todayMidnight = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const dateMidnight = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

  const diffDays = Math.round(
    (todayMidnight.getTime() - dateMidnight.getTime()) / MS_PER_DAY,
  );

  if (diffDays === 1) {
    return "Hier";
  }

  return FULL_DAY_FORMATTER.format(dateMidnight);
}
