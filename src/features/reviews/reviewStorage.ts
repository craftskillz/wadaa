import {
  db,
  entriesRepository,
  weeklyReviewsRepository,
  type EntryRating,
  type LearningEntry,
  type WeeklyReview,
} from "../../lib/db";
import type { WeekRange } from "../../lib/dates";

const WEEKLY_REVIEW_ID_PREFIX = "weeklyReview";

export type EntryDecision = "kept" | "discarded";

export type EntryReviewDraft = {
  decision: EntryDecision;
  rating?: EntryRating;
};

export type WeekReviewDrafts = Record<string, EntryReviewDraft>;

export function buildWeeklyReviewId(weekStart: string): string {
  return `${WEEKLY_REVIEW_ID_PREFIX}_${weekStart}`;
}

export function getEntryDecision(entry: LearningEntry): EntryDecision | undefined {
  if (entry.kept) {
    return "kept";
  }

  if (entry.discarded) {
    return "discarded";
  }

  return undefined;
}

export type SaveWeeklyReviewResult = {
  review: WeeklyReview;
  keptCount: number;
  discardedCount: number;
};

export async function saveWeeklyReview(
  range: WeekRange,
  drafts: WeekReviewDrafts,
): Promise<SaveWeeklyReviewResult> {
  const entryIds = Object.keys(drafts);

  if (entryIds.length === 0) {
    throw new Error("Aucune entrée à valider pour cette semaine.");
  }

  const now = new Date().toISOString();
  const reviewId = buildWeeklyReviewId(range.weekStart);
  const selectedEntryIds = entryIds.filter(
    (entryId) => drafts[entryId].decision === "kept",
  );
  const discardedEntryIds = entryIds.filter(
    (entryId) => drafts[entryId].decision === "discarded",
  );

  let savedReview: WeeklyReview | undefined;

  await db.transaction("rw", db.entries, db.weeklyReviews, async () => {
    const entries = await db.entries.bulkGet(entryIds);
    const existingReview = await db.weeklyReviews.get(reviewId);
    const previousDiscardedIds = existingReview?.discardedEntryIds ?? [];

    const keptUpdates: LearningEntry[] = entries
      .filter((entry): entry is LearningEntry => Boolean(entry))
      .filter((entry) => drafts[entry.id].decision === "kept")
      .map((entry) => ({
        ...entry,
        kept: true,
        discarded: false,
        rating: drafts[entry.id].rating,
        updatedAt: now,
      }));

    if (keptUpdates.length > 0) {
      await db.entries.bulkPut(keptUpdates);
    }

    if (discardedEntryIds.length > 0) {
      await db.entries.bulkDelete(discardedEntryIds);
    }

    const mergedDiscardedIds = Array.from(
      new Set([...previousDiscardedIds, ...discardedEntryIds]),
    );

    const review: WeeklyReview = existingReview
      ? {
          ...existingReview,
          selectedEntryIds,
          discardedEntryIds: mergedDiscardedIds,
          updatedAt: now,
        }
      : {
          id: reviewId,
          weekStart: range.weekStart,
          weekEnd: range.weekEnd,
          selectedEntryIds,
          discardedEntryIds,
          createdAt: now,
          updatedAt: now,
        };

    await db.weeklyReviews.put(review);
    savedReview = review;
  });

  if (!savedReview) {
    throw new Error("La revue n'a pas pu être enregistrée.");
  }

  return {
    review: savedReview,
    keptCount: selectedEntryIds.length,
    discardedCount: discardedEntryIds.length,
  };
}

export async function getWeeklyReview(
  weekStart: string,
): Promise<WeeklyReview | undefined> {
  return weeklyReviewsRepository.getById(buildWeeklyReviewId(weekStart));
}

export type { LearningEntry, WeeklyReview };
export { entriesRepository, weeklyReviewsRepository };
