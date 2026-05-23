import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/layout/PageHeader";
import { StatusToastBanner, useStatusToast } from "../../components/ui";
import { ConfirmResetModal } from "./ConfirmResetModal";
import { LocalDataSection } from "./LocalDataSection";
import { PresetsSection } from "./PresetsSection";
import { RemindersSection } from "./RemindersSection";
import { WeekStartSection } from "./WeekStartSection";
import { resetLocalData } from "./settingsStorage";
import { usePresets } from "./usePresets";
import { useUserSettings } from "./useUserSettings";

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, isLoading: isSettingsLoading } = useUserSettings();
  const { presets, isLoading: isPresetsLoading } = usePresets();
  const { statusToast, isStatusToastVisible, showStatusToast } =
    useStatusToast();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  function handleError(message: string) {
    showStatusToast(message, "error");
  }

  function handleSuccess(message: string) {
    showStatusToast(message, "success");
  }

  async function handleConfirmReset() {
    setIsResetting(true);
    try {
      await resetLocalData();
      setIsResetModalOpen(false);
      showStatusToast("Données locales réinitialisées.", "success");
      navigate("/onboarding", { replace: true });
    } catch (error) {
      handleError(
        error instanceof Error
          ? error.message
          : "Réinitialisation impossible.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <StatusToastBanner
        isVisible={isStatusToastVisible}
        toast={statusToast}
      />

      <PageHeader
        eyebrow="Réglages"
        title="Contrôler ton expérience"
        description="Ajuste tes rappels, ta semaine, tes choix rapides et tes données locales."
      />

      {isSettingsLoading || !settings ? (
        <p className="px-2 text-sm text-slate-500">
          Chargement des réglages…
        </p>
      ) : (
        <>
          <RemindersSection
            onError={handleError}
            onSuccess={handleSuccess}
            reminderTimes={settings.reminderTimes}
          />
          <WeekStartSection
            onError={handleError}
            onSuccess={handleSuccess}
            weekStartsOn={settings.weekStartsOn}
          />
        </>
      )}

      {isPresetsLoading ? (
        <p className="mt-4 px-2 text-sm text-slate-500">
          Chargement des choix rapides…
        </p>
      ) : (
        <PresetsSection
          onError={handleError}
          onSuccess={handleSuccess}
          presets={presets}
        />
      )}

      <LocalDataSection
        onError={handleError}
        onResetRequested={() => setIsResetModalOpen(true)}
        onSuccess={handleSuccess}
      />

      {isResetModalOpen ? (
        <ConfirmResetModal
          isBusy={isResetting}
          onCancel={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
        />
      ) : null}
    </section>
  );
}
