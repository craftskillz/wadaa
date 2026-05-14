import { CalendarDays } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";

const previewDays = ["L", "M", "M", "J", "V", "S", "D"];

export function CalendarPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Calendrier"
        title="Tes jours actifs"
        description="Une vue mensuelle simple montrera les jours avec apprentissages et leur intensité."
      />

      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3 text-slate-700">
          <CalendarDays aria-hidden="true" className="size-6 text-violet-600" />
          <span className="font-bold">Aperçu du calendrier</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {previewDays.map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="flex aspect-square items-center justify-center rounded-2xl bg-slate-950/5 text-sm font-black text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
