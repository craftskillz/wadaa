---
**date:** 2026-05-16
**status:** To Be Validated
**description:** Remplacement du placeholder Insights par des métriques locales et deux courbes SVG 7/30 jours calculées depuis les apprentissages gardés.
**tags:** worklog, ticket-11, insights, learning-curve, svg, dexie, liveQuery, metrics
---

# Ticket 11 - Courbe d'apprentissage Insights

## Contexte

La route `/insights` affichait un placeholder avec quatre métriques vides. Le ticket 11 demande de calculer les statistiques localement, d'afficher une courbe 7 jours et une courbe 30 jours, puis les cards `jours actifs`, `apprentissages gardés`, `score moyen` et `meilleure journée`.

## Réalisation

- Ajout d'un abonnement `liveQuery` Dexie dans `InsightsPage`.
- Filtrage des entrées sur `source !== "empty"`, `kept === true` et `discarded === false`.
- Construction de séries 7 jours et 30 jours via `getLastDaysKeys`.
- Calcul du `dailyScore` comme somme des ratings des entrées gardées.
- Ajout des quatre cards de synthèse.
- Ajout de deux courbes SVG React maison avec surface, ligne, points et labels HTML.
- Ajout d'un empty state quand aucune entrée gardée n'existe.
- Mise à jour de `PROJECT-STACK.md` pour remplacer la cible Recharts par le choix SVG maison réellement implémenté au MVP.

## Choix retenus

Aucune dépendance chart n'a été ajoutée. Recharts n'était pas installé dans `package.json`; le rendu attendu pour le MVP reste simple et tient dans un composant SVG dédié.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.

## Documents liés

- ADR `Courbe Insights locale en SVG sans dépendance chart` créée.
- ROADMAP `Tickets MVP` : Ticket 11 coché.
- `PROJECT-STACK.md` mis à jour.
