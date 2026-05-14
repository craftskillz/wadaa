import { Plus } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { StatusPill } from "../../components/ui/StatusPill";

const quickReplies = [
  "Concept technique",
  "Erreur comprise",
  "Outil découvert",
  "Discussion utile",
  "Rien pour le moment",
];

export function TodayPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <StatusPill tone="mint">Progression du jour</StatusPill>
        <StatusPill tone="violet">0 apprentissage</StatusPill>
      </div>

      <PageHeader
        eyebrow="Aujourd'hui"
        title="Qu'as-tu appris aujourd'hui ?"
        description="Capture une idée en quelques secondes. Le tri viendra plus tard, pendant la revue hebdomadaire."
      />

      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700 hover:shadow-md"
            >
              {reply}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Réponse libre
          </span>
          <textarea
            className="min-h-24 w-full resize-none rounded-3xl border border-slate-200 bg-white/90 px-4 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            placeholder="Écris ton apprentissage..."
          />
        </label>

        <div className="mt-4">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-base font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5"
          >
            <Plus aria-hidden="true" className="size-5" />
            Ajouter à ma journée
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-white/50 p-6 text-center text-slate-500">
        Les entrées du jour apparaîtront ici dès que le stockage local sera en
        place.
      </div>
    </section>
  );
}
