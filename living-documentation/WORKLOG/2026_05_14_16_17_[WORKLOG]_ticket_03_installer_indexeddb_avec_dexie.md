---
**date:** 2026-05-14
**status:** Done
**description:** Suivi opérationnel du Ticket 03 pour installer Dexie, créer le stockage IndexedDB local et exposer export/import JSON complet.
**tags:** worklog, ticket-03, indexeddb, dexie, local-first, export-json, import-json, settings
---

# Ticket 03 - Installer IndexedDB avec Dexie

## Statut

Done

## Objectif

Mettre en place le stockage local MVP sans backend : base Dexie, tables `entries`, `presets`, `weeklyReviews`, `settings`, helpers CRUD, export JSON complet et import JSON complet.

## Réalisé

- Dexie ajouté comme dépendance runtime.
- Types MVP ajoutés dans `src/lib/db/types.ts`.
- Base Dexie `what-did-you-learn-today` créée en version 1 dans `src/lib/db/database.ts`.
- Tables `entries`, `presets`, `weeklyReviews` et `settings` créées.
- Repositories CRUD par table ajoutés dans `src/lib/db/repositories.ts`.
- Export/import JSON complet ajoutés dans `src/lib/db/localData.ts`.
- Validation minimale des snapshots JSON ajoutée dans `src/lib/db/validation.ts`.
- Settings expose un panneau `Données locales` avec compteurs, export JSON et import JSON avec confirmation.

## Scope exclu

- Onboarding complet.
- Saisie réelle d'entrées depuis l'écran Aujourd'hui.
- Backup Cloudflare R2.
- Auth Google.
- Synchronisation multi-device.

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- `curl -I http://localhost:5173/settings` : OK 200.
- `curl -I http://[::1]:5173/settings` : OK 200.
- MCP Living Documentation disponible, documents et métadonnées mis à jour.

## Notes de reprise

Le schéma Dexie n'indexe pas les booléens (`kept`, `discarded`, `archived`) car ce ne sont pas des clés IndexedDB sûres. Les filtres sur ces champs devront être faits côté requête ou via des index dérivés si le besoin devient important.

Le prochain ticket recommandé est le Ticket 04 : onboarding. Il pourra utiliser `settingsRepository` et `importLocalData`/`exportLocalData` via `src/lib/db`.

Le serveur Vite utilisateur tourne sur `http://localhost:5173/`; dans le navigateur Codex, utiliser `http://[::1]:5173/` si nécessaire.