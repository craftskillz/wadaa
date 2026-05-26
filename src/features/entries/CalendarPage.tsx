import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/ui";
import {
  getCurrentMonthKey,
  getTodayDateKey,
  shiftMonth,
  type MonthKey,
} from "../../lib/dates";
import { useWeekStartSetting } from "../reviews/useWeekReviewData";
import { MonthGrid } from "./MonthGrid";
import { useMonthlyEntries } from "./useMonthlyEntries";

const INITIAL_MONTH_COUNT = 3;
const MONTHS_PER_BATCH = 3;
const SENTINEL_ROOT_MARGIN_PX = 400;

function buildMonthKeysWindow(count: number): MonthKey[] {
  const currentMonthKey = getCurrentMonthKey();
  const keys: MonthKey[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    keys.push(shiftMonth(currentMonthKey, -offset));
  }
  return keys;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { weekStartsOn, isLoading: isSettingsLoading } = useWeekStartSetting();
  const { byDate, isLoading: isEntriesLoading } = useMonthlyEntries();
  const [monthCount, setMonthCount] = useState(INITIAL_MONTH_COUNT);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const todayKey = useMemo(() => getTodayDateKey(), []);

  const monthKeys = useMemo(() => buildMonthKeysWindow(monthCount), [monthCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMonthCount((current) => current + MONTHS_PER_BATCH);
        }
      },
      { rootMargin: `${SENTINEL_ROOT_MARGIN_PX}px` },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasAnyKeptEntry = byDate.size > 0;
  const isInitialLoading = isSettingsLoading || isEntriesLoading;

  function handleSelectDay(dateKey: string) {
    navigate(`/calendar/${dateKey}`);
  }

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Calendrier"
        title="Tes jours actifs"
        description="Chaque case représente une journée. Plus l'intensité est forte, plus tu as gardé d'apprentissages notés."
      />

      {isInitialLoading ? (
        <p className="px-2 text-sm text-slate-500">Chargement du calendrier…</p>
      ) : !hasAnyKeptEntry ? (
        <EmptyState
          description="Note tes apprentissages depuis Aujourd'hui, puis garde les meilleurs dans la revue hebdomadaire pour les faire apparaître ici."
          icon={
            <CalendarDays
              aria-hidden="true"
              className="size-10 text-violet-500"
            />
          }
          title="Pas encore d'apprentissages gardés"
        />
      ) : (
        <div className="space-y-4">
          {monthKeys.map((monthKey) => (
            <MonthGrid
              key={monthKey}
              monthKey={monthKey}
              onSelectDay={handleSelectDay}
              summaries={byDate}
              todayKey={todayKey}
              weekStartsOn={weekStartsOn}
            />
          ))}
          <div aria-hidden="true" className="h-8" ref={sentinelRef} />
        </div>
      )}
    </section>
  );
}
