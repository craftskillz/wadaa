---
**date:** 2026-05-16
**status:** Idle
**description:** Point de reprise après correction de la régression F5 sur les images de couverture Today.
**tags:** worklog, handoff, progression, ticket-10, cover-image, indexeddb, object-url, today-page
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle — régression corrigée : les images de couverture Today stockées en `Blob` restent affichables après F5.

## Tâche courante

Aucune tâche d'implémentation en cours.

## Dernière action réalisée

Correctif régression couvertures Today (2026-05-16) :

- `EntryCoverImage` ne crée plus d'`objectURL` pendant le rendu React.
- `useEntryCoverImageUrl` crée l'URL locale après montage et la révoque au démontage.
- La valeur `coverImage` relue depuis IndexedDB est validée avec `instanceof Blob` et `size > 0`.
- En cas d'image stockée invalide ou impossible à charger, la card retombe sur le fallback YouTube quand disponible.
- `npm run lint` : OK.
- `npm run build` : OK.

Ticket 11 — Courbe d'apprentissage (2026-05-16) :

- Remplacement du placeholder `/insights` par une page calculée depuis IndexedDB.
- Abonnement `liveQuery` aux entrées gardées (`source !== "empty"`, `kept === true`, `discarded === false`).
- Calcul des séries 7 jours et 30 jours avec `dailyScore = sum(rating of kept entries)`.
- Ajout des cards `jours actifs`, `apprentissages gardés`, `score moyen`, `meilleure journée`.
- Ajout de deux courbes SVG React maison avec surface, ligne, points et labels HTML.
- Ajout d'un empty state quand aucune entrée gardée n'existe.
- ADR `Courbe Insights locale en SVG sans dépendance chart` créée et liée au fichier source.
- Worklog Ticket 11 créé et lié au fichier source.
- `PROJECT-STACK.md` mis à jour : Recharts n'est plus la cible effective du MVP, les courbes Insights sont en SVG React maison.
- ROADMAP `Tickets MVP` : Ticket 11 coché.
- `npm run lint` : OK.
- `npm run build` : OK.

## Prochaine action recommandée

Démarrer le **Ticket 12 — Réglages** : heures de rappel, premier jour de semaine, export/import JSON, réinitialisation locale, gestion des presets.

## Fichiers ou zones concernés

- `src/features/insights/InsightsPage.tsx`
- `src/features/entries/TodayPage.tsx`
- `living-documentation/ADRS/2026_05_16_03_16_[ADR]_courbe_insights_locale_en_svg_sans_dependance_chart.md`
- `living-documentation/WORKLOG/2026_05_16_03_16_[WORKLOG]_ticket_11_courbe_apprentissage_insights.md`
- `living-documentation/AI/PROJECT-STACK.md`
- `living-documentation/ROADMAP/2026_05_14_09_48_[ROADMAP]_tickets_mvp.md`
- `living-documentation/WORKLOG/current-task.md`
- `living-documentation/.metadata.json`

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- MCP Living Documentation disponible ; ADR miniatures, ADR Insights et worklogs liés ont des métadonnées rafraîchies.

## Vérifications restantes

- Validation visuelle par l'utilisateur, conformément à sa préférence.

## Notes de reprise

- Le ticket 11 n'ajoute aucune dépendance chart et ne modifie pas `package.json`.
- Les entrées gardées sans rating comptent dans `apprentissages gardés` mais ajoutent `0` au score, conformément au calcul `dailyScore = sum(rating)`.
- Ne pas lancer de navigateur local pour une simple vérification de fonctionnement si l'utilisateur préfère s'en charger ; ne le faire que si une appréciation visuelle de rendu est réellement nécessaire.
