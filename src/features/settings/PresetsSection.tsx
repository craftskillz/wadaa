import { type ChangeEvent, type FormEvent, useState } from "react";
import {
  ArchiveRestore,
  ArchiveX,
  Check,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { Button, Card, EmojiBadge, EmptyState, Input } from "../../components/ui";
import type { LearningPreset } from "../../lib/db";
import { classNames } from "../../lib/styles/classNames";
import {
  deletePreset,
  renamePreset,
  togglePresetArchived,
} from "./presetsManagement";

type PresetsSectionProps = {
  presets: LearningPreset[];
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

type EditingState = {
  presetId: string;
  draftLabel: string;
};

export function PresetsSection({
  presets,
  onError,
  onSuccess,
}: PresetsSectionProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [busyPresetId, setBusyPresetId] = useState<string | null>(null);

  function startEditing(preset: LearningPreset) {
    setEditing({ presetId: preset.id, draftLabel: preset.label });
  }

  function cancelEditing() {
    setEditing(null);
  }

  function handleDraftChange(event: ChangeEvent<HTMLInputElement>) {
    setEditing((current) =>
      current ? { ...current, draftLabel: event.target.value } : current,
    );
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) {
      return;
    }

    const targetId = editing.presetId;
    const nextLabel = editing.draftLabel;
    setBusyPresetId(targetId);
    try {
      await renamePreset(targetId, nextLabel);
      setEditing(null);
      onSuccess("Choix rapide renommé.");
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Impossible de renommer ce choix rapide.",
      );
    } finally {
      setBusyPresetId(null);
    }
  }

  async function handleToggleArchive(preset: LearningPreset) {
    setBusyPresetId(preset.id);
    try {
      await togglePresetArchived(preset.id);
      onSuccess(
        preset.archived
          ? "Choix rapide réactivé."
          : "Choix rapide archivé.",
      );
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour ce choix rapide.",
      );
    } finally {
      setBusyPresetId(null);
    }
  }

  async function handleDelete(preset: LearningPreset) {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${preset.label} » ?`,
    );

    if (!confirmed) {
      return;
    }

    setBusyPresetId(preset.id);
    try {
      await deletePreset(preset.id);
      if (editing?.presetId === preset.id) {
        setEditing(null);
      }
      onSuccess("Choix rapide supprimé.");
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer ce choix rapide.",
      );
    } finally {
      setBusyPresetId(null);
    }
  }

  return (
    <Card className="mt-4">
      <div className="mb-4 flex items-center gap-3 px-2 text-slate-700">
        <Sparkles aria-hidden="true" className="size-6 text-amber-500" />
        <span className="font-bold">Choix rapides</span>
      </div>

      {presets.length === 0 ? (
        <EmptyState
          description="Ajoute des choix rapides depuis Aujourd'hui ou crée-les en transformant une idée libre."
          title="Aucun choix rapide pour le moment"
        />
      ) : (
        <ul className="space-y-2">
          {presets.map((preset) => {
            const isEditing = editing?.presetId === preset.id;
            const isBusy = busyPresetId === preset.id;

            return (
              <li
                className={classNames(
                  "rounded-2xl border border-slate-200 bg-white/80 p-3",
                  preset.archived && "opacity-60",
                )}
                key={preset.id}
              >
                <div className="flex items-center gap-3">
                  <EmojiBadge emoji={preset.emoji ?? "✨"} />

                  {isEditing ? (
                    <form
                      className="flex flex-1 items-center gap-2"
                      onSubmit={handleRename}
                    >
                      <div className="flex-1">
                        <Input
                          aria-label="Nouveau nom du choix rapide"
                          autoFocus
                          onChange={handleDraftChange}
                          value={editing.draftLabel}
                        />
                      </div>
                      <Button
                        aria-label="Valider"
                        disabled={isBusy}
                        icon={<Check aria-hidden="true" className="size-4" />}
                        type="submit"
                        variant="primary"
                      >
                        OK
                      </Button>
                      <Button
                        aria-label="Annuler"
                        disabled={isBusy}
                        icon={<X aria-hidden="true" className="size-4" />}
                        onClick={cancelEditing}
                        type="button"
                        variant="ghost"
                      >
                        Annuler
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p
                          className={classNames(
                            "text-sm font-bold text-slate-900",
                            preset.archived && "line-through",
                          )}
                        >
                          {preset.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {preset.archived ? "Archivé" : "Actif"} ·{" "}
                          {preset.usageCount} utilisation
                          {preset.usageCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          aria-label="Renommer"
                          disabled={isBusy}
                          icon={<Pencil aria-hidden="true" className="size-4" />}
                          motion="none"
                          onClick={() => startEditing(preset)}
                          size="md"
                          variant="ghost"
                        />
                        <Button
                          aria-label={
                            preset.archived ? "Réactiver" : "Archiver"
                          }
                          disabled={isBusy}
                          icon={
                            preset.archived ? (
                              <ArchiveRestore
                                aria-hidden="true"
                                className="size-4"
                              />
                            ) : (
                              <ArchiveX
                                aria-hidden="true"
                                className="size-4"
                              />
                            )
                          }
                          motion="none"
                          onClick={() => handleToggleArchive(preset)}
                          size="md"
                          variant="ghost"
                        />
                        <Button
                          aria-label="Supprimer"
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          disabled={isBusy}
                          icon={<Trash2 aria-hidden="true" className="size-4" />}
                          motion="none"
                          onClick={() => handleDelete(preset)}
                          size="md"
                          variant="ghost"
                        />
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
