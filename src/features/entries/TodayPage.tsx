import { BookOpen, Plus } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { Button, Card, EmptyState, StatusPill, Textarea } from "../../components/ui";

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

      <Card className="p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              variant="pill"
            >
              {reply}
            </Button>
          ))}
        </div>

        <Textarea label="Réponse libre" placeholder="Écris ton apprentissage..." />

        <div className="mt-4">
          <Button
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-base font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5"
            icon={<Plus aria-hidden="true" className="size-5" />}
            size="lg"
          >
            Ajouter à ma journée
          </Button>
        </div>
      </Card>

      <EmptyState
        className="mt-6"
        description="Elles s'afficheront dès que le stockage local sera en place."
        icon={<BookOpen aria-hidden="true" className="size-6 text-violet-500" />}
        title="Aucune entrée pour le moment"
      />
    </section>
  );
}
