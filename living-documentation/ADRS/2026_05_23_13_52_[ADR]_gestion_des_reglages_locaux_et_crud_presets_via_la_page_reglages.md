---
**date:** 2026-05-23
**status:** To be validated
**description:** La page Réglages édite UserSettings('local') (rappels, premier jour de semaine), gère le CRUD presets (renommer/archiver/supprimer) et propose une réinitialisation locale gardée par une modale "taper RESET" qui ramène l'utilisateur à l'onboarding.
**tags:** settings, presets, reset, indexeddb, dexie, onboarding, ux, ticket-12
---

# Gestion des réglages locaux et CRUD presets via la page Réglages

## Contexte

Le Ticket 12 ajoute à la page `/settings` les fonctionnalités attendues du MVP :

- édition des heures de rappel et du premier jour de la semaine déjà initialisés par l'onboarding ;
- réinitialisation complète des données locales ;
- gestion CRUD des presets (renommer, archiver, supprimer).

L'objectif est d'offrir à l'utilisateur un contrôle complet sur ses données local-first sans dupliquer la logique de l'onboarding et sans casser les invariants déjà documentés (`Onboarding determine par settings local`, `Transformation des reponses libres en presets reutilisables`).

## Décision

### Édition de UserSettings('local')

- Les sous-sections `RemindersSection` et `WeekStartSection` mutent directement `UserSettings('local')` via des fonctions ciblées dans `src/features/settings/settingsStorage.ts` (`addReminderTime`, `removeReminderTime`, `updateWeekStartsOn`).
- Aucune nouvelle table ni nouveau champ n'est introduit. L'ordre des `reminderTimes` reste trié ascendant, et `weekStartsOn` reste `'monday' | 'sunday'`.
- Les mutations sont propagées en temps réel via `liveQuery` dans le hook `useUserSettings`. Aucun composant n'accède directement à Dexie en dehors de `settingsStorage.ts`.

### Réinitialisation locale

- L'action est exposée via un bouton « Zone dangereuse » dans `LocalDataSection`, qui ouvre une modale custom `ConfirmResetModal`.
- La modale **exige de taper le mot-clé `RESET`** (insensible à la casse, trim appliqué). Tant que la chaîne ne correspond pas, le bouton « Tout effacer » reste désactivé. Ceci protège contre le clic accidentel sur un terminal mobile.
- À la confirmation, `resetLocalData` exécute une transaction Dexie qui vide les tables `entries`, `presets`, `weeklyReviews`, `settings`. L'absence de `UserSettings('local')` déclenche automatiquement la redirection vers `/onboarding` via `useOnboardingStatus`, ce qui réutilise l'invariant existant et évite tout flag dédié.
- Aucune sauvegarde implicite n'est faite avant la suppression. L'utilisateur est libre d'exporter le JSON avant d'effacer.

### CRUD des presets

- `PresetsSection` liste tous les presets (archivés inclus) triés par label, via `usePresets`.
- **Renommer** : édition inline dans la liste. La fonction `renamePreset` trim et normalise les espaces, vérifie l'unicité via `normalizePresetLabel` (déjà utilisée par `createPresetFromCustomEntry`), et refuse l'opération en cas de conflit avec un autre preset (archivé ou non).
- **Archiver / désarchiver** : `togglePresetArchived` inverse le flag `archived`. Le filtre `!preset.archived` déjà appliqué dans `useTimelineData` retire automatiquement le preset des choix rapides de Today.
- **Supprimer** : `deletePreset` efface définitivement le record. Les `LearningEntry` qui pointaient via `presetId` conservent leur copie du label (`entry.content`) ; aucune cascade n'est appliquée car le `presetId` n'est qu'une référence d'origine, pas une dépendance forte.
- Aucune action n'est exposée sur le preset spécial `EMPTY_PRESET_LABEL` côté Today, mais il reste éditable depuis Réglages comme un preset normal ; l'utilisateur garde la main complète sur sa liste.

### UI

- Toutes les sections vivent sur `/settings` empilées dans `SettingsPage.tsx`, conformément à la décision UX (pas de sous-routes pour le MVP).
- Les retours de chaque action passent par `useStatusToast` (`success` / `error`), pour rester cohérents avec `TodayPage` et `WeekPage`.

## Conséquences

- L'onboarding reste la seule porte d'entrée d'initialisation : tout reset complet réutilise ce flux, ce qui évite la divergence.
- La modale RESET impose une saisie clavier explicite, donc l'action devient inaccessible aux scénarios « tap accidentel » mais reste atteignable au clavier comme au tactile.
- Les presets renommés conservent leur `usageCount` et `createdFromEntryId`, garantissant que les statistiques d'usage et le lien d'origine restent intacts.
- Un preset supprimé laisse derrière lui des entries dont `presetId` pointe vers un record inexistant. C'est intentionnel : `entry.content` reste affichable et les insights continuent de fonctionner.
- Aucun nouveau schéma Dexie n'est créé ; la migration `version(1)` reste suffisante.

## Documents liés

- ADR `Onboarding determine par settings local`
- ADR `Transformation des reponses libres en presets reutilisables`
- ADR `Schema dexie v1 et snapshot json local`
- WORKLOG `Ticket 12 — Réglages`
