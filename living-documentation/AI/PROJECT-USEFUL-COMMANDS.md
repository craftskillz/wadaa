# PROJECT-USEFUL-COMMANDS

Ce fichier décrit les commandes réellement utiles pour travailler sur le projet. Il doit permettre à une IA de choisir la bonne vérification sans deviner.

Il doit rester à jour. Une commande fausse coûte plus cher qu'une commande absente.

## Règle de maintenance

L'IA doit proposer une mise à jour de ce fichier lorsqu'une tâche :

- ajoute, retire ou renomme un script de développement ;
- change le package manager ;
- change la commande de build, test, lint ou formatage ;
- introduit une étape de setup nécessaire ;
- révèle qu'une commande documentée ne marche plus.

Avant d'ajouter une commande, vérifier qu'elle existe réellement dans `package.json`, un Makefile, un script ou la documentation du projet.

## État actuel

Le dépôt ne contient pas encore de code applicatif, de `package.json`, de scripts npm, de Makefile ou de configuration de tests.

Ne pas lancer ni documenter comme disponible une commande applicative avant le Ticket 01.

## Package manager cible

`npm` est le choix par défaut pour initialiser le projet frontend, sauf décision explicite contraire au moment du Ticket 01.

Ce choix devra être confirmé par les fichiers réellement créés : `package.json` et lockfile.

## Commandes actuellement vérifiables

| Commande | Effet | Quand l'utiliser |
|---|---|---|
| `git status --short` | Vérifie l'état Git du dépôt | Avant et après une série de modifications |

## Commandes attendues après Ticket 01

Ces commandes sont des attentes de roadmap, pas des commandes disponibles tant que le frontend n'existe pas.

| Commande cible | Effet attendu | Condition avant documentation définitive |
|---|---|---|
| `npm install` | Installer les dépendances | Vérifier `package.json` et le lockfile |
| `npm run dev` | Démarrer le serveur Vite local | Vérifier le script `dev` |
| `npm run build` | Compiler l'app | Vérifier le script `build` |
| `npm run lint` | Lancer le lint | Vérifier le script `lint` |
| `npm run format` | Formater le code | Vérifier le script `format` si un formateur est ajouté |
| `npm test` ou équivalent | Lancer les tests | Vérifier le runner choisi |

## Développement local

À compléter après création du projet Vite.

L'agent doit noter le port réel du serveur de développement quand il est connu.

## Qualité

À compléter après création du projet frontend.

Règle actuelle : lancer la plus petite vérification utile disponible. Tant qu'aucun script applicatif n'existe, vérifier au minimum l'état Git et la cohérence documentaire via le MCP Living Documentation.

## Setup initial

À compléter après Ticket 01.

Le setup cible probable est :

```bash
npm install
npm run dev
```

Ne pas le présenter comme validé tant que les scripts n'existent pas.

## Commandes dangereuses ou coûteuses

| Commande | Risque | Règle |
|---|---|---|
| Déploiement Cloudflare | Déploiement réel ou modification d'environnement distant | Demander validation explicite avant exécution |
| Réinitialisation de données locales | Perte de données utilisateur | Demander confirmation dans l'UI et dans toute commande ou script associé |
| Suppression de bucket ou objets R2 | Perte de backups | Demander validation explicite avant exécution |

## Notes pour l'IA

- Ne pas inventer de scripts : si une commande manque, le dire et proposer de l'ajouter.
- Après Ticket 01, remplacer les commandes cibles par les scripts réellement présents dans `package.json`.
- Si une commande échoue, reporter la commande exacte, le symptôme et l'hypothèse la plus probable.
- Quand un document technique ou ADR est aligné avec le code, mettre à jour ou rafraîchir ses métadonnées Living Documentation.