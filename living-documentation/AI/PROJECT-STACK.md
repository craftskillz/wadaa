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

Le produit doit permettre à l'utilisateur de capturer très rapidement ses apprentissages du jour, de curer sa semaine, de garder ou jeter les entrées, de noter les apprentissages importants, puis de visualiser une courbe simple.

Le projet est en phase de cadrage initial. Le dépôt contient actuellement la documentation Living Documentation et les fichiers d'instructions IA. Le code applicatif doit être créé à partir du Ticket 01.

## Stack cible MVP

Cette stack est une cible validée par ADR, mais elle n'est pas encore installée tant que le Ticket 01 n'a pas été réalisé.

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
- **Package manager** : à confirmer lors du Ticket 01, `npm` par défaut sauf décision contraire
- **Tests** : à définir lors du Ticket 01
- **Lint / formatage** : à définir lors du Ticket 01
- **Déploiement / hébergement** : Cloudflare Pages ou Workers avec assets statiques

## Stack réellement installée

Aucune stack applicative n'est encore installée dans le dépôt.

Ne pas supposer l'existence de `package.json`, `src/`, scripts npm, tests ou configuration Tailwind avant le Ticket 01.

## Arborescence source utile actuelle

```text
AGENTS.md                         <- point d'entrée Codex et agents compatibles
CLAUDE.md                         <- point d'entrée Claude
memory/MEMORY.md                  <- index de mémoire projet
living-documentation/AI/          <- instructions IA, stack, commandes et règles
living-documentation/ADRS/        <- décisions durables
living-documentation/PRODUCT/     <- vision produit et parcours MVP
living-documentation/TECHNICAL/   <- modèle de données et options techniques
living-documentation/ROADMAP/     <- backlog MVP ordonné
```

## Arborescence applicative cible

À créer pendant le Ticket 01 :

```text
src/
  app/
    App.tsx
    router.tsx
  components/
    ui/
    layout/
  features/
    entries/
    presets/
    reviews/
    insights/
    settings/
  lib/
    db/
    dates/
    ids/
  styles/
```

## Concepts centraux

- **Local-first** : IndexedDB est la source principale de vérité pendant le MVP. Voir l'ADR `MVP local-first avec IndexedDB comme source principale`.
- **LearningEntry** : réponse utilisateur pour un jour donné, issue d'un preset, d'un texte libre ou de `Rien pour le moment`. Voir `TECHNICAL / Modèle de données MVP`.
- **LearningPreset** : choix rapide réutilisable, y compris depuis une réponse libre transformée en preset.
- **WeeklyReview** : moment de curation hebdomadaire où l'utilisateur garde, jette et note ses apprentissages.
- **Insights** : courbes et métriques locales calculées depuis les entrées gardées.
- **Backup R2** : snapshot JSON manuel prévu après le coeur local-first, sans logique métier dans le Worker.
- **Recherche sémantique** : option post-MVP explicitement exclue du MVP. Voir l'ADR `Reporter embeddings et LLM après validation produit`.

## Conventions structurantes

- **Incrémentalité** : chaque ticket doit livrer quelque chose de testable visuellement.
- **Simplicité serveur** : ne pas introduire de backend métier tant que le coeur local-first suffit.
- **UX mobile-first** : les écrans doivent être rapides, tactiles et agréables à ouvrir plusieurs fois par jour.
- **Données locales** : les modèles doivent rester compatibles avec export/import JSON complet.
- **Documentation** : mettre à jour les documents Living Documentation et les ADR lorsque le code rend une décision durable fausse, incomplète ou obsolète.
- **Magic numbers** : nommer les valeurs numériques porteuses de sens dans le code applicatif, conformément à `AI/rules/no-magic-numbers.md`.