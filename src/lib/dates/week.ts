import type { WeekStartDay } from "../db";
import { getTodayDateKey } from "./today";

const DAYS_PER_WEEK = 7;
const SUNDAY_DAY_INDEX = 0;
const MONDAY_DAY_INDEX = 1;

export type WeekRange = {
  weekStart: string;
  weekEnd: string;
};

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getWeekStartOffset(date: Date, weekStartsOn: WeekStartDay): number {
  const dayIndex = date.getDay();
  const referenceIndex =
    weekStartsOn === "monday" ? MONDAY_DAY_INDEX : SUNDAY_DAY_INDEX;
  return (dayIndex - referenceIndex + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

export function getWeekRange(
  date: Date,
  weekStartsOn: WeekStartDay,
): WeekRange {
  const day = startOfDay(date);
  const start = addDays(day, -getWeekStartOffset(day, weekStartsOn));
  const end = addDays(start, DAYS_PER_WEEK - 1);

  return {
    weekStart: getTodayDateKey(start),
    weekEnd: getTodayDateKey(end),
  };
}

export function getCurrentWeekRange(weekStartsOn: WeekStartDay): WeekRange {
  return getWeekRange(new Date(), weekStartsOn);
}

export function shiftWeekRange(range: WeekRange, weeks: number): WeekRange {
  const startDate = new Date(`${range.weekStart}T00:00:00`);
  const shiftedStart = addDays(startDate, weeks * DAYS_PER_WEEK);
  const shiftedEnd = addDays(shiftedStart, DAYS_PER_WEEK - 1);

  return {
    weekStart: getTodayDateKey(shiftedStart),
    weekEnd: getTodayDateKey(shiftedEnd),
  };
}

export function isCurrentWeek(range: WeekRange, weekStartsOn: WeekStartDay) {
  const current = getCurrentWeekRange(weekStartsOn);
  return current.weekStart === range.weekStart;
}

export function formatWeekRangeLabel(range: WeekRange): string {
  const start = new Date(`${range.weekStart}T00:00:00`);
  const end = new Date(`${range.weekEnd}T00:00:00`);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  const dayFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });
  const dayMonthFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  });
  const fullFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (sameMonth) {
    return `Du ${dayFormatter.format(start)} au ${fullFormatter.format(end)}`;
  }

  if (sameYear) {
    return `Du ${dayMonthFormatter.format(start)} au ${fullFormatter.format(end)}`;
  }

  return `Du ${fullFormatter.format(start)} au ${fullFormatter.format(end)}`;
}
