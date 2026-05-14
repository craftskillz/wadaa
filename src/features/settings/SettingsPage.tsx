import { Settings } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { Card, Button } from "../../components/ui";

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

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-3 px-2 text-slate-700">
          <Settings aria-hidden="true" className="size-6 text-sky-600" />
          <span className="font-bold">Réglages MVP</span>
        </div>
        <div className="divide-y divide-slate-200/80">
          {settingsPreview.map((item) => (
            <Button
              key={item}
              className="flex min-h-14 w-full justify-between rounded-none px-2 text-left text-base"
              variant="ghost"
            >
              <span>{item}</span>
              <span aria-hidden="true" className="text-slate-400">
                →
              </span>
            </Button>
          ))}
        </div>
      </Card>
    </section>
  );
}
