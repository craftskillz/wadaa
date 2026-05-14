---
**date:** 2026-05-14
**status:** Draft
**description:** Backlog MVP ordonné pour livrer progressivement l'application Qu'as-tu appris aujourd'hui avec une validation visuelle à chaque ticket.
**tags:** roadmap, tickets, mvp, frontend, indexeddb, onboarding, insights, backup, auth, notifications
---

# Tickets MVP

## Ordre recommandé

1. [x] ~~Ticket 01 - Initialiser le projet frontend~~
2. [x] ~~Ticket 02 - Créer le design system minimal~~
3. [x] ~~Ticket 03 - Installer IndexedDB avec Dexie~~
4. [x] ~~Ticket 04 - Créer l'onboarding~~
5. [x] ~~Ticket 05 - Écran Aujourd'hui~~
6. [x] ~~Ticket 06 - Transformer une idée libre en preset~~
7. [x] ~~Ticket 07 - Améliorations visuelles~~
8. [ ] Ticket 08 - Revue hebdomadaire
9. [ ] Ticket 09 - Courbe d'apprentissage
10. [ ] Ticket 10 - Réglages
11. [ ] Ticket 11 - Calendrier d'apprentissage
12. [ ] Ticket 12 - Worker R2
13. [ ] Ticket 13 - Backup/restore
14. [ ] Ticket 14 - Auth Google
15. [ ] Ticket 15 - Reminders UI
16. [ ] Ticket 16 - Web Push notifications
17. [ ] Ticket 17 - Polish UI moderne

## Ticket 01 - Initialiser le projet frontend

Objectif : créer une base applicative propre, moderne, typée et prête à évoluer.

Tâches :

- créer une app React + TypeScript + Vite ;
- installer Tailwind CSS ;
- créer une structure de dossiers claire ;
- ajouter un système de routes ;
- ajouter un layout global ;
- ajouter une navigation mobile-first.

Structure attendue :

```text
src/
  app/
    App.tsx
    router.tsx
  components/
    ui/
    layout/
  features/
    entries/
    presets/
    reviews/
    insights/
    settings/
  lib/
    db/
    dates/
    ids/
  styles/
```

Critères d'acceptation :

- l'app démarre localement ;
- les routes principales existent ;
- le design de base est propre ;
- le code est typé ;
- aucun backend nécessaire.

## Ticket 02 - Créer le design system minimal

Objectif : créer une base UI jeune, moderne et cohérente.

Tâches :

- créer `AppShell`, `BottomNav`, `PageHeader`, `Card`, `Button`, `Input`, `Textarea`, `EmojiBadge`, `EmptyState` ;
- définir des classes Tailwind réutilisables ;
- ajouter responsive mobile-first ;
- ajouter transitions légères.

Critères d'acceptation :

- l'app a déjà une identité visuelle ;
- les composants sont réutilisables ;
- l'interface est agréable sur mobile ;
- les boutons sont grands et faciles à cliquer.

## Ticket 03 - Installer IndexedDB avec Dexie

Objectif : mettre en place le stockage local.

Tâches :

- installer Dexie ;
- créer la base locale ;
- créer les tables `entries`, `presets`, `weeklyReviews`, `settings` ;
- ajouter les helpers CRUD ;
- ajouter une fonction d'export JSON complet ;
- ajouter une fonction d'import JSON complet.

Critères d'acceptation :

- les données persistent après refresh ;
- on peut exporter tout l'état local ;
- on peut restaurer tout l'état local ;
- aucun appel serveur n'est requis.

## Ticket 04 - Créer l'onboarding

Objectif : présenter le concept en moins de 30 secondes.

Tâches :

- afficher le titre et la proposition de valeur ;
- permettre le choix des heures de rappel ;
- permettre le choix de quelques catégories initiales ;
- sauvegarder les réglages localement ;
- rediriger vers Aujourd'hui.

Critères d'acceptation :

- l'onboarding apparaît au premier lancement ;
- les réglages sont sauvegardés localement ;
- l'utilisateur arrive ensuite sur l'écran Aujourd'hui.

## Ticket 05 - Écran Aujourd'hui

Objectif : permettre une saisie ultra rapide.

Tâches :

- afficher la grande question ;
- afficher les presets sous forme de boutons ou pills ;
- afficher un champ libre ;
- créer une entrée depuis un preset, une idée libre ou `Rien pour le moment` ;
- afficher les entrées du jour ;
- permettre la suppression d'une entrée du jour.

Critères d'acceptation :

- on peut ajouter une entrée en moins de 3 secondes ;
- les entrées du jour s'affichent immédiatement ;
- les données restent après refresh ;
- l'écran est mobile-first.

## Ticket 06 - Transformer une idée libre en preset

Objectif : permettre à l'utilisateur d'enrichir sa propre liste de réponses.

Tâches :

- afficher l'action `Ajouter aux choix rapides` sur une entrée custom ;
- créer un `LearningPreset` ;
- lier éventuellement l'entrée d'origine ;
- rendre le preset disponible sur Aujourd'hui ;
- éviter les doublons simples.

Critères d'acceptation :

- une idée libre peut devenir un preset ;
- le preset apparaît ensuite dans les choix rapides ;
- les doublons simples sont évités.

## Ticket 07 - Améliorations visuelles

Objectif : Apporter des améliorations visuelles à la page Today

Tâches :

- La barre du bas contenant Jour, Semaine, Mois, Stats, Réglages doit etre une sorte de drawer vertical qui apparait (en montant vers le haut) quand on s'approche de lui et qui disparait si on s'en eloigne
  - Il faudrait aussi probablement un petit indicateur visuel indiquant qu'elle existe, ou bien une petite partie supérieure doit etre visible

- le layout de cette page devrait etre different
  - J'imagine une page traversée verticallement par un ligne chronologique de haut en bas (sinusoidale, comme un chemin) et en ajoutant des idées capturées elle alterneraient en sortes de Cards alternativement à droit et à gauche (liée peut être par des pointillés)
  - Il ne faut donc plus que les idées ajoutée apparaissent en dessous mais apparaissent en bas
  - Il faudrait egalement que le scrolling vertical soit un infini scroll qui fait apparaitre les cards en scrollant
  - Quand au panneau d'ajout le l'imagine plutot ouvert en mode popup avec le meme design mais trigger par un bouton (+) fixe, dans la partie haute 1/5 en plein milieu sur la ligne (chemin)

Critères d'acceptation :

- Le "footer" est une sorte de drawer vertical
- Le chemin vertical est une ligne verticale sinusoidale
- On peut ajouter des idées, elles se disposent alternativement à droite et à gauche du chemin
- le scrolling vertical est un infiniScroll

## Ticket 08 - Calendrier d'apprentissage

Objectif : visualiser les jours avec apprentissages.

Tâches :

- créer une vue mensuelle simple ;
- indiquer les jours actifs ;
- afficher une intensité selon le nombre d'entrées ou les étoiles ;
- ouvrir le détail d'une journée passée.

Critères d'acceptation :

- le calendrier montre les jours actifs ;
- on peut consulter une journée passée ;
- le design reste simple et lisible.

## Ticket 09 - Revue hebdomadaire

Objectif : créer le moment fort du produit.

Tâches :

- afficher toutes les entrées de la semaine ;
- permettre une note de 1 à 5 ;
- permettre de garder ou jeter chaque entrée ;
- créer une `WeeklyReview` à la validation ;
- exclure les entrées jetées des insights principaux.

Critères d'acceptation :

- l'utilisateur peut noter chaque entrée ;
- l'utilisateur peut garder ou jeter une entrée ;
- une `WeeklyReview` est créée ;
- les entrées jetées ne sont plus visibles dans les insights principaux.

## Ticket 10 - Courbe d'apprentissage

Objectif : donner un feedback visuel motivant.

Tâches :

- calculer les métriques locales ;
- afficher une courbe sur 7 jours ;
- afficher une courbe sur 30 jours ;
- afficher les cards `jours actifs`, `apprentissages gardés`, `score moyen`, `meilleure journée` ;
- afficher un empty state si aucune donnée.

Critères d'acceptation :

- les stats sont calculées localement ;
- la courbe est lisible ;
- les entrées jetées ne comptent pas ;
- un empty state motivant apparaît sans données.

## Ticket 11 - Réglages

Objectif : permettre à l'utilisateur de contrôler son expérience.

Tâches :

- gérer les heures de rappel ;
- gérer le premier jour de la semaine ;
- ajouter export JSON ;
- ajouter import JSON ;
- ajouter réinitialisation des données locales ;
- gérer les presets : renommer, archiver, supprimer.

Critères d'acceptation :

- les réglages sont sauvegardés localement ;
- l'export JSON fonctionne ;
- l'import JSON restaure l'état ;
- les presets sont modifiables.

## Ticket 12 - Cloudflare Worker pour backup R2

Objectif : ajouter un backup cloud minimal.

API attendue :

```text
GET /api/backup
PUT /api/backup
```

Stockage R2 :

```text
users/{userId}/backup.json
```

Tâches :

- créer un Worker ;
- configurer un binding R2 ;
- implémenter `PUT /api/backup` ;
- implémenter `GET /api/backup` ;
- ajouter validation JSON minimale ;
- ajouter gestion d'erreurs.

Critères d'acceptation :

- l'app peut envoyer un backup complet ;
- l'app peut restaurer depuis R2 ;
- le Worker ne connaît pas la logique métier ;
- R2 ne stocke qu'un snapshot JSON.

## Ticket 13 - Boutons backup / restore dans l'app

Objectif : connecter l'app au backup R2.

Tâches :

- ajouter `Sauvegarder maintenant` dans Settings ;
- ajouter `Restaurer depuis le cloud` dans Settings ;
- afficher `Dernière sauvegarde : ...` ;
- implémenter export local vers `PUT Worker` ;
- implémenter `GET Worker` vers import local ;
- demander confirmation avant restauration.

Critères d'acceptation :

- backup manuel fonctionnel ;
- restore manuel fonctionnel ;
- messages de succès et erreur propres ;
- pas de sauvegarde automatique pour l'instant.

## Ticket 14 - Auth Google OAuth

Objectif : identifier proprement l'utilisateur.

Décision MVP : utiliser Google OAuth uniquement pour identifier l'utilisateur et isoler son backup R2.

Données utilisées :

- Google `sub` comme userId stable ;
- email uniquement pour affichage ;
- name uniquement pour affichage.

Critères d'acceptation :

- l'utilisateur peut se connecter avec Google ;
- le backup est lié à son identité ;
- les données restent local-first ;
- l'app reste utilisable sans connexion si possible.

## Ticket 15 - Reminders MVP côté UI

Objectif : créer une première version des rappels sans complexité serveur.

Tâches :

- permettre de définir des heures ;
- détecter un rappel dû quand l'app est ouverte ;
- afficher un bandeau adapté.

Critères d'acceptation :

- les rappels sont configurables ;
- le bandeau apparaît au bon moment quand l'app est ouverte ;
- Web Push n'est pas obligatoire.

## Ticket 16 - Web Push notifications

Objectif : permettre à l'utilisateur d'être contacté même quand l'app n'est pas ouverte.

Tâches :

- ajouter un service worker ;
- demander la permission de notification ;
- stocker la subscription ;
- créer un endpoint Worker pour enregistrer la subscription ;
- envoyer une notification test ;
- prévoir des VAPID keys.

Critères d'acceptation :

- l'utilisateur peut activer les notifications ;
- une notification test fonctionne ;
- l'app reste utilisable si la permission est refusée.

## Ticket 17 - Polish UI moderne

Objectif : rendre l'app désirable.

Tâches :

- ajouter animations légères ;
- ajouter empty states ;
- ajouter micro-copy ;
- ajouter feedback visuel après ajout d'une entrée ;
- ajouter mode sombre si simple ;
- améliorer spacing, typo, cards, gradients ;
- ajouter une identité visuelle cohérente.

Critères d'acceptation :

- l'app donne envie d'être utilisée ;
- l'ajout d'une entrée est satisfaisant ;
- l'interface est propre sur mobile et desktop ;
- le produit ne ressemble pas à un formulaire CRUD.
