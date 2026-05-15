---
**date:** 2026-05-14
**status:** Idle
**description:** Point de reprise partagé entre assistants IA pour suivre la tâche courante, son statut, les fichiers touchés, les vérifications et la prochaine action.
**tags:** worklog, handoff, progression, reprise, agents-ia, ticket-08, weekly-review, navigation, dexie
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle

## Tâche courante

Aucune tâche d'implémentation en cours.

## Dernière action réalisée

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

Vérifications manuelles navigateur recommandées avant de démarrer le ticket suivant :

1. Aller sur `/week`, naviguer en arrière/avant entre semaines, vérifier que les entrées de chaque semaine sont bien filtrées.
2. Sur une semaine avec entrées : noter, garder/jeter chacune, valider, recharger, rouvrir et vérifier que l'état est conservé.
3. Ajouter une nouvelle entrée sur une semaine déjà validée, retourner à la revue, vérifier qu'elle apparaît « à décider » et bloque la revalidation tant qu'elle n'a pas reçu de décision.
4. Vérifier que les entrées `Pause` (empty) n'apparaissent pas dans la revue.

Puis démarrer le **Ticket 09 — Courbe d'apprentissage** : calculer les métriques locales à partir des entrées `kept` (exclure `discarded` et `à décider`), afficher des courbes 7j / 30j, et les cards `jours actifs` / `apprentissages gardés` / `score moyen` / `meilleure journée`.

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
