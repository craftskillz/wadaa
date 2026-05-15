---
**date:** 2026-05-14
**status:** Idle
**description:** Point de reprise partagé entre assistants IA pour suivre la tâche courante, son statut, les fichiers touchés, les vérifications et la prochaine action.
**tags:** worklog, handoff, progression, reprise, agents-ia, ticket-08, weekly-review, navigation, dexie
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle — Ticket 08 livré + Bonus 1 (polish visuel et comportemental de Today) livré et documenté.

## Tâche courante

Aucune tâche d'implémentation en cours.

## Dernière action réalisée

Bonus 1 — Polish visuel et comportemental de Today (2026-05-15) :

- Heuristique d'object-fit pour les couvertures (cover si ratio 1.2-2.0, contain sinon) + skeleton animé pendant le chargement.
- 7 thèmes pastel pour les jours rendus, composition unifiée (deux blobs radiaux), direction alternée selon parité de l'index, mapping par position rendue (today = thème 0, on remonte le passé) pour rester continu malgré les jours vides.
- Mask vertical (transparent → opaque → transparent) sur le fond de chaque section pour fondre dans la couleur du jour suivant via le fond AppShell.
- Wrapper outer pleine largeur viewport via marges négatives.
- Pastille fixe du jour actif synchronise sa couleur avec le thème du jour.
- Alternance L/R des cards désormais continue d'un jour à l'autre via `dayStartIndices` cumulé.
- Scroll smooth vers la nouvelle entrée après ajout (`scrollIntoView({ block: "nearest", behavior: "smooth" })` sur `[data-entry-id]`), suppression de l'ancien scroll-to-today.
- ADR `Heuristique de rendu des couvertures Today` créé via MCP, métadonnées attachées.
- ADR `Identité visuelle des jours sur Today` créé via MCP, métadonnées attachées.
- WORKLOG `Bonus 1 — Polish visuel et comportemental de Today` créé via MCP.

Amélioration de la page Today suite à demande utilisateur (2026-05-15) — extension de la timeline aux 7 derniers jours :

- Nouveau hook `src/features/entries/useTimelineData.ts` (remplace `useTodayData`) : `liveQuery` Dexie sur `between(oldestKey, todayKey)`, regroupement par jour, jours vides toujours présents.
- Nouveau hook `src/features/entries/useActiveDay.ts` : détecte la section de jour la plus haute encore au-dessus de l'offset `ACTIVE_DAY_OFFSET_PX = 120` via scroll listener throttlé `requestAnimationFrame`.
- Helpers `src/lib/dates/today.ts` : `getLastDaysKeys(daysCount)` et `formatDayLabel(dateKey, todayKey)` (Aujourd'hui / Hier / date complète).
- `TodayPage.tsx` réécrit : sections par jour (oldest → today, du haut vers le bas), `TimelinePath` rendu par section, `EntryArticle` extrait pour la card, `DaySection` extrait pour la section. `useLayoutEffect` scroll vers la section Aujourd'hui au chargement. Pastilles haut affichent le jour actif avec compteur ; bouton « Revenir à aujourd'hui » quand activeDay ≠ todayKey. Popup composer renommé « Nouvelle idée pour aujourd'hui ».
- ADR `Timeline Today multi-jours scroll-up et day-anchored pills` créé via MCP, 4 fichiers source attachés.
- Ancien `useTodayData.ts` supprimé.
- `PROJECT-STACK.md` mis à jour (vue concept Timeline + convention).

Ajustement Ticket 08 suite retour utilisateur (2026-05-15) :

- À la validation comme à la mise à jour de la revue, les entrées jetées sont maintenant **supprimées définitivement** de la base (`bulkDelete` dans la même transaction Dexie). Elles ne réapparaissent plus dans la timeline Today, dans la revue ni dans les insights.
- Le toast de confirmation a été remplacé par un toast fixe coloré (vert succès, rouge erreur) en haut du viewport, avec icône `CheckCircle2` ou `AlertCircle`, message explicite avec compteurs (« Revue validée : 3 gardés, 2 jetés et supprimés. ») et durée d'affichage 2,8 s avec fondu.
- ADR `Revue hebdomadaire et invariants kept discarded rating` mis à jour : suppression hard documentée, `LearningEntry.discarded` ne porte plus jamais `true` en base, `WeeklyReview.discardedEntryIds` devient un marqueur historique.
- `PROJECT-STACK.md` ajusté en conséquence.

Avant cet ajustement, Ticket 08 (Revue hebdomadaire) livré :

- Helpers de date `src/lib/dates/week.ts` (`getCurrentWeekRange`, `shiftWeekRange`, `formatWeekRangeLabel`, etc.) ; export depuis `src/lib/dates/index.ts`.
- Module `src/features/reviews/reviewStorage.ts` : transaction atomique qui écrit `kept`/`discarded`/`rating` sur chaque entrée plus upsert d'une `WeeklyReview` indexée par `id = weeklyReview_<weekStart>`.
- Hooks `useWeekReviewData(range)` et `useWeekStartSetting()` dans `src/features/reviews/useWeekReviewData.ts`.
- Remplacement complet de `src/features/reviews/WeekPage.tsx` : navigation libre semaine à semaine, cards des entrées avec note 5 étoiles et boutons Garder/Jeter, validation atomique avec bouton désactivé tant qu'une entrée reste « à décider ».
- ADR `Revue hebdomadaire et invariants kept discarded rating` créé via MCP, 4 fichiers source attachés (accuracy = 1).
- WORKLOG dédié `2026_05_14_22_40_[WORKLOG]_ticket_08_revue_hebdomadaire.md` créé.
- ROADMAP : décalage de numérotation Ticket 08/09 résolu (corps détaillé aligné sur l'ordre recommandé) ; case du Ticket 08 cochée.
- `PROJECT-STACK.md` : section WeeklyReview mise à jour.

## Prochaine action recommandée

Démarrer le **Ticket 09 — Correctifs divers** (édition d'image dans une card via petit pinceau dans le coin), tel qu'inscrit dans la roadmap mise à jour.

Vérifications navigateur recommandées avant : valider visuellement le bonus Today (couleurs, fondus, alternance, scroll) et le Ticket 08 (revue hebdomadaire avec navigation entre semaines, suppression effective des jetés).

## Fichiers ou zones concernés

- `src/features/reviews/WeekPage.tsx` (réécrit)
- `src/features/reviews/reviewStorage.ts` (nouveau)
- `src/features/reviews/useWeekReviewData.ts` (nouveau)
- `src/lib/dates/week.ts` (nouveau)
- `src/lib/dates/index.ts`
- `living-documentation/ADRS/2026_05_14_22_40_[ADR]_revue_hebdomadaire_et_invariants_kept_discarded_rating.md`
- `living-documentation/WORKLOG/2026_05_14_22_40_[WORKLOG]_ticket_08_revue_hebdomadaire.md`
- `living-documentation/ROADMAP/2026_05_14_09_48_[ROADMAP]_tickets_mvp.md`
- `living-documentation/AI/PROJECT-STACK.md`

## Vérifications récentes

- `npm run lint` : OK.
- `npm run build` : OK.
- MCP Living Documentation disponible ; ADR et WORKLOG créés ; métadonnées ciblées attachées avec accuracy = 1.

## Notes de reprise

- Les insights et la courbe d'apprentissage doivent s'appuyer sur les champs `kept` / `discarded` / `rating` directement sur les entrées, pas sur les listes `selectedEntryIds` / `discardedEntryIds` de la `WeeklyReview` (qui peuvent se désynchroniser si une entrée est ajoutée après validation).
- Les entrées `source === "empty"` doivent rester exclues des stats principales comme elles le sont déjà de la revue.
- Le bouton de validation est désactivé tant qu'une entrée reste « à décider » : c'est volontaire, ne pas l'assouplir sans réflexion produit.
- `weekStartsOn` n'est pas encore exposé dans les réglages utilisateur (Ticket 10 à venir) ; il est lu en lecture seule depuis `UserSettings` créé à l'onboarding.
