---
**date:** 2026-05-14
**status:** Accepted
**description:** Les réponses libres peuvent créer un `LearningPreset` local réutilisable avec déduplication normalisée et réactivation des presets archivés équivalents.
**tags:** adr, presets, entries, custom-entry, deduplication, archived-preset, dexie, local-first, today-page
---

# Transformation des réponses libres en presets réutilisables

## Contexte

Le Ticket 06 enrichit l'écran Aujourd'hui : une idée libre intéressante doit pouvoir devenir un choix rapide réutilisable sans quitter le flux de saisie.

Le modèle `LearningPreset` contient déjà `createdFromEntryId`, ce qui permet de relier un choix rapide à l'entrée libre qui l'a inspiré sans modifier le schéma Dexie.

## Décision

Une entrée `LearningEntry` ne peut devenir un preset que si sa source est `custom`.

La création passe par `createPresetFromCustomEntry` dans `src/features/entries/entryStorage.ts` :

- le label du preset est le contenu trimé de l'entrée ;
- `createdFromEntryId` reçoit l'id de l'entrée d'origine ;
- `usageCount` démarre à `0` ;
- `archived` démarre à `false` ;
- aucun changement de source n'est appliqué à l'entrée d'origine.

Avant création, les doublons simples sont évités par comparaison normalisée : trim, espaces multiples repliés, puis minuscule locale française.

Si un preset actif équivalent existe déjà, aucun nouveau preset n'est créé. Si un preset équivalent est archivé, il est réactivé au lieu d'en créer un second.

L'écran Aujourd'hui affiche l'action `Ajouter aux choix rapides` uniquement sur les entrées `custom`. Quand un preset visible existe déjà pour le même contenu, l'action est remplacée par l'indication `Déjà en choix rapide`.

## Conséquences

### PROS

- L'utilisateur peut enrichir ses choix rapides depuis son langage réel.
- Les doublons évidents n'encombrent pas la liste de presets.
- La réactivation d'un preset archivé garde l'historique et évite de multiplier les objets équivalents.
- Le coeur local-first reste inchangé : pas de backend, pas de migration Dexie.

### CONS

- La déduplication reste simple et ne détecte pas les paraphrases sémantiques.
- Une entrée transformée reste `custom`; le lien durable est porté par `createdFromEntryId` côté preset.
- Les conflits de labels très proches devront être gérés plus tard dans les réglages de presets.

## Documents liés

- ADR `Création des entrées du jour local-first`
- ADR `Schéma Dexie v1 et snapshot JSON local`
- `PRODUCT / Parcours et écrans MVP`
- `TECHNICAL / Modèle de données MVP`
- `WORKLOG / Ticket 06 Transformer une idée libre en preset`
