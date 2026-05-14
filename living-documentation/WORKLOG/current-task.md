---
**date:** 2026-05-14
**status:** Idle
**description:** Point de reprise partagé entre assistants IA pour suivre la tâche courante, son statut, les fichiers touchés, les vérifications et la prochaine action.
**tags:** worklog, handoff, progression, reprise, agents-ia, ticket-04, onboarding
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle

## Tâche courante

Aucune tâche d'implémentation n'est en cours.

## Dernière action réalisée

Ticket 04 terminé : onboarding interactif créé, garde de premier lancement ajouté, settings et presets initiaux sauvegardés localement dans Dexie, puis redirection vers Aujourd'hui après finalisation.

## Prochaine action recommandée

Démarrer le Ticket 05 : Écran Aujourd'hui.

Priorité recommandée pour Ticket 05 : charger les presets non archivés depuis IndexedDB, créer les `LearningEntry` du jour depuis un preset, une réponse libre ou `Rien pour le moment`, afficher les entrées du jour et permettre leur suppression.

## Fichiers ou zones concernés

- `src/components/layout/AppShell.tsx`
- `src/features/onboarding/`
- `src/lib/db/`
- `src/lib/ids/`
- `living-documentation/ADRS/2026_05_14_16_44_[ADR]_onboarding_determine_par_settings_local.md`
- `living-documentation/WORKLOG/2026_05_14_16_41_[WORKLOG]_ticket_04_creer_onboarding.md`
- `living-documentation/AI/PROJECT-STACK.md`

## Vérifications récentes

- `npm run lint` : OK.
- `npm run build` : OK.
- `curl -I http://localhost:5173/onboarding` : OK 200.
- `curl -I http://[::1]:5173/onboarding` : OK 200.
- MCP Living Documentation disponible, ADR créé et métadonnées rafraîchies.

## Notes de reprise

Le Ticket 04 reste sans notifications Web Push, sans auth et sans backend. Les reminders sauvegardés sont des préférences passives jusqu'au Ticket Reminders UI.

Le premier lancement est déterminé par l'absence de `UserSettings("local")`. Pour rejouer l'onboarding, prévoir une action explicite de reset ou suppression des données locales.
