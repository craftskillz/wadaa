---
**date:** 2026-05-23
**status:** To be validated
**description:** Le calendrier rend des grilles mensuelles empilées en scroll infini, où l'intensité d'un jour reflète la somme des ratings des entrées gardées (kept), et le détail d'une journée s'ouvre via la sous-route /calendar/:date.
**tags:** calendar, calendrier, intensite, scroll-infini, route, indexeddb, dexie, kept-entries, ticket-13, cover-image
---

# Calendrier mensuel local : intensité par score et route détail jour

## Contexte

Le Ticket 13 ajoute la page `/calendar` au MVP. Elle doit montrer rapidement les jours où l'utilisateur a appris quelque chose, permettre de naviguer dans le passé sans contrôle explicite, et ouvrir le détail d'une journée.

Plusieurs décisions structurantes étaient en jeu : quelle métrique afficher (entrées brutes vs entrées gardées), quelle navigation (flèches mois vs scroll infini), et quel mécanisme d'ouverture du détail (popup vs sous-route vs drawer).

## Décision

### Métrique d'intensité = score des entrées gardées

- Chaque case du calendrier est colorisée selon `totalScore = sum(rating)` des `LearningEntry` du jour qui satisfont `kept === true && discarded === false && source !== "empty"`.
- Les entrées non encore curatées par la `WeeklyReview` n'apparaissent pas dans le calendrier — c'est cohérent avec l'ADR `Revue hebdomadaire et invariants kept discarded rating` et avec les Insights (`dailyScore = sum(rating)`).
- Une entrée gardée sans rating compte pour `+0` (constante `FALLBACK_RATING = 0` réutilisée du module Insights via `useMonthlyEntries`). Elle reste visible côté détail du jour mais n'augmente pas l'intensité.
- 5 niveaux d'intensité visuelle (seuils `[1, 4, 8, 12]` pour `level 1..4`) avec la palette violet de l'app. `level 0` = case neutre grise.

### Navigation = scroll infini vertical, mois courant en haut

- `CalendarPage` rend une pile verticale de `MonthGrid`. Le mois courant est en haut ; les mois précédents apparaissent en descendant.
- Un `IntersectionObserver` sur un sentinel placé en bas de la pile ajoute `MONTHS_PER_BATCH = 3` mois supplémentaires dès qu'il devient visible (avec `rootMargin = 400px` pour anticiper le scroll).
- Aucun bouton de navigation entre mois ; le scroll suffit. Le sens « passé en bas » se distingue volontairement de la Timeline Today (« ancien en haut, courant en bas ») parce que le calendrier est une exploration de l'historique, alors que Today est une chronologie qui converge vers le moment présent.
- L'utilisateur ne peut pas naviguer vers le futur — aucun mois après le courant n'est généré.

### Détail d'une journée = sous-route `/calendar/:date`

- Cliquer sur une case avec entrées gardées appelle `navigate('/calendar/' + dateKey)`.
- La route `/calendar/:date` rend `DayDetailPage` qui :
  - valide le format `YYYY-MM-DD` via regex (les URL invalides affichent un EmptyState « Date invalide ») ;
  - `liveQuery` les entries de ce jour, filtre kept/!discarded/!empty ;
  - affiche pour chaque entry : `coverImage` locale si présente, `content`, `description`, lien `url` si présent, et la note en étoiles 1..5 ;
  - réutilise `useEntryCoverThumbnail` pour créer et révoquer proprement l'Object URL du blob, comme la vue semaine ;
  - propose un retour explicite vers `/calendar`.
- Une journée sans entry gardée affiche un EmptyState (cas accessible uniquement si l'utilisateur arrive via URL directe ou si l'entrée a été supprimée entre-temps — `MonthGrid` ne rend les cases comme cliquables qu'avec `keptCount > 0`).
- Choix de la sous-route plutôt qu'une modale : permet de partager une URL, supporte le bouton retour natif du navigateur, et garde la `CalendarPage` simple.

### UX et accessibilité

- Le jour courant est mis en évidence par un ring `slate-950` même quand il n'a pas encore d'entrées gardées.
- Chaque case porte un `aria-label` décrivant le jour, le nombre d'apprentissages et le score, pour les lecteurs d'écran.
- Le composant `MonthGrid` utilise `buildMonthGrid` qui produit 4 à 6 semaines max (les semaines sans aucun jour du mois sont coupées).

### Réutilisation

- `useWeekStartSetting` (déjà défini dans `src/features/reviews/useWeekReviewData.ts`) sert à connaître le premier jour de semaine ; le calendrier respecte donc le choix de l'utilisateur.
- `getWeekdayLabels` utilise `Intl.DateTimeFormat('fr-FR', { weekday: 'short' })` pour générer les labels « LUN MAR MER … » alignés sur le `weekStartsOn`.
- `useEntryCoverThumbnail` mutualise la création/révocation des Object URLs de couverture entre la revue hebdomadaire et le détail calendrier.
- Aucun nouveau modèle Dexie ni champ de schéma n'est introduit.

## Conséquences

- **Cohérence Insights ⇄ Calendrier** : les deux écrans s'appuient sur la même définition du score, ce qui évite des chiffres divergents entre vues.
- **Cohérence Semaine ⇄ Mois** : les cards de détail calendrier affichent les mêmes couvertures locales que les cards de revue hebdomadaire quand `coverImage` est disponible.
- **Visibilité différée** : un utilisateur qui vient juste de saisir des entrées ne les verra pas dans le calendrier tant qu'il n'a pas fait la `WeeklyReview` correspondante. C'est un choix produit assumé : le calendrier est une vue de mémoire à long terme, pas un compteur d'activité brute.
- **Coût mémoire borné mais croissant** : le scroll infini agrandit indéfiniment la liste de `MonthGrid`. Au-delà de plusieurs années, on devrait virtualiser ; ce sera un sujet post-MVP.
- **Sous-route partageable** : `/calendar/:date` peut servir de point d'entrée direct, utile pour de futurs liens depuis un email de rappel ou un widget.

## Documents liés

- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ADR `Courbe Insights locale en SVG sans dependance chart`
- ADR `Miniatures locales et résolution des couvertures d'entrée`
- ROADMAP `Tickets Mvp`
- WORKLOG `Ticket 13 — Calendrier d'apprentissage`
