import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BookOpen,
  BookmarkPlus,
  Clock3,
  ExternalLink,
  ImageIcon,
  Plus,
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
  Textarea,
} from "../../components/ui";
import { formatTimeLabel } from "../../lib/dates";
import {
  createCustomEntry,
  createEntryFromPreset,
  createPresetFromCustomEntry,
  deleteEntry,
  isEmptyPreset,
  normalizePresetLabel,
} from "./entryStorage";
import { useTodayData } from "./useTodayData";
import type { LearningEntry, LearningPreset } from "../../lib/db";

const TIMELINE_VIEWBOX_WIDTH = 120;
const TIMELINE_VIEWBOX_HEIGHT = 1200;
const TIMELINE_PATH =
  "M60 0 C18 120 102 240 60 360 C18 480 102 600 60 720 C18 840 102 960 60 1080 C42 1140 50 1170 60 1200";
const STATUS_TOAST_VISIBLE_MS = 2200;
const STATUS_TOAST_FADE_MS = 300;

type StatusToast = {
  id: number;
  message: string;
};

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

  if (previewUrl) {
    return (
      <img
        alt=""
        className="aspect-video w-full object-cover"
        src={previewUrl}
      />
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
      className="pointer-events-none absolute -bottom-28 left-1/2 top-0 w-24 -translate-x-1/2 overflow-visible"
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

export function TodayPage() {
  const { entries, presets } = useTodayData();
  const [customContent, setCustomContent] = useState("");
  const [description, setDescription] = useState("");
  const [entryUrl, setEntryUrl] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [statusToast, setStatusToast] = useState<StatusToast | null>(null);
  const [isStatusToastVisible, setIsStatusToastVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const statusToastIdRef = useRef(0);
  const timelineEntries = useMemo(
    () =>
      [...entries].sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt),
      ),
    [entries],
  );
  const visiblePresets = useMemo(
    () => presets.filter((preset) => !isEmptyPreset(preset)),
    [presets],
  );
  const learningEntriesCount = entries.filter(
    (entry) => entry.source !== "empty",
  ).length;

  useEffect(() => {
    if (!statusToast) {
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIsStatusToastVisible(false);
    }, STATUS_TOAST_VISIBLE_MS);
    const clearTimer = window.setTimeout(() => {
      setStatusToast((currentToast) =>
        currentToast?.id === statusToast.id ? null : currentToast,
      );
    }, STATUS_TOAST_VISIBLE_MS + STATUS_TOAST_FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [statusToast]);

  function showStatusMessage(message: string) {
    statusToastIdRef.current += 1;
    setIsStatusToastVisible(true);
    setStatusToast({ id: statusToastIdRef.current, message });
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
              const selectedPreset = presets.find((preset) => preset.id === currentPresetId);

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
      showStatusMessage("Écris une réponse avant d'ajouter.");
      return;
    }

    if (!trimmedDescription) {
      showStatusMessage("Ajoute une description avant d'ajouter.");
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
      showStatusMessage("Réponse ajoutée.");
    } catch (error) {
      showStatusMessage(
        error instanceof Error ? error.message : "Ajout impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    try {
      await deleteEntry(entryId);
      showStatusMessage("Entrée supprimée.");
    } catch (error) {
      showStatusMessage(
        error instanceof Error ? error.message : "Suppression impossible.",
      );
    }
  }

  async function handleCreatePreset(entryId: string) {
    const entry = entries.find((item) => item.id === entryId);

    if (!entry) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPresetFromCustomEntry(entry);

      if (result.status === "created") {
        showStatusMessage("Ajouté aux choix rapides.");
        return;
      }

      if (result.status === "restored") {
        showStatusMessage("Choix rapide réactivé.");
        return;
      }

      showStatusMessage("Ce choix rapide existe déjà.");
    } catch (error) {
      showStatusMessage(
        error instanceof Error
          ? error.message
          : "Création du choix rapide impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative mx-auto min-h-[135vh] max-w-5xl pb-20">
      <TimelinePath />

      <div className="fixed left-1/2 top-4 z-30 w-[min(92vw,34rem)] -translate-x-1/2 text-center">
        <div className="flex items-center justify-center gap-2">
          <StatusPill tone="mint">Aujourd'hui</StatusPill>
          <StatusPill tone="violet">
            {learningEntriesCount} apprentissage
            {learningEntriesCount > 1 ? "s" : ""}
          </StatusPill>
        </div>
        {statusToast ? (
          <p
            aria-live="polite"
            className={[
              "mt-3 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-slate-500 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition duration-300 ease-out",
              isStatusToastVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0",
            ].join(" ")}
            role="status"
          >
            {statusToast.message}
          </p>
        ) : null}
      </div>

      <header className="relative z-10 mx-auto mb-28 max-w-2xl pt-24 text-center">
        <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
          Qu'as-tu appris aujourd'hui ?
        </h1>
      </header>

      <Button
        aria-expanded={isComposerOpen}
        aria-label="Ajouter une entrée"
        className="fixed left-1/2 top-1/2 z-30 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 shadow-2xl shadow-violet-500/30"
        icon={<Plus aria-hidden="true" className="size-7" />}
        motion="none"
        onClick={() => setIsComposerOpen((value) => !value)}
      />

      {timelineEntries.length === 0 && !isComposerOpen ? (
        <div className="fixed left-1/2 top-[calc(50vh+5rem)] z-20 w-[min(92vw,32rem)] -translate-x-1/2">
          <EmptyState
            description="Choisis une réponse rapide ou écris une note libre. Elle restera disponible après refresh."
            icon={
              <BookOpen aria-hidden="true" className="size-6 text-violet-500" />
            }
            title="Aucune entrée pour le moment"
          />
        </div>
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
                Nouvelle idée
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

      <div className="relative z-10 mt-28 space-y-10">
        {timelineEntries.length > 0
          ? timelineEntries.map((entry, index) => {
              const isLeft = index % 2 === 0;

              return (
                <article
                  className="grid min-h-44 grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] sm:gap-4"
                  key={entry.id}
                >
                  <div className={isLeft ? "col-start-1" : "col-start-3"}>
                    <Card className="p-3 shadow-xl sm:p-4" tone="solid">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <StatusPill
                          tone={entry.source === "empty" ? "slate" : "blue"}
                        >
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
                            <StatusPill tone="mint">
                              Déjà en choix rapide
                            </StatusPill>
                          ) : (
                            <Button
                              className="max-w-full px-3 text-xs leading-tight whitespace-normal"
                              disabled={isSubmitting}
                              icon={
                                <BookmarkPlus
                                  aria-hidden="true"
                                  className="size-4 shrink-0"
                                />
                              }
                              onClick={() => handleCreatePreset(entry.id)}
                              variant="secondary"
                            >
                              Ajouter aux choix rapides
                            </Button>
                          )
                        ) : null}
                        <Button
                          aria-label="Supprimer cette entrée"
                          className="min-h-10 px-3"
                          icon={
                            <Trash2 aria-hidden="true" className="size-4" />
                          }
                          onClick={() => handleDelete(entry.id)}
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
            })
          : null}
      </div>
    </section>
  );
}
