---
**date:** 2026-05-16
**status:** Idle
**description:** Point de reprise après repositionnement du bouton d'ajout Today en bas à droite et masquage dans le passé.
**tags:** worklog, handoff, progression, ticket-09, today-page, add-button, scroll-anchor
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle — Today se ré-ancre sur Aujourd'hui au chargement, et le bouton `+` n'apparaît que quand Aujourd'hui est le jour actif.

## Tâche courante

Aucune tâche d'implémentation en cours.

## Dernière action réalisée

Polish comportemental Today (2026-05-16) :

- Le scroll initial ne restaure plus un ancien jour actif depuis `localStorage`; il cible toujours la section Aujourd'hui (`todayKey`).
- La persistance `today-page-active-day-v1`, `readStoredActiveDay` et `writeStoredActiveDay` restent retirés pour éviter le retour de cette régression.
- Le bouton flottant `+` est à nouveau conditionné par `isOnToday` : il n'apparaît pas lors de la consultation du passé.
- Le bouton `+` est désormais positionné en bas à droite (`fixed bottom/right`) au-dessus de la navigation basse.
- Les sprites rochers restent supprimés (`rock-plant.png`, `tree-cluster.png`) et non remplacés.
- `npm run lint` : OK.
- `npm run build` : OK.
- ADR `Timeline Today multi-jours scroll-up et day-anchored pills` mise à jour ; métadonnées rafraîchies avec accuracy = 1.

## Prochaine action recommandée

Attendre le retour visuel utilisateur sur la position bas-droite du bouton `+` et son masquage dans le passé. Si le rendu est validé, démarrer le **Ticket 10 — Correctifs divers** : permettre à l'utilisateur de modifier l'image d'une card via un petit pinceau dans le coin.

## Fichiers ou zones concernés

- `src/features/entries/TodayPage.tsx`
- `src/components/layout/AppShell.tsx`
- `src/assets/river-sprites/*.png`
- `collection-objets-elements-vegetaux-theme-nature-plein-air.png` (source utilisateur à la racine, non importé)
- `living-documentation/ADRS/2026_05_15_08_55_[ADR]_timeline_today_multijours_scrollup_et_dayanchored_pills.md`
- `living-documentation/ADRS/2026_05_15_19_01_[ADR]_chemin_today_rendu_comme_fleuve_svg.md`
- `living-documentation/WORKLOG/2026_05_15_19_01_[WORKLOG]_ticket_09_chemin_svg.md`
- `living-documentation/ROADMAP/2026_05_14_09_48_[ROADMAP]_tickets_mvp.md`
- `living-documentation/WORKLOG/current-task.md`
- `living-documentation/.metadata.json`

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- MCP Living Documentation disponible ; ADR timeline mise à jour et métadonnées rafraîchies avec accuracy = 1.

## Vérifications restantes

- Validation visuelle dans le navigateur par l'utilisateur, conformément à sa préférence.

## Notes de reprise

- Le changement reste comportemental/layout : il ne modifie ni Dexie, ni `useTimelineData`, ni la création des entrées.
- Ne pas lancer de navigateur local pour une simple vérification de fonctionnement si l'utilisateur préfère s'en charger ; ne le faire que si une appréciation visuelle de rendu est réellement nécessaire.
