import {
  type FormEvent,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownToLine,
  BookmarkPlus,
  Clock3,
  ExternalLink,
  ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  Button,
  Card,
  EmptyState,
  EmojiBadge,
  Input,
  StatusPill,
  StatusToastBanner,
  Textarea,
  useStatusToast,
} from "../../components/ui";
import { formatDayLabel, formatTimeLabel } from "../../lib/dates";
import {
  createCustomEntry,
  createEntryFromPreset,
  createPresetFromCustomEntry,
  deleteEntry,
  isEmptyPreset,
  normalizePresetLabel,
} from "./entryStorage";
import { useTimelineData, type TimelineDay } from "./useTimelineData";
import { useActiveDay } from "./useActiveDay";
import type { LearningEntry, LearningPreset } from "../../lib/db";

const TIMELINE_DAYS_VISIBLE = 7;
const TIMELINE_VIEWBOX_WIDTH = 120;
const TIMELINE_VIEWBOX_HEIGHT = 1200;
const TIMELINE_PATH =
  "M60 0 C20 100 20 200 60 300 C100 400 100 500 60 600 C20 700 20 800 60 900 C100 1000 100 1100 60 1200";
const ACTIVE_DAY_STORAGE_KEY = "today-page-active-day-v1";
const AUTO_SCROLL_GRACE_PERIOD_MS = 2500;
const COVER_MIN_FILL_RATIO = 1.2;
const COVER_MAX_FILL_RATIO = 2.0;

function readStoredActiveDay(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ACTIVE_DAY_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredActiveDay(dateKey: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(ACTIVE_DAY_STORAGE_KEY, dateKey);
  } catch {
    // ignore quota / disabled storage
  }
}

function hasVisiblePresetForEntry(
  entryContent: string,
  presets: LearningPreset[],
) {
  const normalizedEntryContent = normalizePresetLabel(entryContent);

  return presets.some(
    (preset) => normalizePresetLabel(preset.label) === normalizedEntryContent,
  );
}

function getEntrySourceLabel(source: LearningEntry["source"]) {
  if (source === "preset") {
    return "Choix rapide";
  }

  if (source === "custom") {
    return "Idée libre";
  }

  return "Pause";
}

function useEntryCoverImageUrl(coverImage: Blob | undefined) {
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

function EntryCoverImage({ entry }: { entry: LearningEntry }) {
  const storedCoverUrl = useEntryCoverImageUrl(entry.coverImage);
  const youtubeFallback = entry.coverImage
    ? undefined
    : getYouTubeThumbnailUrl(entry.url);
  const previewUrl = storedCoverUrl ?? youtubeFallback;
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("cover");

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) {
      return;
    }
    const ratio = img.naturalWidth / img.naturalHeight;
    const fillsContainerNicely =
      ratio >= COVER_MIN_FILL_RATIO && ratio <= COVER_MAX_FILL_RATIO;
    setObjectFit(fillsContainerNicely ? "cover" : "contain");
  }

  if (previewUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        <img
          alt=""
          className={[
            "block h-full w-full",
            objectFit === "cover" ? "object-cover" : "object-contain",
          ].join(" ")}
          onLoad={handleImageLoad}
          src={previewUrl}
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-slate-400">
      <ImageIcon aria-hidden="true" className="size-7" />
    </div>
  );
}

function getYouTubeThumbnailUrl(entryUrl?: string) {
  if (!entryUrl) {
    return undefined;
  }

  try {
    const url = new URL(entryUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:shorts|embed)\/([^/?#]+)/)?.[1];

      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function normalizeEntryUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  try {
    return new URL(trimmedValue).toString();
  } catch {
    throw new Error("Entre une URL valide ou laisse le champ vide.");
  }
}

function TimelinePath() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 overflow-visible"
    >
      <svg
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox={`0 0 ${TIMELINE_VIEWBOX_WIDTH} ${TIMELINE_VIEWBOX_HEIGHT}`}
      >
        <path
          d={TIMELINE_PATH}
          fill="none"
          stroke="rgba(99, 102, 241, 0.26)"
          strokeLinecap="round"
          strokeWidth="10"
        />
        <path
          d={TIMELINE_PATH}
          fill="none"
          stroke="rgba(20, 184, 166, 0.45)"
          strokeDasharray="3 24"
          strokeLinecap="round"
          strokeWidth="5"
        />
      </svg>
    </div>
  );
}

type EntryCardProps = {
  entry: LearningEntry;
  isLeft: boolean;
  presets: LearningPreset[];
  isSubmitting: boolean;
  onDelete: (entryId: string) => void;
  onCreatePreset: (entryId: string) => void;
};

function EntryArticle({
  entry,
  isLeft,
  presets,
  isSubmitting,
  onDelete,
  onCreatePreset,
}: EntryCardProps) {
  return (
    <article className="grid min-h-44 grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] sm:gap-4">
      <div className={isLeft ? "col-start-1" : "col-start-3"}>
        <Card className="p-3 shadow-xl sm:p-4" tone="solid">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill tone={entry.source === "empty" ? "slate" : "blue"}>
              {getEntrySourceLabel(entry.source)}
            </StatusPill>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 sm:text-sm">
              <Clock3 aria-hidden="true" className="size-4" />
              {formatTimeLabel(entry.createdAt)}
            </span>
          </div>
          <p className="break-words text-sm font-black leading-6 text-slate-800 sm:text-base sm:leading-7">
            {entry.content}
          </p>
          {entry.description ? (
            <p className="mt-3 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-600">
              {entry.description}
            </p>
          ) : null}
          {entry.url ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
              <EntryCoverImage entry={entry} />
              <a
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-violet-700 hover:text-violet-900"
                href={entry.url}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
                <span className="truncate">{entry.url}</span>
              </a>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {entry.source === "custom" ? (
              hasVisiblePresetForEntry(entry.content, presets) ? (
                <StatusPill tone="mint">Déjà en choix rapide</StatusPill>
              ) : (
                <Button
                  className="max-w-full whitespace-normal px-3 text-xs leading-tight"
                  disabled={isSubmitting}
                  icon={
                    <BookmarkPlus
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  }
                  onClick={() => onCreatePreset(entry.id)}
                  variant="secondary"
                >
                  Ajouter aux choix rapides
                </Button>
              )
            ) : null}
            <Button
              aria-label="Supprimer cette entrée"
              className="min-h-10 px-3"
              icon={<Trash2 aria-hidden="true" className="size-4" />}
              onClick={() => onDelete(entry.id)}
              variant="ghost"
            />
          </div>
        </Card>
      </div>

      <div className="col-start-2 row-start-1 flex h-full items-center justify-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-white/80 bg-white/90 shadow-lg shadow-slate-900/10">
          <EmojiBadge
            className="size-9 text-base"
            emoji={entry.source === "empty" ? "🌙" : "✨"}
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className={[
          "col-start-2 row-start-1 h-px border-t border-dashed border-slate-300",
          isLeft ? "-ml-[50%]" : "-mr-[50%]",
        ].join(" ")}
      />
    </article>
  );
}

type DaySectionProps = {
  day: TimelineDay;
  todayKey: string;
  presets: LearningPreset[];
  isSubmitting: boolean;
  todayRef: React.RefObject<HTMLElement | null>;
  onDelete: (entryId: string) => void;
  onCreatePreset: (entryId: string) => void;
  onOpenComposer: () => void;
};

function DaySection({
  day,
  todayKey,
  presets,
  isSubmitting,
  todayRef,
  onDelete,
  onCreatePreset,
  onOpenComposer,
}: DaySectionProps) {
  const { dateKey, entries } = day;
  const isToday = dateKey === todayKey;
  const dayLabel = formatDayLabel(dateKey, todayKey);

  return (
    <section
      className="relative min-h-[80vh] py-10"
      data-day-section={dateKey}
      ref={isToday ? todayRef : undefined}
    >
      <TimelinePath />

      {isToday ? (
        <header className="relative z-10 mx-auto mb-16 max-w-2xl pt-8 text-center">
          <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            Qu'as-tu appris aujourd'hui&nbsp;?
          </h1>
        </header>
      ) : (
        <header className="relative z-10 mx-auto mb-10 flex max-w-2xl justify-center pt-4 text-center">
          <StatusPill tone="slate">{dayLabel}</StatusPill>
        </header>
      )}

      {entries.length > 0 ? (
        <div className="relative z-10 mx-auto max-w-5xl space-y-10">
          {entries.map((entry, index) => (
            <EntryArticle
              entry={entry}
              isLeft={index % 2 === 0}
              isSubmitting={isSubmitting}
              key={entry.id}
              onCreatePreset={onCreatePreset}
              onDelete={onDelete}
              presets={presets}
            />
          ))}
        </div>
      ) : isToday ? (
        <div className="relative z-10 mx-auto w-[min(92vw,32rem)]">
          <EmptyState
            description="Choisis une réponse rapide ou écris une note libre. Elle restera disponible après refresh."
            icon={
              <Sparkles aria-hidden="true" className="size-6 text-violet-500" />
            }
            title="Aucune entrée pour le moment"
          />
          <div className="mt-4 flex justify-center">
            <Button
              icon={<Plus aria-hidden="true" className="size-5" />}
              onClick={onOpenComposer}
              size="lg"
            >
              Ajouter ta première idée
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function TodayPage() {
  const { days, presets, todayKey } = useTimelineData(TIMELINE_DAYS_VISIBLE);
  const renderedDays = useMemo(
    () =>
      days.filter(
        (day) => day.dateKey === todayKey || day.entries.length > 0,
      ),
    [days, todayKey],
  );
  const dayKeys = useMemo(
    () => renderedDays.map((day) => day.dateKey),
    [renderedDays],
  );
  const activeDay = useActiveDay(dayKeys);
  const todaySectionRef = useRef<HTMLElement | null>(null);
  const userInteractedRef = useRef(false);
  const [mountTime] = useState(() => performance.now());
  const [customContent, setCustomContent] = useState("");
  const [description, setDescription] = useState("");
  const [entryUrl, setEntryUrl] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const { statusToast, isStatusToastVisible, showStatusToast } = useStatusToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const visiblePresets = useMemo(
    () => presets.filter((preset) => !isEmptyPreset(preset)),
    [presets],
  );

  const activeDayEntry = useMemo(
    () =>
      renderedDays.find((day) => day.dateKey === activeDay) ??
      renderedDays[renderedDays.length - 1],
    [renderedDays, activeDay],
  );

  const activeDayLabel = activeDayEntry
    ? formatDayLabel(activeDayEntry.dateKey, todayKey)
    : "Aujourd'hui";
  const activeLearningCount = activeDayEntry
    ? activeDayEntry.entries.filter((entry) => entry.source !== "empty").length
    : 0;
  const isOnToday = activeDayEntry?.dateKey === todayKey;

  useLayoutEffect(() => {
    if (userInteractedRef.current) {
      return;
    }
    if (renderedDays.length === 0) {
      return;
    }
    if (performance.now() - mountTime > AUTO_SCROLL_GRACE_PERIOD_MS) {
      return;
    }

    const stored = readStoredActiveDay();
    const desiredDateKey =
      stored && renderedDays.some((day) => day.dateKey === stored)
        ? stored
        : todayKey;

    const targetSection = document.querySelector<HTMLElement>(
      `[data-day-section="${desiredDateKey}"]`,
    );
    targetSection?.scrollIntoView({ block: "start" });
  }, [renderedDays, todayKey, mountTime]);

  useEffect(() => {
    function markUserInteraction() {
      userInteractedRef.current = true;
    }

    const scrollContainer = document.querySelector("main");
    const interactionTarget: HTMLElement | Window =
      scrollContainer ?? window;

    interactionTarget.addEventListener("wheel", markUserInteraction, {
      once: true,
      passive: true,
    });
    interactionTarget.addEventListener("touchstart", markUserInteraction, {
      once: true,
      passive: true,
    });
    document.addEventListener("keydown", markUserInteraction, { once: true });

    return () => {
      interactionTarget.removeEventListener("wheel", markUserInteraction);
      interactionTarget.removeEventListener("touchstart", markUserInteraction);
      document.removeEventListener("keydown", markUserInteraction);
    };
  }, []);

  useEffect(() => {
    if (!activeDay) {
      return;
    }
    writeStoredActiveDay(activeDay);
  }, [activeDay]);

  function scrollToToday() {
    todaySectionRef.current?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }

  function resetComposer() {
    setCustomContent("");
    setDescription("");
    setEntryUrl("");
    setSelectedPresetId(undefined);
  }

  function handleCustomContentChange(value: string) {
    setCustomContent(value);
    setSelectedPresetId((currentPresetId) => {
      const selectedPreset = presets.find(
        (preset) => preset.id === currentPresetId,
      );

      if (
        selectedPreset &&
        normalizePresetLabel(selectedPreset.label) === normalizePresetLabel(value)
      ) {
        return currentPresetId;
      }

      return undefined;
    });
  }

  function handlePresetClick(presetId: string) {
    const preset = presets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setCustomContent(preset.label);
    setSelectedPresetId(preset.id);
  }

  async function handleCustomSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = customContent.trim();
    const trimmedDescription = description.trim();

    if (!trimmedContent) {
      showStatusToast("Écris une réponse avant d'ajouter.", "error");
      return;
    }

    if (!trimmedDescription) {
      showStatusToast("Ajoute une description avant d'ajouter.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedUrl = normalizeEntryUrl(entryUrl);
      const selectedPreset = presets.find(
        (preset) => preset.id === selectedPresetId,
      );
      const entryDetails = {
        description: trimmedDescription,
        ...(normalizedUrl ? { url: normalizedUrl } : {}),
      };

      if (
        selectedPreset &&
        normalizePresetLabel(selectedPreset.label) ===
          normalizePresetLabel(trimmedContent)
      ) {
        await createEntryFromPreset(selectedPreset, entryDetails);
      } else {
        await createCustomEntry(trimmedContent, entryDetails);
      }

      resetComposer();
      setIsComposerOpen(false);
      showStatusToast("Réponse ajoutée.", "success");
      scrollToToday();
    } catch (error) {
      showStatusToast(
        error instanceof Error ? error.message : "Ajout impossible.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    try {
      await deleteEntry(entryId);
      showStatusToast("Entrée supprimée.", "success");
    } catch (error) {
      showStatusToast(
        error instanceof Error ? error.message : "Suppression impossible.",
        "error",
      );
    }
  }

  async function handleCreatePreset(entryId: string) {
    const targetEntry = renderedDays
      .flatMap((day) => day.entries)
      .find((entry) => entry.id === entryId);

    if (!targetEntry) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPresetFromCustomEntry(targetEntry);

      if (result.status === "created") {
        showStatusToast("Ajouté aux choix rapides.", "success");
        return;
      }

      if (result.status === "restored") {
        showStatusToast("Choix rapide réactivé.", "success");
        return;
      }

      showStatusToast("Ce choix rapide existe déjà.", "error");
    } catch (error) {
      showStatusToast(
        error instanceof Error
          ? error.message
          : "Création du choix rapide impossible.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-5xl pb-20">
      <StatusToastBanner
        isVisible={isStatusToastVisible}
        toast={statusToast}
      />

      <div className="fixed left-1/2 top-4 z-30 w-[min(92vw,34rem)] -translate-x-1/2 text-center">
        <div className="flex items-center justify-center gap-2">
          <StatusPill tone={isOnToday ? "mint" : "slate"}>
            {activeDayLabel}
          </StatusPill>
          <StatusPill tone="violet">
            {activeLearningCount} apprentissage
            {activeLearningCount > 1 ? "s" : ""}
          </StatusPill>
        </div>
        {!isOnToday ? (
          <div className="mt-2 flex justify-center">
            <Button
              className="min-h-9 px-3 py-1.5 text-xs"
              icon={
                <ArrowDownToLine aria-hidden="true" className="size-4" />
              }
              onClick={scrollToToday}
              variant="secondary"
            >
              Revenir à aujourd'hui
            </Button>
          </div>
        ) : null}
      </div>

      {isOnToday ? (
        <Button
          aria-expanded={isComposerOpen}
          aria-label="Ajouter une entrée pour aujourd'hui"
          className="fixed left-1/2 top-1/2 z-30 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 shadow-2xl shadow-violet-500/30"
          icon={<Plus aria-hidden="true" className="size-7" />}
          motion="none"
          onClick={() => setIsComposerOpen((value) => !value)}
        />
      ) : null}

      {isComposerOpen ? (
        <div
          aria-modal="false"
          className="fixed left-1/2 top-1/2 z-40 max-h-[min(82vh,_38rem)] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
          role="dialog"
        >
          <Card className="p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-wide text-violet-700">
                Nouvelle idée pour aujourd'hui
              </p>
              <Button
                aria-label="Fermer"
                className="min-h-10 px-3"
                icon={<X aria-hidden="true" className="size-4" />}
                onClick={() => setIsComposerOpen(false)}
                variant="ghost"
              />
            </div>

            <div className="mb-4 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
              {visiblePresets.map((preset) => (
                <Button
                  disabled={isSubmitting}
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  variant="pill"
                >
                  {preset.emoji ? `${preset.emoji} ` : ""}
                  {preset.label}
                </Button>
              ))}
            </div>

            <form onSubmit={handleCustomSubmit}>
              <Textarea
                label="Idée"
                onChange={(event) => handleCustomContentChange(event.target.value)}
                placeholder="Résume ton apprentissage..."
                value={customContent}
              />
              <div className="mt-4">
                <Textarea
                  className="min-h-44 resize-y"
                  label="Description"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Décris ce que tu as appris, pourquoi c'est utile, le contexte, les détails..."
                  value={description}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="URL facultative"
                  onChange={(event) => setEntryUrl(event.target.value)}
                  placeholder="https://..."
                  type="url"
                  value={entryUrl}
                />
              </div>

              <div className="mt-4">
                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  icon={<Plus aria-hidden="true" className="size-5" />}
                  size="lg"
                  type="submit"
                >
                  Ajouter à ma journée
                </Button>
              </div>
            </form>

            {visiblePresets.length === 0 ? (
              <EmptyState
                className="mt-4"
                description="Termine l'onboarding ou ajoute des presets plus tard depuis les réglages."
                title="Aucun choix rapide disponible"
              />
            ) : null}
          </Card>
        </div>
      ) : null}

      <div className="relative z-10">
        {renderedDays.map((day) => (
          <DaySection
            day={day}
            isSubmitting={isSubmitting}
            key={day.dateKey}
            onCreatePreset={handleCreatePreset}
            onDelete={handleDelete}
            onOpenComposer={() => setIsComposerOpen(true)}
            presets={presets}
            todayKey={todayKey}
            todayRef={todaySectionRef}
          />
        ))}
      </div>
    </section>
  );
}
