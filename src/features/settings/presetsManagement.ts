import { presetsRepository } from "../../lib/db";

import { normalizePresetLabel } from "../entries/entryStorage";

export async function renamePreset(
  presetId: string,
  nextLabel: string,
): Promise<void> {
  const trimmedLabel = nextLabel.trim().replace(/\s+/g, " ");

  if (!trimmedLabel) {
    throw new Error("Le nom du choix rapide ne peut pas être vide.");
  }

  const preset = await presetsRepository.getById(presetId);

  if (!preset) {
    throw new Error("Choix rapide introuvable.");
  }

  if (preset.label === trimmedLabel) {
    return;
  }

  const normalizedNext = normalizePresetLabel(trimmedLabel);
  const allPresets = await presetsRepository.getAll();
  const conflict = allPresets.find(
    (candidate) =>
      candidate.id !== presetId &&
      normalizePresetLabel(candidate.label) === normalizedNext,
  );

  if (conflict) {
    throw new Error("Un autre choix rapide porte déjà ce nom.");
  }

  await presetsRepository.put({
    ...preset,
    label: trimmedLabel,
    updatedAt: new Date().toISOString(),
  });
}

export async function togglePresetArchived(presetId: string): Promise<void> {
  const preset = await presetsRepository.getById(presetId);

  if (!preset) {
    throw new Error("Choix rapide introuvable.");
  }

  await presetsRepository.put({
    ...preset,
    archived: !preset.archived,
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePreset(presetId: string): Promise<void> {
  await presetsRepository.delete(presetId);
}
