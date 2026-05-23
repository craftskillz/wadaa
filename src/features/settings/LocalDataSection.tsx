import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Database, Download, RefreshCw, Trash2, Upload } from "lucide-react";

import { Button, Card } from "../../components/ui";
import {
  exportLocalData,
  getLocalDataSummary,
  importLocalData,
  type LocalDataSummary,
} from "../../lib/db";

const JSON_FILE_TYPE = "application/json";
const BACKUP_FILE_PREFIX = "what-did-you-learn-today-backup";

const EMPTY_SUMMARY: LocalDataSummary = {
  entries: 0,
  presets: 0,
  weeklyReviews: 0,
  settings: 0,
};

type LocalDataSectionProps = {
  onError: (message: string) => void;
  onResetRequested: () => void;
  onSuccess: (message: string) => void;
};

export function LocalDataSection({
  onError,
  onResetRequested,
  onSuccess,
}: LocalDataSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState<LocalDataSummary>(EMPTY_SUMMARY);
  const [isBusy, setIsBusy] = useState(false);

  async function refreshSummary() {
    const nextSummary = await getLocalDataSummary();
    setSummary(nextSummary);
  }

  useEffect(() => {
    let isMounted = true;

    void getLocalDataSummary().then((nextSummary) => {
      if (isMounted) {
        setSummary(nextSummary);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const localDataItems = [
    { label: "Entrées", value: summary.entries },
    { label: "Presets", value: summary.presets },
    { label: "Revues", value: summary.weeklyReviews },
    { label: "Réglages", value: summary.settings },
  ];

  async function handleExport() {
    setIsBusy(true);
    try {
      const backup = await exportLocalData();
      const backupText = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupText], { type: JSON_FILE_TYPE });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${BACKUP_FILE_PREFIX}-${backup.exportedAt.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);

      onSuccess("Export JSON local généré.");
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Export JSON impossible.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsBusy(true);
    try {
      const text = await file.text();
      const parsedContent: unknown = JSON.parse(text);
      const shouldRestore = window.confirm(
        "Restaurer ce fichier remplacera les données locales actuelles.",
      );

      if (!shouldRestore) {
        onSuccess("Import annulé.");
        return;
      }

      await importLocalData(parsedContent);
      await refreshSummary();
      onSuccess("Import JSON local restauré.");
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Import JSON impossible.",
      );
    } finally {
      event.target.value = "";
      setIsBusy(false);
    }
  }

  return (
    <Card className="mt-4">
      <div className="mb-4 flex items-center gap-3 px-2 text-slate-700">
        <Database aria-hidden="true" className="size-6 text-violet-600" />
        <span className="font-bold">Données locales</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {localDataItems.map((item) => (
          <div
            className="rounded-2xl border border-slate-200 bg-white/75 p-3"
            key={item.label}
          >
            <p className="text-xs font-bold uppercase text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <input
        accept=".json,application/json"
        className="sr-only"
        onChange={handleImport}
        ref={fileInputRef}
        type="file"
      />

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button
          disabled={isBusy}
          icon={<Download aria-hidden="true" className="size-5" />}
          onClick={handleExport}
        >
          Exporter JSON
        </Button>
        <Button
          disabled={isBusy}
          icon={<Upload aria-hidden="true" className="size-5" />}
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
        >
          Importer JSON
        </Button>
        <Button
          disabled={isBusy}
          icon={<RefreshCw aria-hidden="true" className="size-5" />}
          onClick={refreshSummary}
          variant="ghost"
        >
          Rafraîchir
        </Button>
      </div>

      <div className="mt-4 border-t border-slate-200/80 pt-4">
        <p className="px-2 text-sm font-bold text-slate-700">Zone dangereuse</p>
        <p className="mt-1 px-2 text-xs text-slate-500">
          Efface toutes les entrées, presets, revues et réglages locaux. L'app
          revient à l'onboarding.
        </p>
        <Button
          className="mt-3 w-full bg-rose-600 text-white shadow-rose-500/30 hover:bg-rose-700 sm:w-auto"
          disabled={isBusy}
          icon={<Trash2 aria-hidden="true" className="size-5" />}
          onClick={onResetRequested}
        >
          Réinitialiser les données locales
        </Button>
      </div>
    </Card>
  );
}
