import { ChartNoAxesColumnIncreasing } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui";

const metrics = [
  "Jours actifs",
  "Apprentissages gardés",
  "Score moyen",
  "Meilleure journée",
];

export function InsightsPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Insights"
        title="Ta courbe arrive bientôt"
        description="Les premières statistiques seront calculées localement depuis les apprentissages gardés."
      />

      <Card>
        <div className="mb-6 flex items-center gap-3">
          <ChartNoAxesColumnIncreasing
            aria-hidden="true"
            className="size-7 text-emerald-600"
          />
          <p className="font-black text-slate-900">Aperçu des métriques MVP</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric} tone="muted" className="p-4">
              <p className="text-sm font-bold text-slate-500">{metric}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">--</p>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  );
}
