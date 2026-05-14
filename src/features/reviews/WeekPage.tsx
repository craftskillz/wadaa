import { PageHeader } from "../../components/layout/PageHeader";
import { Card, EmojiBadge, StatusPill } from "../../components/ui";

export function WeekPage() {
  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Revue"
        title="Ta semaine d'apprentissage"
        description="La revue hebdomadaire servira à garder l'essentiel, jeter le bruit et valoriser les apprentissages importants."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card tone="solid">
          <StatusPill tone="blue">À venir</StatusPill>
          <p className="mt-4 text-2xl font-black text-slate-950">0 entrée</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Les apprentissages de la semaine seront listés ici.
          </p>
        </Card>
        <Card tone="solid">
          <EmojiBadge emoji="⭐" />
          <p className="mt-4 text-2xl font-black text-slate-950">Notation</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Les étoiles alimenteront la courbe d'apprentissage.
          </p>
        </Card>
        <Card tone="solid">
          <StatusPill tone="mint">Curation</StatusPill>
          <p className="mt-4 text-2xl font-black text-slate-950">Garder / jeter</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Le bruit sera exclu des insights principaux.
          </p>
        </Card>
      </div>
    </section>
  );
}
