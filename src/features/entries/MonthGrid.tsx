import {
  buildMonthGrid,
  getMonthLabel,
  getWeekdayLabels,
  type MonthDayCell,
  type MonthKey,
} from "../../lib/dates";
import type { WeekStartDay } from "../../lib/db";
import { classNames } from "../../lib/styles/classNames";
import type { DailySummary } from "./useMonthlyEntries";

const INTENSITY_THRESHOLDS = [1, 4, 8, 12] as const;
const INTENSITY_CLASS_BY_LEVEL = [
  "bg-slate-100 text-slate-400",
  "bg-violet-100 text-violet-700",
  "bg-violet-300 text-violet-900",
  "bg-violet-500 text-white",
  "bg-violet-700 text-white",
];

function getIntensityLevel(score: number): number {
  if (score <= 0) {
    return 0;
  }
  let level = 1;
  for (const threshold of INTENSITY_THRESHOLDS) {
    if (score >= threshold) {
      level += 1;
    }
  }
  return Math.min(level - 1, INTENSITY_CLASS_BY_LEVEL.length - 1);
}

type MonthGridProps = {
  monthKey: MonthKey;
  weekStartsOn: WeekStartDay;
  todayKey: string;
  summaries: Map<string, DailySummary>;
  onSelectDay: (dateKey: string) => void;
};

export function MonthGrid({
  monthKey,
  weekStartsOn,
  todayKey,
  summaries,
  onSelectDay,
}: MonthGridProps) {
  const grid = buildMonthGrid(monthKey, weekStartsOn, todayKey);
  const weekdayLabels = getWeekdayLabels(weekStartsOn);
  const label = getMonthLabel(monthKey);

  return (
    <section
      aria-label={`Calendrier ${label}`}
      className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
    >
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-black capitalize text-slate-950">{label}</h2>
      </header>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-black uppercase text-slate-400">
        {weekdayLabels.map((dayLabel) => (
          <div key={dayLabel}>{dayLabel}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {grid.weeks.flatMap((week) =>
          week.map((cell) => (
            <CalendarCell
              cell={cell}
              key={cell.dateKey}
              onSelect={onSelectDay}
              summary={summaries.get(cell.dateKey)}
            />
          )),
        )}
      </div>
    </section>
  );
}

type CalendarCellProps = {
  cell: MonthDayCell;
  summary: DailySummary | undefined;
  onSelect: (dateKey: string) => void;
};

function CalendarCell({ cell, summary, onSelect }: CalendarCellProps) {
  if (!cell.isInMonth) {
    return <div aria-hidden="true" className="aspect-square" />;
  }

  const score = summary?.totalScore ?? 0;
  const level = getIntensityLevel(score);
  const intensityClass = INTENSITY_CLASS_BY_LEVEL[level];
  const hasEntries = (summary?.keptCount ?? 0) > 0;

  const baseClasses = classNames(
    "relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-violet-200",
    intensityClass,
    cell.isToday && "ring-2 ring-slate-950 ring-offset-2 ring-offset-white",
  );

  if (!hasEntries) {
    return (
      <div
        aria-label={`${cell.dayOfMonth} — aucun apprentissage gardé`}
        className={baseClasses}
      >
        {cell.dayOfMonth}
      </div>
    );
  }

  const ratingLabel =
    summary && summary.totalScore > 0
      ? `${summary.keptCount} apprentissage${summary.keptCount > 1 ? "s" : ""}, score ${summary.totalScore}`
      : `${summary?.keptCount ?? 0} apprentissages`;

  return (
    <button
      aria-label={`${cell.dayOfMonth} — ${ratingLabel}`}
      className={classNames(baseClasses, "hover:-translate-y-0.5")}
      onClick={() => onSelect(cell.dateKey)}
      type="button"
    >
      <span>{cell.dayOfMonth}</span>
      {summary && summary.keptCount > 0 ? (
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide opacity-80">
          ★ {summary.totalScore || summary.keptCount}
        </span>
      ) : null}
    </button>
  );
}
