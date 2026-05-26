import type { WeekStartDay } from "../db";
import { getTodayDateKey } from "./today";

export const DAYS_PER_WEEK = 7;

const MONDAY_DAY_INDEX = 1;
const SUNDAY_DAY_INDEX = 0;

export type MonthKey = string; // "YYYY-MM"

export type MonthDayCell = {
  dateKey: string;
  dayOfMonth: number;
  isInMonth: boolean;
  isToday: boolean;
};

export type MonthGridData = {
  monthKey: MonthKey;
  weeks: MonthDayCell[][];
};

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

export function getCurrentMonthKey(date = new Date()): MonthKey {
  return formatMonthKey(date.getFullYear(), date.getMonth());
}

export function formatMonthKey(year: number, monthIndex: number): MonthKey {
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthKey(monthKey: MonthKey): {
  year: number;
  monthIndex: number;
} {
  const [yearString, monthString] = monthKey.split("-");
  return {
    year: Number(yearString),
    monthIndex: Number(monthString) - 1,
  };
}

export function shiftMonth(monthKey: MonthKey, offset: number): MonthKey {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const shifted = new Date(year, monthIndex + offset, 1);
  return formatMonthKey(shifted.getFullYear(), shifted.getMonth());
}

export function getMonthLabel(monthKey: MonthKey): string {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return MONTH_LABEL_FORMATTER.format(new Date(year, monthIndex, 1));
}

function getWeekStartOffset(date: Date, weekStartsOn: WeekStartDay): number {
  const dayIndex = date.getDay();
  const referenceIndex =
    weekStartsOn === "monday" ? MONDAY_DAY_INDEX : SUNDAY_DAY_INDEX;
  return (dayIndex - referenceIndex + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

export function buildMonthGrid(
  monthKey: MonthKey,
  weekStartsOn: WeekStartDay,
  todayKey: string = getTodayDateKey(),
): MonthGridData {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const firstOfMonth = new Date(year, monthIndex, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(
    firstOfMonth.getDate() - getWeekStartOffset(firstOfMonth, weekStartsOn),
  );

  const weeks: MonthDayCell[][] = [];
  const cursor = new Date(gridStart);

  // 6 weeks max suffice to cover any month layout
  const MAX_WEEKS_PER_MONTH_GRID = 6;
  for (let weekIndex = 0; weekIndex < MAX_WEEKS_PER_MONTH_GRID; weekIndex += 1) {
    const week: MonthDayCell[] = [];
    for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
      const dateKey = getTodayDateKey(cursor);
      week.push({
        dateKey,
        dayOfMonth: cursor.getDate(),
        isInMonth: cursor.getMonth() === monthIndex,
        isToday: dateKey === todayKey,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);

    // Stop early when the next iteration would only render out-of-month days
    if (week[DAYS_PER_WEEK - 1].isInMonth === false && weekIndex >= 3) {
      const remainsInMonth = week.some((cell) => cell.isInMonth);
      if (!remainsInMonth) {
        weeks.pop();
        break;
      }
    }
  }

  return { monthKey, weeks };
}

export function getWeekdayLabels(weekStartsOn: WeekStartDay): string[] {
  const referenceMonday = new Date(2024, 0, 1); // Jan 1 2024 is a Monday
  const startOffset = weekStartsOn === "monday" ? 0 : -1;
  const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const labels: string[] = [];
  for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
    const date = new Date(referenceMonday);
    date.setDate(referenceMonday.getDate() + startOffset + dayIndex);
    labels.push(formatter.format(date).replace(".", "").toUpperCase());
  }
  return labels;
}
