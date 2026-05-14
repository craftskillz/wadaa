import { type FormEvent, useState } from "react";
import { BookOpen, Clock3, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import {
  Button,
  Card,
  EmptyState,
  EmojiBadge,
  StatusPill,
  Textarea,
} from "../../components/ui";
import { formatTimeLabel } from "../../lib/dates";
import {
  createCustomEntry,
  createEmptyEntry,
  createEntryFromPreset,
  deleteEntry,
} from "./entryStorage";
import { useTodayData } from "./useTodayData";

export function TodayPage() {
  const { entries, presets } = useTodayData();
  const [customContent, setCustomContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const learningEntriesCount = entries.filter(
    (entry) => entry.source !== "empty",
  ).length;

  async function handlePresetClick(presetId: string) {
    const preset = presets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createEntryFromPreset(preset);
      setStatusMessage("Ajouté à ta journée.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Ajout impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCustomSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customContent.trim()) {
      setStatusMessage("Écris une réponse avant d'ajouter.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCustomEntry(customContent);
      setCustomContent("");
      setStatusMessage("Réponse ajoutée.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Ajout impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmptyEntry() {
    setIsSubmitting(true);
    try {
      await createEmptyEntry();
      setStatusMessage("Noté pour le moment.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Ajout impossible.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    try {
      await deleteEntry(entryId);
      setStatusMessage("Entrée supprimée.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Suppression impossible.",
      );
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <StatusPill tone="mint">Progression du jour</StatusPill>
        <StatusPill tone="violet">
          {learningEntriesCount} apprentissage
          {learningEntriesCount > 1 ? "s" : ""}
        </StatusPill>
      </div>

      <PageHeader
        eyebrow="Aujourd'hui"
        title="Qu'as-tu appris aujourd'hui ?"
        description="Capture une idée en quelques secondes. Le tri viendra plus tard, pendant la revue hebdomadaire."
      />

      <Card className="p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {presets.map((preset) => (
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
            label="Réponse libre"
            onChange={(event) => setCustomContent(event.target.value)}
            placeholder="Écris ton apprentissage..."
            value={customContent}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <Button
              disabled={isSubmitting}
              icon={<Plus aria-hidden="true" className="size-5" />}
              size="lg"
              type="submit"
            >
              Ajouter à ma journée
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleEmptyEntry}
              size="lg"
              variant="secondary"
            >
              Rien pour le moment
            </Button>
          </div>
        </form>

        {statusMessage ? (
          <p className="mt-4 text-sm font-bold text-slate-500" role="status">
            {statusMessage}
          </p>
        ) : null}
      </Card>

      <div className="mt-6">
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card className="p-4" key={entry.id} tone="solid">
                <div className="flex items-start gap-3">
                  <EmojiBadge
                    className="mt-0.5 size-10 text-lg"
                    emoji={entry.source === "empty" ? "🌙" : "✨"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusPill tone={entry.source === "empty" ? "slate" : "blue"}>
                        {entry.source === "preset"
                          ? "Choix rapide"
                          : entry.source === "custom"
                            ? "Réponse libre"
                            : "Pause"}
                      </StatusPill>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-400">
                        <Clock3 aria-hidden="true" className="size-4" />
                        {formatTimeLabel(entry.createdAt)}
                      </span>
                    </div>
                    <p className="break-words text-base font-bold leading-7 text-slate-800">
                      {entry.content}
                    </p>
                  </div>
                  <Button
                    aria-label="Supprimer cette entrée"
                    className="min-h-10 px-3"
                    icon={<Trash2 aria-hidden="true" className="size-4" />}
                    onClick={() => handleDelete(entry.id)}
                    variant="ghost"
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Choisis une réponse rapide ou écris une note libre. Elle restera disponible après refresh."
            icon={
              <BookOpen aria-hidden="true" className="size-6 text-violet-500" />
            }
            title="Aucune entrée pour le moment"
          />
        )}
      </div>

      {presets.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={handleEmptyEntry} variant="secondary">
              Noter rien pour le moment
            </Button>
          }
          className="mt-4"
          description="Termine l'onboarding ou ajoute des presets plus tard depuis les réglages."
          title="Aucun choix rapide disponible"
        />
      ) : null}
    </section>
  );
}
