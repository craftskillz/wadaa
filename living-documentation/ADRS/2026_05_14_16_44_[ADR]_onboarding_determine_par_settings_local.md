---
**date:** 2026-05-14
**status:** Accepted
**description:** Le premier lancement est déterminé par l'absence du `UserSettings` local et l'onboarding crée settings et presets initiaux dans IndexedDB.
**tags:** adr, onboarding, first-launch, user-settings, presets, dexie, local-first, routing
---

# Onboarding déterminé par settings local

## Contexte

Le MVP est local-first et doit rester utilisable sans compte, sans backend et sans synchronisation distante. Le Ticket 04 doit afficher l'onboarding au premier lancement, sauvegarder les réglages localement et rediriger l'utilisateur vers Aujourd'hui.

La couche Dexie v1 créée au Ticket 03 fournit une table `settings` et une table `presets`, mais ne définit pas encore comment l'application sait que l'onboarding est terminé.

## Décision

L'onboarding est considéré terminé lorsque la table `settings` contient l'enregistrement `UserSettings` dont l'id est `local`.

`AppShell` observe cet état local :

- si `UserSettings("local")` est absent, les routes applicatives redirigent vers `/onboarding` ;
- si `UserSettings("local")` existe, `/onboarding` redirige vers `/` ;
- la navigation basse est masquée pendant l'onboarding.

La finalisation de l'onboarding écrit dans une transaction Dexie :

- les `UserSettings` locaux, avec les heures de rappel et le premier jour de semaine ;
- les `LearningPreset` initiaux sélectionnés par l'utilisateur.

Aucun backend, aucune auth et aucune notification Web Push ne sont introduits par cette étape.

## Conséquences

### PROS

- Le critère de premier lancement est simple, local et compatible export/import JSON.
- Les tickets suivants peuvent supposer que settings et presets initiaux existent après onboarding.
- La transaction évite un état partiellement initialisé entre settings et presets.
- Le routage reste centralisé dans le shell applicatif.

### CONS

- Réinitialiser l'onboarding revient à supprimer ou importer un état sans `UserSettings("local")`.
- L'utilisateur ne peut pas relancer l'onboarding complet après finalisation sans action de reset dédiée.
- Les reminders créés restent des préférences passives tant que le Ticket Reminders UI n'est pas implémenté.

## Documents liés

- ADR `Schéma Dexie v1 et snapshot JSON local`
- `PRODUCT / Parcours et écrans MVP`
- `ROADMAP / Tickets MVP`
- `WORKLOG / Ticket 04 Créer l'onboarding`