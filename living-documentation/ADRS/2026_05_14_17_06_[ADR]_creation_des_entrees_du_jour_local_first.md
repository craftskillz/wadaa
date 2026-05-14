---
**date:** 2026-05-14
**status:** Accepted
**description:** L'écran Aujourd'hui crée localement les `LearningEntry` du jour depuis un preset, une réponse libre ou l'action vide, avec affichage live et suppression physique.
**tags:** adr, entries, today-page, learning-entry, presets, dexie, local-first, empty-entry, deletion
---

# Création des entrées du jour local-first

## Contexte

Le Ticket 05 branche l'écran Aujourd'hui sur IndexedDB. Après l'onboarding, l'utilisateur dispose de presets locaux et doit pouvoir capturer rapidement un apprentissage sans backend.

Le modèle `LearningEntry` prévoit trois sources : `preset`, `custom` et `empty`. Il faut définir comment l'écran Aujourd'hui instancie ces sources et comment il affiche les entrées créées.

## Décision

L'écran Aujourd'hui lit en live depuis Dexie :

- les presets non archivés, hors preset `Je n'ai rien appris pour le moment` ;
- les entrées dont `date` vaut la date locale du jour au format `YYYY-MM-DD`.

La création d'entrée suit ces règles :

- clic sur un preset : crée une `LearningEntry` `source: "preset"`, avec `content` égal au label du preset et `presetId` renseigné ;
- réponse libre non vide : crée une `LearningEntry` `source: "custom"`, avec le contenu trimé ;
- action `Rien pour le moment` : crée une `LearningEntry` `source: "empty"`, avec `content: "Rien pour le moment"`.

Les nouvelles entrées démarrent avec `kept: false` et `discarded: false`. La curation et le rating restent réservés à la revue hebdomadaire.

Quand une entrée est créée depuis un preset, `usageCount` du preset est incrémenté dans la même transaction Dexie que la création de l'entrée.

La suppression depuis l'écran Aujourd'hui supprime physiquement l'entrée locale. Ce n'est pas une curation : `discarded` reste réservé à la revue hebdomadaire.

## Conséquences

### PROS

- La saisie du jour est rapide et immédiatement persistée localement.
- Les entrées du jour restent visibles après refresh via IndexedDB.
- La séparation `empty` / `preset` garde une sémantique claire pour les futurs insights.
- `usageCount` prépare le tri des choix rapides sans backend.

### CONS

- La suppression d'une entrée du jour est définitive pour le stockage local courant.
- L'action `Rien pour le moment` est dédiée, donc le preset d'onboarding équivalent est masqué dans les choix rapides.
- Les entrées ne sont pas automatiquement gardées : elles devront être qualifiées par la revue hebdomadaire.

## Documents liés

- ADR `Schéma Dexie v1 et snapshot JSON local`
- ADR `Onboarding déterminé par settings local`
- `PRODUCT / Parcours et écrans MVP`
- `TECHNICAL / Modèle de données MVP`
- `WORKLOG / Ticket 05 Écran Aujourd'hui`