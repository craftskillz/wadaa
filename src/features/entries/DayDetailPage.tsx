import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { ArrowLeft, Calendar, ExternalLink, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { PageHeader } from "../../components/layout/PageHeader";
import { Card, EmptyState } from "../../components/ui";
import {
  formatDayLabel,
  getTodayDateKey,
} from "../../lib/dates";
import { db, type LearningEntry } from "../../lib/db";
import { useEntryCoverThumbnail } from "./useEntryCoverThumbnail";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_STARS = 5;

type DayState = {
  entries: LearningEntry[];
  isLoading: boolean;
};

const INITIAL_STATE: DayState = { entries: [], isLoading: true };

const EMPTY_DAY_STATE: DayState = { entries: [], isLoading: false };

function useDayEntries(dateKey: string | undefined): DayState {
  const isValidDateKey = !!dateKey && DATE_KEY_PATTERN.test(dateKey);
  const [state, setState] = useState<DayState>(INITIAL_STATE);

  useEffect(() => {
    if (!isValidDateKey) {
      return;
    }

    const subscription = liveQuery(async () => {
      const entries = await db.entries.where("date").equals(dateKey).toArray();
      return entries
        .filter(
          (entry) =>
            entry.kept && !entry.discarded && entry.source !== "empty",
        )
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    }).subscribe({
      next(entries) {
        setState({ entries, isLoading: false });
      },
      error() {
        setState({ entries: [], isLoading: false });
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dateKey, isValidDateKey]);

  return isValidDateKey ? state : EMPTY_DAY_STATE;
}

export function DayDetailPage() {
  const { date } = useParams<{ date: string }>();
  const { entries, isLoading } = useDayEntries(date);
  const todayKey = getTodayDateKey();
  const isValidDate = date && DATE_KEY_PATTERN.test(date);
  const headerTitle = isValidDate
    ? formatDayLabel(date, todayKey)
    : "Journée introuvable";

  return (
    <section className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Journée"
        title={headerTitle}
        description={
          isValidDate
            ? "Retrouve ici les apprentissages que tu as gardés ce jour-là."
            : "L'URL ne correspond pas à une date valide."
        }
      />

      <div className="mb-4">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-white/70 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-violet-100"
          to="/calendar"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Retour au calendrier
        </Link>
      </div>

      {!isValidDate ? (
        <EmptyState
          description="Reviens au calendrier pour choisir une journée."
          icon={
            <Calendar aria-hidden="true" className="size-10 text-violet-500" />
          }
          title="Date invalide"
        />
      ) : isLoading ? (
        <p className="px-2 text-sm text-slate-500">Chargement…</p>
      ) : entries.length === 0 ? (
        <EmptyState
          description="Aucun apprentissage gardé n'a été enregistré pour ce jour."
          icon={
            <Calendar aria-hidden="true" className="size-10 text-violet-500" />
          }
          title="Journée sans apprentissage gardé"
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <DayEntryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DayEntryCard({ entry }: { entry: LearningEntry }) {
  const rating = entry.rating ?? 0;
  const coverUrl = useEntryCoverThumbnail(entry.coverImage);

  return (
    <Card className="p-4 sm:p-5" tone="solid">
      <div className="flex flex-col gap-3 sm:flex-row">
        {coverUrl ? (
          <img
            alt=""
            className="h-28 w-full shrink-0 rounded-2xl object-cover sm:h-28 sm:w-40"
            src={coverUrl}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-words text-base font-black text-slate-950">
                {entry.content}
              </p>
              {entry.description ? (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                  {entry.description}
                </p>
              ) : null}
              {entry.url ? (
                <a
                  className="mt-2 inline-flex max-w-full items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-800"
                  href={entry.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                  <span className="truncate">Ouvrir le lien</span>
                </a>
              ) : null}
            </div>
            <div
              aria-label={`Note ${rating} sur ${MAX_STARS}`}
              className="flex shrink-0 items-center gap-0.5"
            >
              {Array.from({ length: MAX_STARS }, (_, index) => (
                <Star
                  aria-hidden="true"
                  className={
                    index < rating
                      ? "size-4 fill-amber-400 text-amber-400"
                      : "size-4 text-slate-300"
                  }
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
