---
**date:** 2026-05-14
**status:** Accepted
**description:** L'écran Aujourd'hui crée localement les `LearningEntry` du jour depuis une idée courte, une description obligatoire et une URL facultative, avec affichage live et suppression physique.
**tags:** adr, entries, today-page, learning-entry, presets, dexie, local-first, description, url, deletion
---

# Création des entrées du jour local-first

## Contexte

Le Ticket 05 branche l'écran Aujourd'hui sur IndexedDB. Après l'onboarding, l'utilisateur dispose de presets locaux et doit pouvoir capturer un apprentissage sans backend.

Le modèle `LearningEntry` prévoit les sources `preset`, `custom` et `empty`. Les ajustements de l'écran Today ajoutent une description obligatoire et une URL facultative pour enrichir chaque apprentissage.

## Décision

L'écran Aujourd'hui lit en live depuis Dexie :

- les presets non archivés, hors preset `Je n'ai rien appris pour le moment` ;
- les entrées dont `date` vaut la date locale du jour au format `YYYY-MM-DD`.

La création d'entrée suit ces règles :

- cliquer sur un preset ne crée plus immédiatement l'entrée : le preset préremplit le champ `Idée` ;
- `Ajouter à ma journée` exige un champ `Idée` non vide et une `Description` non vide ;
- si l'idée correspond au preset sélectionné, une `LearningEntry` `source: "preset"` est créée avec `presetId` renseigné ;
- sinon une `LearningEntry` `source: "custom"` est créée avec le contenu libre trimé ;
- `description` stocke le détail saisi dans la textarea ;
- `url` stocke un lien facultatif validé côté client quand il est renseigné ;
- l'action `Rien pour le moment` et le preset équivalent ne sont plus exposés dans la popup Today, même si la source `empty` reste supportée pour compatibilité avec les données existantes.

Les nouvelles entrées démarrent avec `kept: false` et `discarded: false`. La curation et le rating restent réservés à la revue hebdomadaire.

Quand une entrée est créée depuis un preset, `usageCount` du preset est incrémenté dans la même transaction Dexie que la création de l'entrée.

La suppression depuis l'écran Aujourd'hui supprime physiquement l'entrée locale. Ce n'est pas une curation : `discarded` reste réservé à la revue hebdomadaire.

## Conséquences

### PROS

- Chaque apprentissage possède un résumé court et un détail relisible.
- L'URL facultative prépare l'enrichissement visuel des cards, par exemple via miniature YouTube.
- Les entrées du jour restent visibles après refresh via IndexedDB.
- `usageCount` prépare le tri des choix rapides sans backend.

### CONS

- La capture est moins instantanée qu'un simple clic preset, car une description est obligatoire.
- Les anciennes entrées sans description restent possibles dans les données locales et doivent être affichées sans casser l'UI.
- La suppression d'une entrée du jour est définitive pour le stockage local courant.
- Les entrées ne sont pas automatiquement gardées : elles devront être qualifiées par la revue hebdomadaire.

## Documents liés

- ADR `Schéma Dexie v1 et snapshot JSON local`
- ADR `Onboarding déterminé par settings local`
- `PRODUCT / Parcours et écrans MVP`
- `TECHNICAL / Modèle de données MVP`
- `WORKLOG / Ticket 05 Écran Aujourd'hui`
