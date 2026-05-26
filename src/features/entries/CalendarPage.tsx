import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
  Trash2,
} from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import {
  Button,
  Card,
  EmptyState,
  StatusPill,
  StatusToastBanner,
  useStatusToast,
} from "../../components/ui";
import {
  getCurrentMonthKey,
  getMonthLabel,
  shiftMonth,
  type MonthKey,
} from "../../lib/dates";
import { db, type EntryRating, type LearningEntry } from "../../lib/db";
import {
  getYouTubeThumbnailUrl,
  useEntryCoverThumbnail,
} from "./useEntryCoverThumbnail";
import { useMonthlyEntries } from "./useMonthlyEntries";

const MAX_STARS: EntryRating = 5;
const UNRATED_SCORE = 0;

function getEntryScore(entry: LearningEntry) {
  return entry.rating ?? UNRATED_SCORE;
}

function formatEntryDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

type MonthEntryCardProps = {
  entry: LearningEntry;
  onRequestDiscard: (entry: LearningEntry) => void;
};

function EntryThumbnail({
  entry,
  className,
}: {
  entry: LearningEntry;
  className: string;
}) {
  const coverUrl = useEntryCoverThumbnail(entry.coverImage);
  const [hasImageError, setHasImageError] = useState(false);
  const youtubeFallbackUrl = getYouTubeThumbnailUrl(entry.url);
  const previewUrl = !hasImageError && coverUrl ? coverUrl : youtubeFallbackUrl;

  if (previewUrl) {
    return (
      <img
        alt=""
        className={className}
        onError={() => setHasImageError(true)}
        src={previewUrl}
      />
    );
  }

  return (
    <span
      className={[
        className,
        "inline-flex items-center justify-center bg-violet-500/10 text-violet-600",
      ].join(" ")}
    >
      <CalendarDays aria-hidden="true" className="size-7" />
    </span>
  );
}

function StarRating({ rating = UNRATED_SCORE }: { rating?: number }) {
  return (
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
  );
}

function MonthEntryCard({ entry, onRequestDiscard }: MonthEntryCardProps) {
  return (
    <Card className="p-4 sm:p-5" tone="solid">
      <div className="flex flex-col gap-3 sm:flex-row">
        <EntryThumbnail
          className="h-32 w-full shrink-0 rounded-2xl object-cover sm:h-28 sm:w-40"
          entry={entry}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusPill tone="violet">{formatEntryDate(entry.date)}</StatusPill>
                <StarRating rating={entry.rating} />
              </div>
              <p className="break-words text-base font-black leading-6 text-slate-950">
                {entry.content}
              </p>
              {entry.description ? (
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-600">
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

            <Button
              className="shrink-0 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15"
              icon={<Trash2 aria-hidden="true" className="size-4" />}
              onClick={() => onRequestDiscard(entry)}
              variant="secondary"
            >
              Jeter
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

type DiscardMonthEntryModalProps = {
  entry: LearningEntry;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function DiscardMonthEntryModal({
  entry,
  isBusy,
  onCancel,
  onConfirm,
}: DiscardMonthEntryModalProps) {
  return (
    <div
      aria-labelledby="confirm-month-discard-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <AlertTriangle aria-hidden="true" className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              className="text-lg font-black text-slate-950"
              id="confirm-month-discard-title"
            >
              Jeter définitivement cet élément
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              Attention, vous vous apprêtez à jeter définitivement cet
              apprentissage. Cette action le supprimera de la base locale.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl bg-white/80 p-2 shadow-sm shadow-slate-900/5">
          <EntryThumbnail
            className="size-16 shrink-0 rounded-xl object-cover"
            entry={entry}
          />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 break-words text-sm font-black leading-5 text-slate-950">
              {entry.content}
            </p>
            {entry.description ? (
              <p className="mt-1 line-clamp-2 break-words text-xs font-semibold leading-5 text-slate-500">
                {entry.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button disabled={isBusy} onClick={onCancel} variant="secondary">
            Annuler
          </Button>
          <Button
            className="bg-rose-600 text-white shadow-rose-500/30 hover:bg-rose-700"
            disabled={isBusy}
            onClick={onConfirm}
          >
            {isBusy ? "Suppression..." : "Jeter définitivement"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CalendarPage() {
  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const [monthKey, setMonthKey] = useState<MonthKey>(currentMonthKey);
  const [entryToDiscard, setEntryToDiscard] = useState<LearningEntry | null>(
    null,
  );
  const [isDiscarding, setIsDiscarding] = useState(false);
  const { byDate, isLoading } = useMonthlyEntries();
  const { statusToast, isStatusToastVisible, showStatusToast } = useStatusToast();
  const monthLabel = getMonthLabel(monthKey);
  const isCurrentMonth = monthKey === currentMonthKey;

  const monthEntries = useMemo(
    () =>
      Array.from(byDate.values())
        .filter((summary) => summary.dateKey.startsWith(monthKey))
        .flatMap((summary) => summary.entries)
        .sort((left, right) => {
          const scoreDifference = getEntryScore(right) - getEntryScore(left);
          if (scoreDifference !== 0) {
            return scoreDifference;
          }
          return right.createdAt.localeCompare(left.createdAt);
        }),
    [byDate, monthKey],
  );

  const monthScore = monthEntries.reduce(
    (total, entry) => total + getEntryScore(entry),
    0,
  );

  function shiftViewedMonth(offset: number) {
    setMonthKey((current) => shiftMonth(current, offset));
  }

  async function confirmDiscardEntry() {
    if (!entryToDiscard) {
      return;
    }

    setIsDiscarding(true);
    try {
      await db.entries.delete(entryToDiscard.id);
      showStatusToast("Apprentissage jeté et supprimé.", "success");
      setEntryToDiscard(null);
    } catch (error) {
      showStatusToast(
        error instanceof Error ? error.message : "Suppression impossible.",
        "error",
      );
    } finally {
      setIsDiscarding(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl pb-12">
      <PageHeader
        eyebrow="Mois"
        title="Ton mois d'apprentissage"
        description="Parcours les apprentissages gardés du mois, triés par nombre d'étoiles."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/85 p-4 shadow-md shadow-slate-900/5 backdrop-blur sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            aria-label="Mois précédent"
            icon={<ChevronLeft aria-hidden="true" className="size-5" />}
            onClick={() => shiftViewedMonth(-1)}
            variant="ghost"
          />
          <div className="flex items-center gap-2 text-slate-800">
            <CalendarDays aria-hidden="true" className="size-5 text-violet-500" />
            <span className="text-sm font-black capitalize sm:text-base">
              {monthLabel}
            </span>
          </div>
          <Button
            aria-label="Mois suivant"
            disabled={isCurrentMonth}
            icon={<ChevronRight aria-hidden="true" className="size-5" />}
            onClick={() => shiftViewedMonth(1)}
            variant="ghost"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCurrentMonth ? (
            <StatusPill tone="mint">Mois en cours</StatusPill>
          ) : (
            <Button onClick={() => setMonthKey(currentMonthKey)} variant="secondary">
              Revenir à ce mois
            </Button>
          )}
        </div>
      </div>

      <StatusToastBanner isVisible={isStatusToastVisible} toast={statusToast} />

      {isLoading ? (
        <EmptyState
          description="Récupération des apprentissages gardés..."
          title="Chargement"
        />
      ) : monthEntries.length === 0 ? (
        <EmptyState
          description="Aucun apprentissage gardé pour ce mois. Les entrées apparaissent ici après la revue hebdomadaire."
          icon={
            <CalendarDays aria-hidden="true" className="size-10 text-violet-500" />
          }
          title="Mois sans apprentissage gardé"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <StatusPill tone="blue">
              {monthEntries.length} apprentissage
              {monthEntries.length > 1 ? "s" : ""}
            </StatusPill>
            <StatusPill tone="violet">{monthScore} étoile{monthScore > 1 ? "s" : ""}</StatusPill>
            <StatusPill tone="slate">Triés par note</StatusPill>
          </div>

          <div className="space-y-3">
            {monthEntries.map((entry) => (
              <MonthEntryCard
                entry={entry}
                key={entry.id}
                onRequestDiscard={setEntryToDiscard}
              />
            ))}
          </div>
        </>
      )}

      {entryToDiscard ? (
        <DiscardMonthEntryModal
          entry={entryToDiscard}
          isBusy={isDiscarding}
          onCancel={() => setEntryToDiscard(null)}
          onConfirm={() => void confirmDiscardEntry()}
        />
      ) : null}
    </section>
  );
}
