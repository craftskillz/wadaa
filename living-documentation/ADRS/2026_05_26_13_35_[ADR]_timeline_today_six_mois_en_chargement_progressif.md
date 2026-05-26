---
**date:** 2026-05-26
**status:** To be validated
**description:** L'écran Aujourd'hui charge initialement 7 jours puis étend l'historique jusqu'à six mois par paliers au scroll-up, sans requêter toute la période au montage.
**tags:** today-page, timeline, infinite-scroll, six-months, indexeddb, dexie, local-first, scroll-up, useTimelineData, performance
---

# Timeline Today six mois en chargement progressif

## Contexte

L'ADR `Timeline Today multi-jours scroll-up et day-anchored pills` limitait l'écran Aujourd'hui à 7 jours. Cette profondeur est insuffisante pour consulter un historique utile depuis la page principale.

Le besoin produit est de permettre de remonter jusqu'à six mois, sans transformer le chargement initial de Today en requête lourde sur toute la période. La page doit rester ancrée sur Aujourd'hui au premier affichage et garder l'écriture des nouvelles entrées sur le jour réel.

## Décision

### Fenêtre maximale

La profondeur maximale de Today devient six mois calendaires, calculés depuis le jour courant local. Pour le 26 mai 2026, la borne basse est donc le 26 novembre 2025 inclus.

Cette limite est portée par `TIMELINE_MAX_MONTHS_VISIBLE = 6` dans `TodayPage.tsx`. Le nombre de jours exact est calculé à partir de la date locale courante afin de respecter les mois réels plutôt qu'une approximation fixe à 180 jours.

### Chargement progressif

Today charge `INITIAL_TIMELINE_DAYS_VISIBLE = 7` jours au montage. Quand l'utilisateur remonte près du haut du conteneur scrollable (`main`), la page augmente la fenêtre chargée par paliers de `TIMELINE_DAYS_LOAD_STEP = 14` jours, jusqu'à la limite de six mois.

`useTimelineData(daysCount)` reste le point de requête Dexie : il ne reçoit que le nombre de jours actuellement ouverts, calcule `[oldestKey, todayKey]`, requête `db.entries.where("date").between(oldestKey, todayKey, true, true)`, groupe les entrées par jour et charge les presets actifs. Au montage, la requête couvre donc seulement 7 jours, pas les six mois.

### Rendu des jours

La règle de rendu ne change pas : seuls les jours passés contenant au moins une entrée sont rendus, plus Aujourd'hui qui reste toujours présent. Les jours vides chargés dans la fenêtre de données restent absents du DOM.

Quand une tranche plus ancienne ajoute du contenu au-dessus de la position courante, Today conserve la position visuelle en mémorisant `scrollHeight` et `scrollTop`, puis en compensant le delta de hauteur après rendu. Le scroll-up ne doit donc pas déplacer brutalement la section consultée.

### Invariants conservés

- Le premier affichage reste ancré sur Aujourd'hui.
- Le bouton `+` sert uniquement à créer une entrée pour le jour réel.
- Le bouton `Revenir à aujourd'hui` reste affiché quand le jour actif n'est pas Aujourd'hui.
- Les pastilles de jour actif restent calculées depuis les sections réellement rendues.

## Conséquences

### PROS

- L'utilisateur peut consulter un historique significatif depuis Today sans passer par le calendrier.
- Le chargement initial reste léger : 7 jours seulement.
- La profondeur de six mois est explicite et facile à ajuster.
- Le comportement reste local-first et s'appuie sur l'index Dexie `date` déjà existant.

### CONS

- Les jours vides restent invisibles ; si une tranche de 14 jours ne contient aucune entrée, l'utilisateur peut devoir continuer à remonter pour atteindre une entrée plus ancienne.
- Il n'y a toujours pas de virtualisation DOM. C'est acceptable pour six mois avec rendu des seuls jours non vides, mais à reconsidérer si la densité d'entrées devient élevée.
- Le chargement progressif dépend de l'identité du conteneur scrollable `<main>`, comme `useActiveDay`.

## Documents liés

- ADR `Timeline Today multi-jours scroll-up et day-anchored pills` — partiellement remplacée sur la fenêtre temporelle fixe de 7 jours
- ADR `Timeline visuelle Today et navigation drawer`
- ADR `MVP local-first avec IndexedDB comme source principale`
