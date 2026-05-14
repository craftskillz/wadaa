# PROJECT-STACK

Ce fichier donne à l'assistant IA une vue rapide et factuelle du projet. Il doit rester court, concret et maintenu en continu.

Il ne remplace pas les ADR : il sert à savoir rapidement où regarder, quelles technologies sont en jeu et quels concepts structurent le code. Pour le pourquoi détaillé d'une décision, lire les ADR pertinents.

## Règle de maintenance

L'IA doit proposer une mise à jour de ce fichier lorsqu'une tâche :

- introduit, retire ou remplace une technologie importante ;
- modifie une convention structurante ;
- ajoute ou déplace une zone source importante ;
- change un concept métier ou technique central ;
- rend une information ci-dessous fausse ou incomplète.

Ne pas documenter ici les détails volatils, les TODO temporaires ou les informations qui appartiennent clairement à un ADR.

## Vue d'ensemble

`Qu'as-tu appris aujourd'hui ?` est une application web personnelle de journaling d'apprentissage.

Le produit permet maintenant d'initialiser l'expérience localement via onboarding, puis de capturer les apprentissages du jour depuis l'écran Aujourd'hui. Les entrées sont persistées dans IndexedDB et les réponses libres peuvent devenir des choix rapides réutilisables.

Le projet contient une base frontend MVP, un design system minimal, une couche de stockage local-first IndexedDB via Dexie, un onboarding local qui initialise settings + presets, un écran Aujourd'hui qui crée les `LearningEntry` du jour et la transformation des réponses `custom` en `LearningPreset`. La revue, les insights et le calendrier restent à implémenter.

## Stack cible MVP

- **Langage principal** : TypeScript
- **Runtime** : navigateur, Node.js pour les commandes de développement
- **Framework frontend** : React
- **Framework backend / serveur** : Cloudflare Workers pour backup/restore après le coeur local-first
- **Base de données / stockage** : IndexedDB via Dexie dans le navigateur ; Cloudflare R2 pour snapshot JSON de backup plus tard
- **API externes / intégrations** : Google OAuth plus tard pour isoler les backups ; Web Push plus tard pour les notifications
- **Authentification / autorisation** : aucune obligatoire au coeur MVP ; Google OAuth prévu post-coeur local-first
- **Styles / design system** : Tailwind CSS ; composants maison inspirés shadcn/ui
- **Charts** : Recharts
- **Build / bundler** : Vite
- **Package manager** : npm
- **Tests** : non installé pour l'instant
- **Lint / formatage** : ESLint installé ; pas de formateur dédié installé
- **Déploiement / hébergement** : Cloudflare Pages ou Workers avec assets statiques

## Stack réellement installée

Versions installées après le Ticket 06 :

- **React** : `react` 19.2.6, `react-dom` 19.2.6
- **Routing** : `react-router-dom` 7.15.0
- **Build** : `vite` 8.0.13, `@vitejs/plugin-react` 6.0.1
- **TypeScript** : 6.0.3
- **Styles** : `tailwindcss` 4.3.0, `@tailwindcss/vite` 4.3.0
- **Icons** : `lucide-react` 1.16.0
- **Stockage local** : `dexie` pour IndexedDB
- **Lint** : `eslint` 10.3.0, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

Dépendances non encore installées mais prévues par la roadmap :

- Recharts pour les courbes ;
- outils Cloudflare / Workers ;
- auth Google ;
- Web Push.

## Arborescence source utile actuelle

```text
README.md                         <- presentation humaine du projet et demarrage local
AGENTS.md                         <- point d'entrée Codex et agents compatibles
CLAUDE.md                         <- point d'entrée Claude
package.json                      <- scripts npm et dépendances frontend
package-lock.json                 <- lockfile npm
index.html                        <- entrée HTML Vite
vite.config.ts                    <- configuration Vite + React + Tailwind
eslint.config.js                  <- configuration ESLint flat config
tsconfig*.json                    <- configuration TypeScript
src/app/                          <- App, router et navigation
src/components/layout/            <- AppShell, BottomNav, PageHeader
src/components/ui/                <- design system minimal : Button, Card, Input, Textarea, EmojiBadge, EmptyState, StatusPill
src/features/entries/             <- écran Aujourd'hui, création/suppression d'entrées, custom vers preset, calendrier
src/features/reviews/             <- revue hebdomadaire
src/features/insights/            <- courbes et stats
src/features/settings/            <- réglages et vérification export/import local
src/features/onboarding/          <- onboarding, options initiales, sauvegarde settings + presets
src/lib/db/                       <- Dexie, types, repositories CRUD, export/import JSON local
src/lib/dates/                    <- helpers de date locale pour les entrées du jour
src/lib/ids/                      <- génération d'identifiants applicatifs
src/lib/styles/                   <- helpers de classes CSS
src/styles/                       <- CSS global Tailwind
memory/MEMORY.md                  <- index de mémoire projet
living-documentation/AI/          <- instructions IA, stack, commandes et règles
living-documentation/ADRS/        <- décisions durables
living-documentation/PRODUCT/     <- vision produit et parcours MVP
living-documentation/TECHNICAL/   <- modèle de données et options techniques
living-documentation/ROADMAP/     <- backlog MVP ordonné
living-documentation/WORKLOG/     <- suivi de progression entre agents
```

## Arborescence applicative cible

La structure cible du Ticket 01 existe :

```text
src/
  app/
    App.tsx
    router.tsx
    navigation.ts
  components/
    ui/
    layout/
  features/
    entries/
    presets/
    reviews/
    insights/
    settings/
    onboarding/
  lib/
    db/
    dates/
    ids/
    styles/
  styles/
```

Les dossiers `presets` et `lib/dates` restent à enrichir pour les tickets suivants.

## Concepts centraux

- **Local-first** : IndexedDB est la source principale de vérité pendant le MVP. Voir l'ADR `MVP local-first avec IndexedDB comme source principale`.
- **Onboarding** : le premier lancement est déterminé par l'absence de `UserSettings("local")`; l'onboarding crée settings et presets initiaux. Voir l'ADR `Onboarding déterminé par settings local`.
- **LearningEntry** : réponse utilisateur pour un jour donné, issue d'un preset, d'un texte libre ou de `Rien pour le moment`. Voir l'ADR `Création des entrées du jour local-first`.
- **LearningPreset** : choix rapide réutilisable, y compris depuis une réponse libre transformée en preset. Voir l'ADR `Transformation des réponses libres en presets réutilisables`.
- **WeeklyReview** : moment de curation hebdomadaire où l'utilisateur garde, jette et note ses apprentissages.
- **Export/import local** : `src/lib/db/localData.ts` exporte et restaure un snapshot JSON complet avec validation minimale.
- **Insights** : courbes et métriques locales calculées depuis les entrées gardées.
- **Design system minimal** : composants UI maison Tailwind dans `src/components/ui/`, partagés par les pages pour garder une identité cohérente.
- **Backup R2** : snapshot JSON manuel prévu après le coeur local-first, sans logique métier dans le Worker.
- **Recherche sémantique** : option post-MVP explicitement exclue du MVP. Voir l'ADR `Reporter embeddings et LLM après validation produit`.

## Conventions structurantes

- **Incrémentalité** : chaque ticket doit livrer quelque chose de testable visuellement.
- **Simplicité serveur** : ne pas introduire de backend métier tant que le coeur local-first suffit.
- **UX mobile-first** : les écrans doivent être rapides, tactiles et agréables à ouvrir plusieurs fois par jour.
- **Données locales** : les modèles doivent rester compatibles avec export/import JSON complet.
- **Dexie** : ne pas indexer les booléens dans le schéma IndexedDB ; filtrer ces champs côté requête si nécessaire.
- **Onboarding** : ne pas considérer l'utilisateur initialisé sans `UserSettings("local")` ; garder la finalisation settings + presets transactionnelle.
- **Entrées du jour** : créer les entrées via `src/features/entries/entryStorage.ts`; garder `kept` et `discarded` à `false` jusqu'à la revue hebdomadaire.
- **Custom vers preset** : transformer une entrée libre via `createPresetFromCustomEntry`; éviter les doublons par `normalizePresetLabel` et réactiver un preset archivé équivalent plutôt que créer un doublon.
- **Routing** : les routes MVP sont centralisées dans `src/app/router.tsx` et la navigation principale dans `src/app/navigation.ts`.
- **Layout** : `AppShell` porte le fond, la zone scrollable et la navigation basse ; les pages ne doivent pas recréer le shell.
- **UI partagée** : privilégier les composants de `src/components/ui/` avant d'ajouter des classes Tailwind longues directement dans une page.
- **Documentation** : mettre à jour les documents Living Documentation et les ADR lorsque le code rend une décision durable fausse, incomplète ou obsolète.
- **Magic numbers** : nommer les valeurs numériques porteuses de sens dans le code applicatif, conformément à `AI/rules/no-magic-numbers.md`.
