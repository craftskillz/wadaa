---
**date:** 2026-05-23
**status:** To Be Validated
**description:** Réalisation du Ticket 13 — calendrier mensuel avec intensité par score, scroll infini vertical et détail de journée via sous-route /calendar/:date.
**tags:** worklog, ticket-13, calendar, calendrier, scroll-infini, indexeddb, dexie, ui
---

# Ticket 13 — Calendrier d'apprentissage

## Contexte

Ticket 13 de la `ROADMAP/Tickets MVP` : visualiser les jours avec apprentissages, indiquer une intensité, et permettre d'ouvrir le détail d'un jour passé. La page `/calendar` existait sous forme de placeholder ; ce ticket la remplace par une expérience fonctionnelle.

## Réalisation

- Nouveau module `src/lib/dates/month.ts` : `MonthKey`, `getCurrentMonthKey`, `shiftMonth`, `getMonthLabel`, `buildMonthGrid` (génère 4 à 6 semaines à 7 cases), `getWeekdayLabels` aligné sur `weekStartsOn`. Tous les helpers réexportés depuis `src/lib/dates/index.ts`.
- Nouveau hook `src/features/entries/useMonthlyEntries.ts` : `liveQuery` sur `db.entries`, filtre `kept && !discarded && source !== "empty"`, retourne un `Map<dateKey, DailySummary>` (`entries`, `totalScore`, `keptCount`). Constante `FALLBACK_RATING = 0` reprise du module Insights pour traiter les entries gardées sans rating.
- Nouveau composant `src/features/entries/MonthGrid.tsx` : header (mois capitalisé), labels jours, grille 7 colonnes ; chaque case calcule `level 0..4` selon `totalScore` (seuils `[1, 4, 8, 12]`) et applique la palette violet. Cases sans entrée gardée non cliquables ; cases avec entrée appellent `onSelectDay(dateKey)`. Le jour courant est marqué par un ring `slate-950`.
- Réécriture de `src/features/entries/CalendarPage.tsx` : `useWeekStartSetting` + `useMonthlyEntries`, pile verticale de `MonthGrid` du mois courant vers le passé, `IntersectionObserver` sur un sentinel pour charger `MONTHS_PER_BATCH = 3` mois supplémentaires. `EmptyState` global si aucune entrée gardée.
- Nouvelle page `src/features/entries/DayDetailPage.tsx` : validation regex de `:date`, `liveQuery` des entries du jour, affichage de la note en étoiles, lien externe vers `entry.url` si présent, retour vers `/calendar` via un `<Link>` stylisé. Le hook interne `useDayEntries` retourne un état dérivé pour les dates invalides afin de respecter la règle ESLint `react-hooks/set-state-in-effect`.
- Route `/calendar/:date` ajoutée dans `src/app/router.tsx`.

## Choix retenus

- **Intensité = score (kept only)** : cohérent avec `Courbe Insights locale en SVG sans dependance chart` et avec la sémantique de la `WeeklyReview`. Les entrées non revues n'apparaissent pas — c'est documenté dans l'ADR pour transparence.
- **Scroll infini, mois courant en haut** : pas de bouton de navigation entre mois ; l'historique se découvre en scrollant. Sens inversé par rapport à la Timeline Today, parce que le calendrier est une exploration plutôt qu'une chronologie convergente.
- **Sous-route `/calendar/:date`** : permet le partage d'URL, le bouton retour natif, et garde la page calendrier simple. Plutôt qu'une modale ou un drawer.
- **Pas de virtualisation** : acceptable pour le MVP (3 mois initiaux + +3 par batch). À revoir si l'app capture des années d'historique.
- Voir l'ADR `Calendrier mensuel local kept entries intensite et route detail jour` pour le détail durable.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.
- Validation visuelle restante : à faire par l'utilisateur (préférence rappelée dans `current-task.md`).

## Suites éventuelles

- Pas de migration Dexie.
- Si l'utilisateur trouve frustrant que les entries non revues n'apparaissent pas dans le calendrier, on pourrait offrir une option « afficher aussi les entrées brutes » via Réglages, mais ce serait une nouvelle décision produit.
- Penser à virtualiser quand on dépassera ~24 mois affichés.

## Documents liés

- ROADMAP `Tickets Mvp`
- ADR `Calendrier mensuel local kept entries intensite et route detail jour`
- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ADR `Courbe Insights locale en SVG sans dependance chart`
