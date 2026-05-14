---
**date:** 2026-05-14
**status:** Done
**description:** Suivi opérationnel du Ticket 05 pour brancher l'écran Aujourd'hui sur IndexedDB et créer les entrées du jour.
**tags:** worklog, ticket-05, aujourd-hui, entries, presets, dexie, local-first
---

# Ticket 05 - Écran Aujourd'hui

## Statut

Done

## Objectif

Permettre une saisie ultra rapide depuis l'écran Aujourd'hui : presets, réponse libre, option `Rien pour le moment`, affichage des entrées du jour et suppression.

## Réalisé

- Presets non archivés chargés depuis IndexedDB en live.
- Preset d'onboarding `Je n'ai rien appris pour le moment` masqué dans les choix rapides pour éviter le doublon avec l'action dédiée.
- Création d'entrée `preset` depuis un choix rapide.
- Création d'entrée `custom` depuis le champ libre.
- Création d'entrée `empty` via `Rien pour le moment`.
- Incrément du `usageCount` du preset dans la même transaction que la création d'entrée.
- Affichage live des entrées du jour, triées par création récente.
- Suppression physique d'une entrée du jour.
- Helpers de date locale ajoutés pour `YYYY-MM-DD` et affichage d'heure.
- ADR créé : `Création des entrées du jour local-first`.

## Scope exclu

- Transformation custom vers preset, réservée au Ticket 06.
- Revue hebdomadaire et rating.
- Insights.
- Notifications.

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- `curl -I http://localhost:5173/` : OK 200.
- `curl -I http://[::1]:5173/` : OK 200.
- ADR et métadonnées Living Documentation créés/rafraîchis.

## Notes de reprise

Le prochain ticket recommandé est le Ticket 06 : transformer une réponse libre en preset. Les entrées custom existent maintenant et peuvent être utilisées comme source de création de `LearningPreset` avec `createdFromEntryId`.
