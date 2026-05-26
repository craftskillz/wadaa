---
**date:** 2026-05-23
**status:** To be validated
**description:** La page Mois affiche les apprentissages gardés du mois courant ou sélectionné, triés par note décroissante, avec navigation mensuelle et suppression définitive confirmée.
**tags:** calendar, calendrier, mois, navigation-mensuelle, rating-sort, indexeddb, dexie, kept-entries, hard-delete, confirmation-modal, cover-image
---

# Page Mois : liste mensuelle des apprentissages gardés

## Contexte

Le Ticket 13 avait introduit `/calendar` comme grille mensuelle empilée en scroll infini. Cette grille indiquait les jours actifs et ouvrait un détail de journée via `/calendar/:date`.

Le retour produit est que cette page Mois ne sert pas assez en l'état. L'utilisateur attend une expérience plus proche de la page Semaine : un mois courant, une navigation par mois, et des cartes d'apprentissage directement consultables.

## Décision

### Vue principale = liste mensuelle

`CalendarPage` rend désormais une vue de mois sélectionné, centrée sur les `LearningEntry` gardées qui satisfont `kept === true && discarded === false && source !== "empty"`.

La page affiche :

- le mois courant au chargement ;
- une barre de navigation avec mois précédent / mois suivant ;
- une pastille `Mois en cours` quand le mois affiché est le mois local courant ;
- un bouton `Revenir à ce mois` quand l'utilisateur consulte un mois passé ;
- un résumé du nombre d'apprentissages et du total d'étoiles ;
- une liste de cartes au lieu d'une grille.

Le bouton mois suivant est désactivé sur le mois courant afin de ne pas naviguer vers le futur.

### Tri = nombre d'étoiles décroissant

Les cartes du mois sont triées par note décroissante (`rating`, fallback `0`). En cas d'égalité, les entrées les plus récentes apparaissent en premier via `createdAt` décroissant.

Chaque carte affiche la date du jour, les étoiles, la couverture locale ou fallback, le contenu, la description, le lien éventuel et un bouton `Jeter`.

### Suppression depuis la page Mois

La page Mois ne propose plus de bouton `Garder` : les entrées visibles sont déjà gardées par la revue hebdomadaire.

Elle propose en revanche `Jeter` sur chaque carte. Cette action :

1. ouvre une modale de confirmation destructive ;
2. liste l'entrée avec sa miniature ;
3. annonce explicitement la suppression définitive ;
4. supprime physiquement l'entrée via `db.entries.delete(entry.id)` uniquement après confirmation.

Cette suppression peut laisser une `WeeklyReview.selectedEntryIds` référencer un ID disparu ; c'est cohérent avec l'ADR de revue hebdomadaire, qui demande déjà aux écrans aval de tolérer les IDs orphelins.

### Couvertures et miniatures

`useEntryCoverThumbnail` mutualise la création/révocation d'Object URLs pour les blobs locaux. Le rendu utilise une image locale quand `coverImage` est un `Blob` non vide, un fallback YouTube quand l'URL le permet, puis un placeholder si aucune image exploitable n'existe.

### Données

`useMonthlyEntries` reste la source de données pour la page Mois. Il regroupe les entrées gardées par date et conserve le score quotidien, mais `CalendarPage` aplatit maintenant les jours du mois sélectionné pour construire la liste de cards.

Aucun nouveau modèle Dexie ni champ de schéma n'est introduit.

## Conséquences

- **Utilité immédiate** : l'utilisateur voit directement les apprentissages gardés du mois, sans devoir cliquer sur une case de calendrier.
- **Hiérarchie claire** : les cartes les mieux notées remontent en premier.
- **Cohérence avec Semaine** : la page Mois devient une vue de curation consultable, avec navigation temporelle explicite.
- **Suppression protégée** : jeter depuis le mois reste possible mais passe par une confirmation destructive.
- **Ancienne grille non utilisée** : `MonthGrid` et `/calendar/:date` peuvent rester dans le code pour compatibilité ou suppression ultérieure, mais ils ne sont plus l'expérience principale de `/calendar`.

## Documents liés

- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ADR `Courbe Insights locale en SVG sans dependance chart`
- ADR `Miniatures locales et résolution des couvertures d'entrée`
- ROADMAP `Tickets Mvp`
- WORKLOG `Ticket 13 — Calendrier d'apprentissage`
