---
**date:** 2026-05-14
**status:** Done
**description:** Le Ticket 06 ajoute la transformation d'une entrée libre en choix rapide réutilisable avec déduplication locale.
**tags:** worklog, ticket-06, entries, presets, today-page, dexie, local-first
---

# Ticket 06 - Transformer une réponse libre en preset

## Contexte

Le Ticket 06 doit permettre à l'utilisateur d'enrichir ses choix rapides depuis une réponse libre saisie sur l'écran Aujourd'hui.

## Réalisation

- Ajout de `createPresetFromCustomEntry` dans `src/features/entries/entryStorage.ts`.
- Ajout d'une normalisation de label pour éviter les doublons simples.
- Création de `LearningPreset` avec `createdFromEntryId`, `usageCount: 0` et `archived: false`.
- Réactivation d'un preset archivé équivalent au lieu de créer un doublon.
- Ajout de l'action `Ajouter aux choix rapides` sur les entrées `custom` dans `TodayPage.tsx`.
- Remplacement de l'action par `Déjà en choix rapide` lorsqu'un preset visible correspond déjà au contenu.
- Conservation de la source `custom` sur l'entrée d'origine ; le lien durable est porté par le preset.

## Choix retenus

La règle durable est documentée dans l'ADR `Transformation des réponses libres en presets réutilisables`.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.
- `curl -I http://localhost:5173/` : OK 200.

## Suites éventuelles

- Le Ticket 10 devra permettre de renommer, archiver et supprimer les presets.
- Les déduplications sémantiques ou paraphrases restent hors scope MVP.

## Documents liés

- `ROADMAP / Tickets MVP`
- ADR `Transformation des réponses libres en presets réutilisables`
- ADR `Création des entrées du jour local-first`
- `TECHNICAL / Modèle de données MVP`