---
**date:** 2026-05-16
**status:** To Be Validated
**description:** Correction de la régression où les images de couverture Today s'affichaient après ajout puis devenaient cassées après F5.
**tags:** worklog, bugfix, today-page, cover-image, indexeddb, blob, object-url, refresh
---

# Correctif F5 images de couverture Today

## Contexte

Après l'ajout d'une card avec URL, l'image de couverture se chargeait et s'affichait correctement. Après un refresh navigateur (`F5`), la card gardait son bloc image mais affichait un lien cassé.

## Réalisation

- Ajout de `isStoredCoverImageUsable` pour vérifier que `coverImage` relu depuis IndexedDB est bien un `Blob` non vide.
- Modification de `useEntryCoverImageUrl` : l'`objectURL` n'est plus créée pendant le rendu React, mais après montage, puis révoquée au démontage.
- Ajout d'un état d'erreur indexé sur la couverture courante pour éviter de garder une erreur lors d'un changement d'image.
- Ajout d'un fallback : si la couverture stockée échoue au chargement, la card retombe sur la miniature YouTube quand l'URL le permet.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.

## Documents liés

- ADR `Miniatures locales et résolution des couvertures d'entrée` mise à jour.
