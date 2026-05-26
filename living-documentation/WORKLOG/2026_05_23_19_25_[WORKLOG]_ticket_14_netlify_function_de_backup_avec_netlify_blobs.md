---
**date:** 2026-05-23
**status:** To Be Validated
**description:** Réalisation du Ticket 14 — endpoint /api/backup servi par une Netlify Function, gardé par un header X-Backup-Key, qui lit/écrit un snapshot JSON dans Netlify Blobs.
**tags:** worklog, ticket-14, netlify, netlify-functions, netlify-blobs, backup, serverless
---

# Ticket 14 — Netlify Function de backup avec Netlify Blobs

## Contexte

Premier ticket hors frontend pur. Suite au pivot documenté dans l'ADR `Backup et fonctions serverless via Netlify Functions et Netlify Blobs`, l'endpoint backup est servi par une Netlify Function plutôt que par un Cloudflare Worker.

## Réalisation

- Installation des dépendances :
  - `@netlify/blobs` 10.7.8 en dependency (runtime du SDK Blobs)
  - `@netlify/functions` 5.2.2 en devDependency (types `Config`, `Context`)
  - `netlify-cli` 26.0.2 en devDependency (`netlify dev` local)
- `netlify.toml` à la racine : `publish = "dist"`, `functions = "netlify/functions"`, redirect `/api/*` → `/.netlify/functions/:splat`, et fallback SPA `/*` → `/index.html` pour que React Router reste maître côté client.
- `netlify/functions/backup.ts` :
  - signature handler v2 (Web `Request`/`Response`) ;
  - exige le header `x-backup-key` qui doit matcher la variable d'environnement `BACKUP_KEY` ; sinon `401`. Si `BACKUP_KEY` n'est pas défini, l'endpoint répond `500` (fail-closed) ;
  - `GET` lit `users/local/backup.json` depuis le store `user-backups` (consistency strong), retourne `200 + JSON` ou `404` ;
  - `PUT` parse le body JSON (`400` si invalide), valide via `parseLocalDataExport` (`400` si schéma KO), écrit dans Blobs (`204` succès, `500` si I/O échoue) ;
  - méthodes autres que `GET`/`PUT` répondent `405` ;
  - `export const config: Config = { path: "/api/backup" }` doublé du redirect netlify.toml pour fiabilité.
- `tsconfig.functions.json` créé et ajouté aux `references` de `tsconfig.json` pour que `tsc -b` type-check les Functions (avec `lib: DOM` pour `Request`/`Response`, `types: node` pour `process.env`). N'inclut que les modules partagés purs (`src/lib/db/validation.ts`, `src/lib/db/types.ts`) pour éviter de tirer le runtime React/Dexie côté Function.
- Script `npm run dev:netlify` ajouté dans `package.json` (lance `netlify dev` qui mux le Vite dev server et les Functions).

## Choix retenus

- **Verrou par header `X-Backup-Key` + env Netlify `BACKUP_KEY`** : choix volontaire pour le mono-user actuel, en remplacement temporaire de Google OAuth (Ticket 16). Une rotation de la clé invalide tout backup ancien — c'est acceptable pour un MVP perso.
- **`userId` fixé à `"local"`** : tant qu'OAuth n'existe pas, un seul utilisateur logique. La clé Blobs reste `users/{userId}/backup.json` pour permettre la transition vers `sub` Google sans changer le schéma de stockage.
- **Consistency strong sur le store Blobs** : un backup vient d'être écrit doit être lisible immédiatement (use case backup/restore). Pas de tolérance à la lecture périmée.
- **Validation partagée avec le frontend** : `parseLocalDataExport` réside déjà dans `src/lib/db/validation.ts` et n'importe que `types.ts` ; le module est donc compilable côté Function sans tirer Dexie. Évite la duplication du validateur.
- **`tsconfig.functions.json` séparé** : isole les types Node + DOM du frontend (`tsconfig.app.json`) et de la config (`tsconfig.node.json`). `tsc -b` valide l'ensemble en une seule commande.
- **Fallback SPA `/*` après `/api/*`** : Netlify évalue les redirects dans l'ordre, donc `/api/*` est intercepté d'abord. Le fallback `/*` garantit que `/calendar/:date`, `/settings`, etc. fonctionnent en deploy.

## Vérifications

- `npm install @netlify/blobs` : OK (47 packages).
- `npm install -D @netlify/functions netlify-cli` : OK (1062 packages, 0 vulnerabilities).
- `npm run lint` : OK.
- `npm run build` : OK (type-check Functions inclus via `tsconfig.functions.json`).
- **Vérification fonctionnelle de l'endpoint** : non effectuée. Reste à faire par l'utilisateur via `netlify dev` (après `netlify link` sur le site cible) ou via un deploy preview. Procédure suggérée :
  1. `netlify link` puis définir `BACKUP_KEY` dans les variables d'env Netlify (UI ou `netlify env:set BACKUP_KEY <random>`).
  2. `npm run dev:netlify`.
  3. `curl -X PUT http://localhost:8888/api/backup -H "x-backup-key: <random>" -H "content-type: application/json" -d "$(cat sample-backup.json)"` doit renvoyer `204`.
  4. `curl http://localhost:8888/api/backup -H "x-backup-key: <random>"` doit renvoyer le JSON envoyé.

## Suites éventuelles

- Le Ticket 15 (boutons backup/restore dans Settings) consommera cet endpoint. Côté frontend, prévoir un mode où `BACKUP_KEY` est stocké localement (`UserSettings.cloudBackupKey?`) pour ne pas le retaper à chaque action. À documenter pendant le Ticket 15.
- Au Ticket 16, le verrou `BACKUP_KEY` peut être supprimé au profit d'un vérificateur de session Google OAuth, et le `userId` placeholder remplacé par `sub`. Aucune migration de schéma Blobs nécessaire — juste un renommage de clé éventuel.
- Le Worker R2 n'a jamais été créé ; rien à migrer côté infra.
- À l'usage, prévoir une rotation manuelle du `BACKUP_KEY` côté Netlify si elle fuit.

## Documents liés

- ROADMAP `Tickets Mvp`
- ADR `Backup et fonctions serverless via Netlify Functions et Netlify Blobs`
- ADR `MVP local-first avec IndexedDB comme source principale`
- ADR `Schema dexie v1 et snapshot json local`
