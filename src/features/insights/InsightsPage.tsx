import { type ReactNode, useEffect, useMemo, useState } from "react";
import { liveQuery } from "dexie";
import {
  Activity,
  CalendarCheck2,
  ChartNoAxesColumnIncreasing,
  Star,
  Trophy,
} from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { Card, EmptyState, StatusPill } from "../../components/ui";
import { getLastDaysKeys } from "../../lib/dates";
import { db, type LearningEntry } from "../../lib/db";

const SHORT_WINDOW_DAYS = 7;
const LONG_WINDOW_DAYS = 30;
const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const CHART_PADDING_X = 28;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 36;
const MIN_CHART_MAX_SCORE = 1;
const SHORT_LABEL_INTERVAL = 1;
const LONG_LABEL_INTERVAL = 6;
const FALLBACK_RATING = 0;

type DailyMetric = {
  date: string;
  keptCount: number;
  totalScore: number;
  averageRating: number;
};

type InsightsData = {
  entries: LearningEntry[];
  isLoading: boolean;
};

const INITIAL_DATA: InsightsData = {
  entries: [],
  isLoading: true,
};

const compactNumberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

const dayLabelFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

function useInsightsData(): InsightsData {
  const [data, setData] = useState<InsightsData>(INITIAL_DATA);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const entries = await db.entries.toArray();
      return entries
        .filter((entry) => entry.source !== "empty" && entry.kept && !entry.discarded)
        .sort((left, right) => left.date.localeCompare(right.date));
    }).subscribe({
      next(entries) {
        setData({ entries, isLoading: false });
      },
      error() {
        setData({ entries: [], isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return data;
}

function buildDailyMetrics(entries: LearningEntry[], daysCount: number) {
  const today = new Date();
  const dates = getLastDaysKeys(daysCount, today);
  const byDate = new Map<string, LearningEntry[]>();

  entries.forEach((entry) => {
    if (!byDate.has(entry.date)) {
      byDate.set(entry.date, []);
    }
    byDate.get(entry.date)?.push(entry);
  });

  return dates.map<DailyMetric>((date) => {
    const dayEntries = byDate.get(date) ?? [];
    const totalScore = dayEntries.reduce(
      (total, entry) => total + (entry.rating ?? FALLBACK_RATING),
      0,
    );

    return {
      date,
      keptCount: dayEntries.length,
      totalScore,
      averageRating: dayEntries.length > 0 ? totalScore / dayEntries.length : 0,
    };
  });
}

function formatDayLabel(dateKey: string) {
  return dayLabelFormatter.format(new Date(`${dateKey}T00:00:00`));
}

function formatScore(value: number) {
  return compactNumberFormatter.format(value);
}

function getMetricTotals(entries: LearningEntry[]) {
  const activeDays = new Set(entries.map((entry) => entry.date)).size;
  const totalScore = entries.reduce(
    (total, entry) => total + (entry.rating ?? FALLBACK_RATING),
    0,
  );
  const averageDailyScore = activeDays > 0 ? totalScore / activeDays : 0;

  const byDate = new Map<string, DailyMetric>();
  entries.forEach((entry) => {
    const current = byDate.get(entry.date) ?? {
      date: entry.date,
      keptCount: 0,
      totalScore: 0,
      averageRating: 0,
    };
    const keptCount = current.keptCount + 1;
    const totalScore = current.totalScore + (entry.rating ?? FALLBACK_RATING);

    byDate.set(entry.date, {
      date: entry.date,
      keptCount,
      totalScore,
      averageRating: totalScore / keptCount,
    });
  });

  const bestDay = Array.from(byDate.values()).reduce<DailyMetric | undefined>((best, current) => {
    if (!best || current.totalScore > best.totalScore) {
      return current;
    }
    return best;
  }, undefined);

  return {
    activeDays,
    keptEntries: entries.length,
    averageDailyScore,
    bestDay: bestDay && bestDay.totalScore > 0 ? bestDay : undefined,
  };
}

function buildLinePath(series: DailyMetric[]) {
  if (series.length === 0) {
    return "";
  }

  const chartInnerWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const maxScore = Math.max(
    MIN_CHART_MAX_SCORE,
    ...series.map((point) => point.totalScore),
  );
  const stepX = series.length > 1 ? chartInnerWidth / (series.length - 1) : 0;

  return series
    .map((point, index) => {
      const x = CHART_PADDING_X + stepX * index;
      const y =
        CHART_PADDING_TOP +
        chartInnerHeight -
        (point.totalScore / maxScore) * chartInnerHeight;
      const command = index === 0 ? "M" : "L";
      return `${command} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(series: DailyMetric[]) {
  const linePath = buildLinePath(series);

  if (!linePath) {
    return "";
  }

  const chartInnerWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const baselineY = CHART_HEIGHT - CHART_PADDING_BOTTOM;
  const endX = CHART_PADDING_X + chartInnerWidth;

  return `${linePath} L ${endX} ${baselineY} L ${CHART_PADDING_X} ${baselineY} Z`;
}

type LearningChartProps = {
  series: DailyMetric[];
  title: string;
  description: string;
  labelInterval: number;
};

function LearningChart({
  series,
  title,
  description,
  labelInterval,
}: LearningChartProps) {
  const linePath = buildLinePath(series);
  const areaPath = buildAreaPath(series);
  const maxScore = Math.max(
    MIN_CHART_MAX_SCORE,
    ...series.map((point) => point.totalScore),
  );
  const chartInnerWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const stepX = series.length > 1 ? chartInnerWidth / (series.length - 1) : 0;
  const lastPoint = series[series.length - 1];
  const visibleLabels = series.filter(
    (_, index) =>
      index === 0 || index === series.length - 1 || index % labelInterval === 0,
  );

  return (
    <Card className="p-4 sm:p-5" tone="solid">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-black text-slate-950">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            {description}
          </p>
        </div>
        {lastPoint ? (
          <StatusPill tone={lastPoint.totalScore > 0 ? "mint" : "slate"}>
            {formatScore(lastPoint.totalScore)} aujourd'hui
          </StatusPill>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
        <svg
          aria-label={`${title} : score quotidien des apprentissages gardés`}
          className="h-44 w-full"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          <line
            className="stroke-slate-200"
            strokeWidth="2"
            x1={CHART_PADDING_X}
            x2={CHART_WIDTH - CHART_PADDING_X}
            y1={CHART_HEIGHT - CHART_PADDING_BOTTOM}
            y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
          />
          <line
            className="stroke-slate-100"
            strokeWidth="2"
            x1={CHART_PADDING_X}
            x2={CHART_WIDTH - CHART_PADDING_X}
            y1={CHART_PADDING_TOP + chartInnerHeight / 2}
            y2={CHART_PADDING_TOP + chartInnerHeight / 2}
          />
          <path className="fill-violet-500/10" d={areaPath} />
          <path
            className="fill-none stroke-violet-600"
            d={linePath}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
          />

          {series.map((point, index) => {
            const x = CHART_PADDING_X + stepX * index;
            const y =
              CHART_PADDING_TOP +
              chartInnerHeight -
              (point.totalScore / maxScore) * chartInnerHeight;

            return (
              <g key={point.date}>
                {point.totalScore > 0 ? (
                  <circle
                    className="fill-white stroke-violet-600"
                    cx={x}
                    cy={y}
                    r="5"
                    strokeWidth="3"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[0.65rem] font-bold text-slate-500 sm:text-xs">
          {visibleLabels.map((point) => (
            <span key={point.date}>{formatDayLabel(point.date)}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ icon, label, value, detail }: MetricCardProps) {
  return (
    <Card className="p-4" tone="solid">
      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
        {detail}
      </p>
    </Card>
  );
}

export function InsightsPage() {
  const { entries, isLoading } = useInsightsData();

  const shortSeries = useMemo(
    () => buildDailyMetrics(entries, SHORT_WINDOW_DAYS),
    [entries],
  );
  const longSeries = useMemo(
    () => buildDailyMetrics(entries, LONG_WINDOW_DAYS),
    [entries],
  );
  const totals = useMemo(
    () => getMetricTotals(entries),
    [entries],
  );

  const bestDayLabel = totals.bestDay
    ? formatDayLabel(totals.bestDay.date)
    : "Aucune";
  const bestDayDetail = totals.bestDay
    ? `${formatScore(totals.bestDay.totalScore)} point${totals.bestDay.totalScore > 1 ? "s" : ""}`
    : "Pas encore de score";

  return (
    <section className="mx-auto max-w-6xl pb-12">
      <PageHeader
        eyebrow="Insights"
        title="Courbe d'apprentissage"
        description="Les statistiques restent locales et se basent sur les apprentissages gardés en revue."
      />

      {isLoading ? (
        <EmptyState
          description="Calcul des métriques locales..."
          icon={
            <ChartNoAxesColumnIncreasing
              aria-hidden="true"
              className="size-7 text-violet-600"
            />
          }
          title="Chargement"
        />
      ) : entries.length === 0 ? (
        <EmptyState
          description="Les premiers scores apparaîtront après une revue hebdomadaire avec au moins un apprentissage gardé."
          icon={<Star aria-hidden="true" className="size-7 text-amber-500" />}
          title="Aucun apprentissage gardé"
        />
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              detail="Jours avec au moins un apprentissage gardé"
              icon={<CalendarCheck2 aria-hidden="true" className="size-5" />}
              label="Jours actifs"
              value={String(totals.activeDays)}
            />
            <MetricCard
              detail="Entrées conservées après revue"
              icon={<Activity aria-hidden="true" className="size-5" />}
              label="Apprentissages gardés"
              value={String(totals.keptEntries)}
            />
            <MetricCard
              detail="Moyenne du score quotidien actif"
              icon={<Star aria-hidden="true" className="size-5" />}
              label="Score moyen"
              value={formatScore(totals.averageDailyScore)}
            />
            <MetricCard
              detail={bestDayDetail}
              icon={<Trophy aria-hidden="true" className="size-5" />}
              label="Meilleure journée"
              value={bestDayLabel}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <LearningChart
              description="Score quotidien sur une semaine"
              labelInterval={SHORT_LABEL_INTERVAL}
              series={shortSeries}
              title="7 jours"
            />
            <LearningChart
              description="Tendance longue des apprentissages gardés"
              labelInterval={LONG_LABEL_INTERVAL}
              series={longSeries}
              title="30 jours"
            />
          </div>
        </>
      )}
    </section>
  );
}
