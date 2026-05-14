---
**date:** 2026-05-14
**status:** In progress
**description:** Point de reprise partagé entre assistants IA pour suivre la tâche courante, son statut, les fichiers touchés, les vérifications et la prochaine action.
**tags:** worklog, handoff, progression, reprise, agents-ia, ticket-07, cover-image, microlink, local-first, today-page
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

In progress — amélioration du Ticket 07 : couvertures d'entrée locales.

## Tâche courante

Ajouter aux entrées avec URL une couverture résolue en arrière-plan et stockée localement comme `Blob` dans IndexedDB, pour étendre l'affichage de miniature au-delà des URLs YouTube tout en restant local-first.

Stratégie : YouTube → Microlink (`api.microlink.io`) → favicon DuckDuckGo en fallback. Redimensionnement canvas en JPEG ≤720px qualité 0.8. Téléchargement déclenché depuis `entryStorage.ts` après création, fire-and-forget. Exclusion de `coverImage` à l'export JSON. Pas de migration rétroactive.

## Dernière action réalisée

- Création de `src/features/entries/coverImage.ts` (résolution + redimensionnement + stockage).
- Ajout du champ `coverImage?: Blob` à `LearningEntry` dans `src/lib/db/types.ts`.
- Câblage du déclenchement de fond dans `entryStorage.ts` (`createEntryFromPreset`, `createCustomEntry`, `createEmptyEntry`).
- `TodayPage.tsx` : nouveau composant `EntryCoverImage` avec hook `useEntryCoverImageUrl` qui gère `URL.createObjectURL`/`revokeObjectURL` ; fallback YouTube conservé tant que le blob n'est pas encore stocké.
- Exclusion de `coverImage` à l'export JSON dans `src/lib/db/localData.ts`.
- ADR `Miniatures locales et résolution des couvertures d'entrée` créé.
- `PROJECT-STACK.md` mis à jour (vue d'ensemble, intégrations, concepts, conventions).

## Prochaine action recommandée

1. Lancer `npm run lint` et `npm run build`.
2. Tester manuellement dans le navigateur : ajouter une entrée avec une URL non-YouTube (article, blog) et vérifier que la couverture apparaît après quelques secondes ; couper le réseau pour vérifier le fallback favicon.
3. Attacher les fichiers source au nouvel ADR avec `add_metadata` puis `refresh_metadata`.
4. Ensuite seulement : clarifier la numérotation Ticket 08/09 dans `ROADMAP.md` et démarrer le ticket suivant.

## Fichiers ou zones concernés

- `src/features/entries/coverImage.ts` (nouveau)
- `src/features/entries/entryStorage.ts`
- `src/features/entries/TodayPage.tsx`
- `src/lib/db/types.ts`
- `src/lib/db/localData.ts`
- `living-documentation/ADRS/2026_05_14_22_18_[ADR]_miniatures_locales_et_resolution_des_couvertures_dentree.md`
- `living-documentation/AI/PROJECT-STACK.md`

## Vérifications récentes

- Modifications terminées côté code et documentation.
- `npm run lint` et `npm run build` à exécuter.
- MCP Living Documentation disponible ; ADR créé via `create_document`.

## Notes de reprise

- Ne pas charger la couverture pendant la requête utilisateur : `entryStorage` doit rester `fire-and-forget` pour ne pas allonger la latence de la popup.
- Microlink est un service tiers ; à remplacer par un endpoint Worker propre au Ticket 12. Garder l'URL de l'API dans `coverImage.ts` isolée pour faciliter ce switch.
- `coverImage` est un cache local reconstructible : ne pas le persister dans l'export JSON ni l'attendre dans l'import.
- Les anciennes entrées (avant cette amélioration) ne sont pas rétrocompatibles automatiquement : la card affiche la miniature YouTube si applicable, sinon le placeholder.
