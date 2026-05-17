---
**date:** 2026-05-16
**status:** To Be Validated
**description:** Ajout d'une action pinceau sur chaque card Today pour remplacer localement la couverture stockée en Blob.
**tags:** worklog, ticket-10, today-page, cover-image, upload, indexeddb, blob, paintbrush
---

# Ticket 10 - Modification manuelle des images de card

## Contexte

Les images récupérées automatiquement pour les cards Today peuvent être absentes, peu représentatives ou incorrectes. Le ticket 10 demande de permettre à l'utilisateur de modifier l'image de n'importe quelle card depuis un petit pinceau dans le coin.

## Réalisation

- Ajout d'un bouton emoji `🖌️` discret, sans cercle autour, sur chaque card Today.
- Ajout d'un input fichier masqué acceptant `image/*`, déclenché par le bouton pinceau.
- Ajout d'un état `coverUpdatingEntryId` pour désactiver uniquement la card en cours de remplacement.
- Ajout de `updateEntryCoverImage(entryId, image)` dans `entryStorage.ts`.
- Export de `prepareCoverImageBlob` depuis `coverImage.ts` afin de réutiliser la même logique de redimensionnement et compression que les couvertures automatiques.
- Le cadre média d'une card est désormais rendu quand `entry.url || entry.coverImage`, ce qui permet aussi d'afficher une image manuelle sur une entrée sans URL.

## Choix retenus

La couverture choisie manuellement remplace directement `entry.coverImage` dans IndexedDB. Elle devient donc prioritaire sur les fallbacks URL/YouTube existants sans introduire de nouveau champ de modèle ni de migration Dexie.

Les images manuelles restent exclues de l'export JSON comme les couvertures automatiques, car elles sont stockées en `Blob` local.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.

## Documents liés

- ADR `Miniatures locales et résolution des couvertures d'entrée` mise à jour.
- ROADMAP `Tickets MVP` : Ticket 10 coché.
