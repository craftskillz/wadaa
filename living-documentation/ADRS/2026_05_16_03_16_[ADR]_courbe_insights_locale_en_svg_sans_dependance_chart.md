---
**date:** 2026-05-16
**status:** To be validated
**description:** La page Insights calcule les métriques locales depuis les entrées gardées et rend les courbes 7/30 jours en SVG React maison sans dépendance chart externe.
**tags:** adr, insights, learning-curve, svg-chart, local-first, dexie, liveQuery, kept, rating, dailyScore
---

# Courbe Insights locale en SVG sans dépendance chart

## Contexte

Le Ticket 11 demande de remplacer le placeholder Insights par une courbe d'apprentissage lisible sur 7 jours et 30 jours, ainsi que quatre cards : `jours actifs`, `apprentissages gardés`, `score moyen`, `meilleure journée`.

Les documents produit définissent le score quotidien MVP comme :

```ts
dailyScore = sum(rating of kept entries)
```

Les entrées jetées ne doivent pas compter. Depuis l'ADR `Revue hebdomadaire et invariants kept discarded rating`, les entrées jetées sont supprimées définitivement par la revue hebdomadaire ; le filtre `!entry.discarded` reste néanmoins présent côté Insights pour garder une défense locale si des données importées anciennes contiennent encore ce champ.

`PROJECT-STACK.md` mentionnait Recharts comme cible, mais la dépendance n'est pas installée dans `package.json`. Ajouter Recharts pour ce besoin aurait modifié le lockfile et introduit une dépendance externe alors que les courbes MVP sont simples.

## Décision

La page `src/features/insights/InsightsPage.tsx` calcule et rend les insights sans nouvelle dépendance.

### Source des données

`InsightsPage` s'abonne à `db.entries.toArray()` via `liveQuery` Dexie. Les entrées retenues sont :

- `entry.source !== "empty"` ;
- `entry.kept === true` ;
- `entry.discarded === false`.

Les données sont triées par date pour stabiliser les calculs.

### Fenêtres temporelles

Deux séries sont construites avec `getLastDaysKeys` :

- `SHORT_WINDOW_DAYS = 7` ;
- `LONG_WINDOW_DAYS = 30`.

Chaque jour produit un `DailyMetric` :

- `keptCount` : nombre d'entrées gardées ce jour-là ;
- `totalScore` : somme des ratings gardés, avec `0` si une entrée gardée n'a pas de rating ;
- `averageRating` : moyenne locale du jour, conservée pour lisibilité future même si la courbe utilise `totalScore`.

### Métriques de synthèse

Les cards utilisent les entrées gardées :

- `jours actifs` : nombre de dates distinctes avec au moins une entrée gardée ;
- `apprentissages gardés` : nombre total d'entrées gardées ;
- `score moyen` : moyenne du score quotidien sur les jours actifs ;
- `meilleure journée` : journée, sur tout l'historique local gardé, ayant le plus haut `totalScore`.

Si aucune entrée gardée n'existe, la page affiche un `EmptyState` au lieu de cards vides.

### Rendu graphique

Les courbes sont rendues par un SVG React maison dans `LearningChart` :

- une ligne de score quotidien (`path`) ;
- une surface légère sous la courbe ;
- des points seulement sur les jours dont le score est supérieur à 0 ;
- des libellés de dates en HTML sous le SVG pour éviter d'étirer du texte SVG avec le responsive.

Le SVG utilise des constantes nommées pour la taille, les paddings et les intervalles de labels afin de respecter la règle `no-magic-numbers`.

## Conséquences

### PROS

- Aucune nouvelle dépendance ni modification du lockfile.
- Les insights restent entièrement local-first et réactifs aux changements Dexie.
- Les entrées jetées ne comptent pas dans les métriques.
- Les deux fenêtres 7 jours et 30 jours sont disponibles dès le MVP.
- Le rendu est suffisamment contrôlé pour rester cohérent avec le design system existant.

### CONS

- Le SVG maison n'offre pas les interactions avancées d'une librairie chart (tooltips, axes riches, responsive charting complet).
- Si les besoins analytiques grandissent, une librairie chart pourra redevenir pertinente.
- Les entrées gardées sans rating comptent dans `apprentissages gardés` mais ajoutent `0` au score ; c'est cohérent avec `dailyScore = sum(rating)`, mais peut produire une courbe plate malgré des apprentissages gardés non notés.

## Documents liés

- PRODUCT `Parcours et écrans MVP` — section Courbe d'apprentissage.
- ADR `Revue hebdomadaire et invariants kept discarded rating`.
- ROADMAP `Tickets MVP` — Ticket 11.
