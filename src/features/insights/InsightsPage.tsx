import { ChartNoAxesColumnIncreasing } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";

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

      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <ChartNoAxesColumnIncreasing
            aria-hidden="true"
            className="size-7 text-emerald-600"
          />
          <p className="font-black text-slate-900">Aperçu des métriques MVP</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric} className="rounded-3xl bg-slate-950/5 p-4">
              <p className="text-sm font-bold text-slate-500">{metric}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">--</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
