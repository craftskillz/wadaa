---
**date:** 2026-05-26
**status:** Idle
**description:** Point de reprise après interdiction des arbres consécutifs identiques et durcissement des conflits palmier/gros arbres Today.
**tags:** worklog, handoff, progression, today-page, river, sprites, clusters, deterministic-shuffle
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle — `TodayPage.tsx` rend les clusters du fleuve avec alternance gauche/droite, fréquence normale de `redTree`, arbres consécutifs identiques remplacés, conflits palmier/végétation supprimés, gros arbres proches dédupliqués et zones header/cards mesurées dans le DOM. Lint + build OK.

## Tâche courante

Aucune implémentation en cours.

## Dernière action réalisée

Réglage des sprites du fleuve Today (2026-05-26) :

- `RiverAtlasSprites` sélectionne au maximum 6 emplacements par section via `RIVER_ATLAS_PLACEMENT_GROUPS`.
- Les règles de suppression ne peuvent plus faire descendre une section sous 5 emplacements (`RIVER_ATLAS_MIN_PLACEMENTS_PER_SECTION`), afin d'éviter qu'aujourd'hui perde toute végétation quand il y a beaucoup de cards.
- `redTree` n'est plus pondéré : il apparaît une seule fois dans le pool `treeGroup`, comme les autres sprites.
- `replaceConsecutiveDuplicateRiverTrees` remplace un arbre par une autre espèce quand il serait identique à l'arbre précédent, y compris à la jonction avec la section précédente.
- `RIVER_ATLAS_PLACEMENT_GROUPS` suit une alternance gauche/droite fixe pour fluidifier la distribution verticale et réduire les grands trous.
- Une passe `removeCloseSameSideRiverTrees` supprime tout arbre trop proche d'un autre arbre du même côté, et traite aussi les conflits palmier/végétation ou deux gros arbres proches même s'ils ne sont pas strictement du même côté. Les seuils palmier/gros arbres sont durcis à 620 px. Cette règle peut descendre sous 5 clusters si nécessaire pour éviter une pile visuelle.
- Les zones protégées (`data-river-protected-zone`) sont mesurées avec `getBoundingClientRect`, converties dans le référentiel SVG du fleuve, puis les sprites sont poussés hors de ces zones en tenant compte de leur empreinte visuelle complète.
- Les groupes de placement répartissent les sprites sur toute la hauteur du fleuve, avec au plus un emplacement par zone.
- Les motifs de clusters `waterPlant` et `treeGroup` sont conservés (`sideBySide`, `oppositeDiagonal`, `three`, `four`, `five`).
- `TimelinePath` transmet toujours `dateKey` comme seed ; `getRiverAtlasPlacements(seed)` mélange les sprites par affinité pour varier l'ordre entre sections sans instabilité au re-render.
- Les ratios de taille sont portés par `RIVER_ATLAS_SPRITES`, donc un sprite garde son échelle propre après réordonnancement.
- Les nouveaux sprites `palm-tree.png`, `red-tree.png` et `rounder-leaf-tree.png` sont intégrés à l'atlas.
- L'ADR fleuve Today a été mis à jour manuellement car le MCP Living Documentation ne répondait pas.

## Prochaine action recommandée

Continuer avec le **Ticket 15 — Boutons backup / restore dans l'app** quand l'utilisateur le demande.

Avant de coder ce ticket, valider avec l'utilisateur :

1. **Stockage de la clé `BACKUP_KEY` côté frontend** : ajouter un champ `cloudBackupKey?: string` dans `UserSettings`, exposé depuis la page Réglages (section « Sauvegarde cloud »), pour que le frontend l'envoie via le header `x-backup-key`. La clé ne doit pas être exportée dans le JSON de backup.
2. **UX** : « Sauvegarder maintenant » (PUT) + « Restaurer depuis le cloud » (GET puis import local après confirmation) + « Dernière sauvegarde : ... ».
3. **Tests préalables de l'endpoint** : `netlify link` + définir `BACKUP_KEY` + lancer `npm run dev:netlify` et tester un PUT/GET manuel.

## Fichiers ou zones concernés

- `src/features/entries/TodayPage.tsx`
- `src/assets/river-sprites/palm-tree.png`
- `src/assets/river-sprites/red-tree.png`
- `src/assets/river-sprites/rounder-leaf-tree.png`
- `living-documentation/ADRS/2026_05_15_19_01_[ADR]_chemin_today_rendu_comme_fleuve_svg.md`
- `living-documentation/WORKLOG/current-task.md`

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- Vérification navigateur sur `http://localhost:5173/` : la section Today rend 4 clusters/emplacements dans la session de test, avec un seul `redTree` et aucun cluster `palmTree` en conflit.
- ADR fleuve Today mise à jour manuellement.

## Vérifications restantes

- Validation visuelle fine par l'utilisateur sur la densité finale des clusters.
- MCP Living Documentation : relancer le serveur et rafraîchir les métadonnées de l'ADR fleuve Today, car `http://localhost:4321/mcp` ne répondait pas.

## Notes de reprise

- Le rendu DOM contient volontairement plus d'images que le nombre de placements parce que les clusters sont conservés.
- La limite demandée concerne les emplacements/clusters visuels, pas le nombre brut d'éléments `<img>` produits par les motifs de cluster.
- Le mélange est limité par affinité : les plantes d'eau restent dans les placements proches du fleuve et les arbres/buissons restent sur les placements plus éloignés.
