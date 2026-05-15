import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
  ThumbsDown,
  ThumbsUp,
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
  formatWeekRangeLabel,
  getCurrentWeekRange,
  isCurrentWeek,
  shiftWeekRange,
  type WeekRange,
} from "../../lib/dates";
import type { EntryRating, LearningEntry } from "../../lib/db";
import {
  getEntryDecision,
  saveWeeklyReview,
  type EntryDecision,
  type WeekReviewDrafts,
} from "./reviewStorage";
import {
  useWeekReviewData,
  useWeekStartSetting,
} from "./useWeekReviewData";

const STARS_MAX_RATING: EntryRating = 5;
const RATING_OPTIONS: EntryRating[] = [1, 2, 3, 4, 5];

function buildDraftsFromEntries(
  entries: LearningEntry[],
  overrides: WeekReviewDrafts,
): WeekReviewDrafts {
  const drafts: WeekReviewDrafts = {};

  entries.forEach((entry) => {
    const override = overrides[entry.id];
    if (override) {
      drafts[entry.id] = override;
      return;
    }

    const decision = getEntryDecision(entry);
    if (decision) {
      drafts[entry.id] = { decision, rating: entry.rating };
    }
  });

  return drafts;
}

function getKeptCount(drafts: WeekReviewDrafts) {
  return Object.values(drafts).filter((draft) => draft.decision === "kept").length;
}

function getDiscardedCount(drafts: WeekReviewDrafts) {
  return Object.values(drafts).filter(
    (draft) => draft.decision === "discarded",
  ).length;
}

function useEntryCoverThumbnail(coverImage: Blob | undefined) {
  const objectUrl = useMemo(
    () => (coverImage ? URL.createObjectURL(coverImage) : undefined),
    [coverImage],
  );

  useEffect(() => {
    if (!objectUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  return objectUrl;
}

type EntryReviewCardProps = {
  entry: LearningEntry;
  draft: { decision?: EntryDecision; rating?: EntryRating };
  onDecisionChange: (decision: EntryDecision) => void;
  onRatingChange: (rating: EntryRating | undefined) => void;
  disabled: boolean;
};

function EntryReviewCard({
  entry,
  draft,
  onDecisionChange,
  onRatingChange,
  disabled,
}: EntryReviewCardProps) {
  const coverUrl = useEntryCoverThumbnail(entry.coverImage);
  const decision = draft.decision;
  const currentRating = draft.rating;

  return (
    <Card className="p-4 sm:p-5" tone="solid">
      <div className="flex flex-col gap-3 sm:flex-row">
        {coverUrl ? (
          <img
            alt=""
            className="h-24 w-full shrink-0 rounded-2xl object-cover sm:h-28 sm:w-40"
            src={coverUrl}
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-black leading-6 text-slate-900 sm:text-base">
            {entry.content}
          </p>
          {entry.description ? (
            <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-600">
              {entry.description}
            </p>
          ) : null}
          {entry.url ? (
            <a
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900"
              href={entry.url}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="max-w-xs truncate">{entry.url}</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          aria-label="Note de 1 à 5"
          className="inline-flex items-center gap-1"
          role="radiogroup"
        >
          {RATING_OPTIONS.map((value) => {
            const isFilled = currentRating !== undefined && value <= currentRating;
            return (
              <button
                aria-checked={currentRating === value}
                aria-label={`Note ${value} sur ${STARS_MAX_RATING}`}
                className="rounded-full p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
                key={value}
                onClick={() =>
                  onRatingChange(currentRating === value ? undefined : value)
                }
                role="radio"
                type="button"
              >
                <Star
                  aria-hidden="true"
                  className={[
                    "size-5",
                    isFilled
                      ? "fill-amber-400 stroke-amber-500"
                      : "fill-transparent stroke-slate-300",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            aria-pressed={decision === "kept"}
            className={
              decision === "kept"
                ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600"
                : ""
            }
            disabled={disabled}
            icon={<ThumbsUp aria-hidden="true" className="size-4" />}
            onClick={() => onDecisionChange("kept")}
            size="md"
            variant={decision === "kept" ? "primary" : "secondary"}
          >
            Garder
          </Button>
          <Button
            aria-pressed={decision === "discarded"}
            className={
              decision === "discarded"
                ? "bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600"
                : ""
            }
            disabled={disabled}
            icon={<ThumbsDown aria-hidden="true" className="size-4" />}
            onClick={() => onDecisionChange("discarded")}
            size="md"
            variant={decision === "discarded" ? "primary" : "secondary"}
          >
            Jeter
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function WeekPage() {
  const { weekStartsOn, isLoading: isWeekStartLoading } = useWeekStartSetting();
  const [range, setRange] = useState<WeekRange>(() =>
    getCurrentWeekRange("monday"),
  );
  const [hasUserChosenRange, setHasUserChosenRange] = useState(false);
  const [trackedWeekStartsOn, setTrackedWeekStartsOn] = useState<
    typeof weekStartsOn | null
  >(null);

  if (
    !hasUserChosenRange &&
    !isWeekStartLoading &&
    trackedWeekStartsOn !== weekStartsOn
  ) {
    setTrackedWeekStartsOn(weekStartsOn);
    setRange(getCurrentWeekRange(weekStartsOn));
  }

  const { entries, review, isLoading } = useWeekReviewData(range);
  const [overrides, setOverrides] = useState<WeekReviewDrafts>({});
  const [trackedRangeKey, setTrackedRangeKey] = useState<string>(
    range.weekStart,
  );

  if (trackedRangeKey !== range.weekStart) {
    setTrackedRangeKey(range.weekStart);
    setOverrides({});
  }

  const drafts = useMemo(
    () => buildDraftsFromEntries(entries, overrides),
    [entries, overrides],
  );

  const { statusToast, isStatusToastVisible, showStatusToast } = useStatusToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalEntries = entries.length;
  const decidedEntries = Object.values(drafts).filter((draft) =>
    Boolean(draft.decision),
  ).length;
  const allDecided = totalEntries > 0 && decidedEntries === totalEntries;
  const showCurrent = isCurrentWeek(range, weekStartsOn);
  const reviewSubmittedAt = review?.updatedAt;

  function shiftWeek(weeks: number) {
    setRange((current) => shiftWeekRange(current, weeks));
    setHasUserChosenRange(true);
  }

  function goToCurrentWeek() {
    setRange(getCurrentWeekRange(weekStartsOn));
    setHasUserChosenRange(false);
  }

  function setDecision(entryId: string, decision: EntryDecision) {
    setOverrides((current) => ({
      ...current,
      [entryId]: {
        decision,
        rating: drafts[entryId]?.rating,
      },
    }));
  }

  function setRating(entryId: string, rating: EntryRating | undefined) {
    const existing = drafts[entryId];
    if (!existing?.decision) {
      return;
    }

    setOverrides((current) => ({
      ...current,
      [entryId]: {
        decision: existing.decision,
        rating,
      },
    }));
  }

  async function handleValidate() {
    if (!allDecided) {
      showStatusToast(
        "Décide de chaque entrée avant de valider.",
        "error",
      );
      return;
    }

    const isUpdate = Boolean(review);
    setIsSubmitting(true);

    try {
      const completeDrafts = Object.entries(drafts).reduce<WeekReviewDrafts>(
        (accumulator, [entryId, draft]) => {
          if (draft.decision) {
            accumulator[entryId] = {
              decision: draft.decision,
              rating: draft.rating,
            };
          }
          return accumulator;
        },
        {},
      );

      const result = await saveWeeklyReview(range, completeDrafts);
      setOverrides({});

      const keptLabel = `${result.keptCount} gardé${result.keptCount > 1 ? "s" : ""}`;
      const discardedLabel =
        result.discardedCount > 0
          ? `, ${result.discardedCount} jeté${result.discardedCount > 1 ? "s" : ""} et supprimé${result.discardedCount > 1 ? "s" : ""}`
          : "";
      const verb = isUpdate ? "mise à jour" : "validée";

      showStatusToast(
        `Revue ${verb} : ${keptLabel}${discardedLabel}.`,
        "success",
      );
    } catch (error) {
      showStatusToast(
        error instanceof Error ? error.message : "Validation impossible.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl pb-12">
      <PageHeader
        eyebrow="Revue"
        title="Ta semaine d'apprentissage"
        description="Note ce que tu as appris, garde ce qui compte, jette le bruit. Tes choix nourrissent les insights."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/85 p-4 shadow-md shadow-slate-900/5 backdrop-blur sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            aria-label="Semaine précédente"
            icon={<ChevronLeft aria-hidden="true" className="size-5" />}
            onClick={() => shiftWeek(-1)}
            variant="ghost"
          />
          <div className="flex items-center gap-2 text-slate-800">
            <CalendarRange aria-hidden="true" className="size-5 text-violet-500" />
            <span className="text-sm font-black sm:text-base">
              {formatWeekRangeLabel(range)}
            </span>
          </div>
          <Button
            aria-label="Semaine suivante"
            icon={<ChevronRight aria-hidden="true" className="size-5" />}
            onClick={() => shiftWeek(1)}
            variant="ghost"
          />
        </div>

        <div className="flex items-center gap-2">
          {showCurrent ? (
            <StatusPill tone="mint">Semaine en cours</StatusPill>
          ) : (
            <Button onClick={goToCurrentWeek} variant="secondary">
              Revenir à cette semaine
            </Button>
          )}
        </div>
      </div>

      {review ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          <StatusPill tone="violet">Revue déjà validée</StatusPill>
          {reviewSubmittedAt ? (
            <span>
              Dernière mise à jour :{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(reviewSubmittedAt))}
            </span>
          ) : null}
        </div>
      ) : null}

      <StatusToastBanner
        isVisible={isStatusToastVisible}
        toast={statusToast}
      />

      {isLoading ? (
        <EmptyState
          description="Récupération des entrées de la semaine..."
          title="Chargement"
        />
      ) : entries.length === 0 ? (
        <EmptyState
          description="Aucun apprentissage à reviewer pour cette semaine. Reviens après avoir ajouté quelques idées."
          title="Semaine vide"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <StatusPill tone="blue">{totalEntries} apprentissage{totalEntries > 1 ? "s" : ""}</StatusPill>
            <StatusPill tone="mint">{getKeptCount(drafts)} gardé{getKeptCount(drafts) > 1 ? "s" : ""}</StatusPill>
            <StatusPill tone="slate">{getDiscardedCount(drafts)} jeté{getDiscardedCount(drafts) > 1 ? "s" : ""}</StatusPill>
            <StatusPill tone="violet">
              {totalEntries - decidedEntries} à décider
            </StatusPill>
          </div>

          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryReviewCard
                disabled={isSubmitting}
                draft={drafts[entry.id] ?? {}}
                entry={entry}
                key={entry.id}
                onDecisionChange={(decision) => setDecision(entry.id, decision)}
                onRatingChange={(rating) => setRating(entry.id, rating)}
              />
            ))}
          </div>

          <div className="mt-8">
            <Button
              className="w-full"
              disabled={!allDecided || isSubmitting}
              onClick={handleValidate}
              size="lg"
              variant="primary"
            >
              {review ? "Mettre à jour la revue" : "Valider la revue"}
            </Button>
            {!allDecided ? (
              <p className="mt-2 text-center text-xs font-semibold text-slate-500">
                Choisis garder ou jeter pour chaque entrée pour pouvoir valider.
              </p>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
