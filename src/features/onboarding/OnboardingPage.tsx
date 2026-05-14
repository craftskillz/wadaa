import { ArrowRight, Bell, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "../../components/layout/PageHeader";

const onboardingSteps = [
  "Choisir ses heures de rappel",
  "Choisir quelques catégories initiales",
  "Commencer à capturer ses apprentissages",
];

export function OnboardingPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Première expérience"
        title="Qu'as-tu appris aujourd'hui ?"
        description="Note tes apprentissages au fil de la journée, garde les meilleurs en fin de semaine, et visualise ta progression."
      />

      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3">
          <Bell aria-hidden="true" className="size-6 text-violet-600" />
          <p className="font-black text-slate-900">Configuration rapide</p>
        </div>
        <ol className="space-y-3">
          {onboardingSteps.map((step) => (
            <li
              key={step}
              className="flex items-center gap-3 rounded-3xl bg-slate-950/5 p-4 font-bold text-slate-700"
            >
              <Sparkles aria-hidden="true" className="size-5 text-emerald-600" />
              {step}
            </li>
          ))}
        </ol>
        <Link
          to="/"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-base font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5"
        >
          Commencer
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </section>
  );
}
