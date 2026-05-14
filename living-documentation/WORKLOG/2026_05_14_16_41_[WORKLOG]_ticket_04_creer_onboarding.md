---
**date:** 2026-05-14
**status:** Done
**description:** Suivi opérationnel du Ticket 04 pour créer l'onboarding, sauvegarder les réglages initiaux et rediriger vers l'écran Aujourd'hui.
**tags:** worklog, ticket-04, onboarding, settings, presets, dexie, first-launch
---

# Ticket 04 - Créer l'onboarding

## Statut

Done

## Objectif

Présenter le concept en moins de 30 secondes, permettre le choix des heures de rappel et de presets initiaux, sauvegarder localement, puis rediriger vers Aujourd'hui.

## Réalisé

- Onboarding interactif créé dans `OnboardingPage`.
- Choix des heures de rappel avec ajout d'une heure personnalisée.
- Choix des presets initiaux.
- Choix du premier jour de semaine.
- Sauvegarde transactionnelle des `UserSettings` et `LearningPreset` initiaux dans IndexedDB.
- Garde de premier lancement dans `AppShell` basé sur `UserSettings("local")`.
- Navigation basse masquée pendant l'onboarding.
- ADR créé : `Onboarding déterminé par settings local`.

## Scope exclu

- Notifications Web Push.
- Reminders actifs côté UI.
- Gestion avancée des presets.
- Authentification.

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- `curl -I http://localhost:5173/onboarding` : OK 200.
- `curl -I http://[::1]:5173/onboarding` : OK 200.
- ADR et métadonnées Living Documentation créés/rafraîchis.

## Notes de reprise

Le prochain ticket recommandé est le Ticket 05 : Écran Aujourd'hui. Il pourra utiliser les presets créés par l'onboarding et commencer à créer des `LearningEntry` persistées localement.

Si l'onboarding doit être rejoué manuellement, il faudra d'abord prévoir une action de reset ou suppression de `UserSettings("local")` depuis Settings.