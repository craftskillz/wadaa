# Qu'as-tu appris aujourd'hui ?

Application web personnelle de journaling d'apprentissage.

L'objectif est de permettre a l'utilisateur de capturer rapidement ce qu'il apprend au fil de la journee, de curer sa semaine, de garder les apprentissages importants et de visualiser une progression simple.

## Etat du projet

Le projet est au debut du MVP.

Ticket 01 est termine :

- base React + TypeScript + Vite ;
- Tailwind CSS ;
- routes MVP ;
- layout global ;
- navigation mobile-first ;
- placeholders visuels pour les ecrans principaux.

Le coeur metier local-first n'est pas encore implemente : IndexedDB, Dexie, entrees persistantes, presets, revue hebdomadaire et insights arrivent dans les tickets suivants.

## Stack

- Frontend : React, TypeScript, Vite
- Styling : Tailwind CSS
- Routing : React Router
- Icons : Lucide React
- Lint : ESLint
- Package manager : npm

Prevus plus tard dans la roadmap :

- IndexedDB via Dexie ;
- Recharts pour les courbes ;
- Cloudflare Workers + R2 pour backup/restore ;
- Google OAuth ;
- Web Push.

## Demarrage local

Installer les dependances :

```bash
npm install
```

Demarrer le serveur de developpement :

```bash
npm run dev
```

Ouvrir :

```text
http://127.0.0.1:5173/
```

## Commandes utiles

```bash
npm run dev      # serveur Vite local
npm run build    # TypeScript + build Vite
npm run lint     # ESLint
npm run preview  # preview du build
```

## Routes MVP

```text
/            Aujourd'hui
/week        Revue hebdomadaire
/calendar    Calendrier d'apprentissage
/insights    Courbe et stats simples
/settings    Reglages
/onboarding  Premiere experience
```

## Structure principale

```text
src/
  app/                  # App, router, navigation
  components/
    layout/             # AppShell, BottomNav, PageHeader
    ui/                 # composants UI transverses
  features/
    entries/            # Aujourd'hui, calendrier
    presets/            # presets utilisateur, a implementer
    reviews/            # revue hebdomadaire
    insights/           # courbes et stats
    settings/           # reglages
    onboarding/         # premiere experience
  lib/
    db/                 # stockage local, a implementer
    dates/              # helpers dates, a implementer
    ids/                # helpers ids, a implementer
  styles/               # CSS global Tailwind
```

## Documentation vivante

La documentation projet est dans `living-documentation/`.

Points importants :

- `living-documentation/PRODUCT/` : vision produit et parcours MVP ;
- `living-documentation/ROADMAP/` : tickets MVP ;
- `living-documentation/TECHNICAL/` : modele de donnees et options techniques ;
- `living-documentation/ADRS/` : decisions durables ;
- `living-documentation/WORKLOG/current-task.md` : point de reprise entre assistants IA ;
- `living-documentation/AI/PROJECT-STACK.md` : stack et arborescence a jour ;
- `living-documentation/AI/PROJECT-USEFUL-COMMANDS.md` : commandes verifiees.

Avant de reprendre le developpement, lire `AGENTS.md` puis `living-documentation/WORKLOG/current-task.md`.

## Prochaine etape

Ticket 02 : creer le design system minimal.

Priorite :

- formaliser `Card`, `Button`, `Input`, `Textarea`, `EmojiBadge`, `EmptyState` ;
- harmoniser les composants existants ;
- garder une interface mobile-first agreable et testable visuellement.
