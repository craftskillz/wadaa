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

Le projet frontend est initialisé avec npm, Vite, React, TypeScript, Tailwind CSS et ESLint.

Les scripts disponibles sont ceux de `package.json`.

## Package manager

`npm` est le package manager du projet. Le lockfile est `package-lock.json`.

## Installation

| Commande | Quand l'utiliser | Notes |
|---|---|---|
| `npm install` | Après clone ou changement de dépendances | Utiliser npm pour respecter `package-lock.json`. |

## Développement local

| Commande | Effet | Notes |
|---|---|---|
| `npm run dev` | Démarre le serveur Vite local | Port par défaut vérifié : `5173`. URL locale : `http://127.0.0.1:5173/` ou `http://localhost:5173/`. |
| `npm run dev -- --host 127.0.0.1` | Démarre Vite en liant explicitement `127.0.0.1` | Utile pour les vérifications navigateur locales dans Codex. |
| `npm run preview` | Sert le build de production localement | À utiliser après `npm run build` pour vérifier le bundle final. |

## Qualité

| Commande | Effet | Quand la lancer |
|---|---|---|
| `npm run build` | Lance `tsc -b` puis `vite build` | Après changement TypeScript, routing, config Vite, Tailwind ou assets. |
| `npm run lint` | Lance ESLint sur le dépôt | Après changement dans `src/` ou config lint. |
| `git status --short` | Vérifie l'état Git du dépôt | Avant et après une série de modifications. |

## Tests ciblés

Aucun runner de tests automatisés n'est encore installé.

Pour le Ticket 01, les vérifications disponibles sont :

```bash
npm run lint
npm run build
npm run dev -- --host 127.0.0.1
```

La vérification visuelle a été faite dans le navigateur Codex sur desktop et mobile.

## Setup initial

```bash
npm install
npm run dev
```

Puis ouvrir :

```text
http://127.0.0.1:5173/
```

## Commandes dangereuses ou coûteuses

| Commande | Risque | Règle |
|---|---|---|
| Déploiement Cloudflare | Déploiement réel ou modification d'environnement distant | Demander validation explicite avant exécution. |
| Réinitialisation de données locales | Perte de données utilisateur | Demander confirmation dans l'UI et dans toute commande ou script associé. |
| Suppression de bucket ou objets R2 | Perte de backups | Demander validation explicite avant exécution. |

## Notes pour l'IA

- Ne pas inventer de scripts : si une commande manque, le dire et proposer de l'ajouter.
- Lancer `npm run lint` et `npm run build` avant de terminer un changement frontend.
- Après changement visuel significatif, démarrer Vite et vérifier l'interface dans le navigateur.
- Si une commande échoue, reporter la commande exacte, le symptôme et l'hypothèse la plus probable.
- Quand un document technique ou ADR est aligné avec le code, mettre à jour ou rafraîchir ses métadonnées Living Documentation.