import { Settings } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";

const settingsPreview = [
  "Heures de rappel",
  "Premier jour de la semaine",
  "Export JSON",
  "Import JSON",
  "Gestion des presets",
];

export function SettingsPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Réglages"
        title="Contrôler ton expérience"
        description="Les réglages resteront simples : rappels, semaine, export/import et presets."
      />

      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3 px-2 text-slate-700">
          <Settings aria-hidden="true" className="size-6 text-sky-600" />
          <span className="font-bold">Réglages MVP</span>
        </div>
        <div className="divide-y divide-slate-200/80">
          {settingsPreview.map((item) => (
            <button
              key={item}
              type="button"
              className="flex min-h-14 w-full items-center justify-between px-2 text-left text-base font-bold text-slate-700 transition hover:text-slate-950"
            >
              <span>{item}</span>
              <span aria-hidden="true" className="text-slate-400">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
