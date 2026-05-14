---
**date:** 2026-05-14
**status:** Draft
**description:** Routes, écrans et comportements utilisateur attendus pour le MVP de l'application Qu'as-tu appris aujourd'hui.
**tags:** produit, routes, onboarding, aujourd'hui, revue-hebdomadaire, calendrier, insights, settings, ux
---

# Parcours et écrans MVP

## Routes MVP

```text
/
  Aujourd'hui

/week
  Revue hebdomadaire

/calendar
  Calendrier d'apprentissage

/insights
  Courbe et stats simples

/settings
  Réglages

/onboarding
  Première expérience
```

## Onboarding

Objectif : présenter le concept en moins de 30 secondes.

Titre :

> Qu'as-tu appris aujourd'hui ?

Texte :

> Note tes apprentissages au fil de la journée, garde les meilleurs en fin de semaine, et visualise ta progression.

Étapes :

1. Choisir ses heures de rappel.
2. Choisir quelques catégories initiales.
3. Commencer.

Presets initiaux suggérés :

- J'ai appris un concept technique ;
- J'ai compris une erreur ;
- J'ai découvert un outil ;
- J'ai appris quelque chose sur moi ;
- J'ai eu une bonne discussion ;
- Je n'ai rien appris pour le moment.

Critères d'acceptation :

- l'onboarding apparaît au premier lancement ;
- les réglages sont sauvegardés localement ;
- l'utilisateur arrive ensuite sur l'écran Aujourd'hui.

## Aujourd'hui

Objectif : permettre une saisie ultra rapide.

UI attendue :

- grande question : `Qu'as-tu appris aujourd'hui ?` ;
- liste de boutons ou pills avec presets ;
- champ libre : `Écris ton apprentissage...` ;
- bouton : `Ajouter à ma journée` ;
- option rapide : `Rien pour le moment`.

Comportement :

- cliquer sur un preset crée une entrée ;
- écrire dans le champ libre crée une entrée custom ;
- `Rien pour le moment` crée une entrée `empty` ;
- afficher les entrées du jour en dessous ;
- permettre de supprimer une entrée du jour ;
- permettre à une entrée custom de devenir un preset.

Critères d'acceptation :

- une entrée peut être ajoutée en moins de 3 secondes ;
- les entrées du jour s'affichent immédiatement ;
- les données restent après refresh ;
- l'écran est mobile-first.

## Revue hebdomadaire

Objectif : créer le moment fort du produit.

Titre :

> Ta semaine d'apprentissage

Afficher toutes les entrées de la semaine avec :

- contenu ;
- date ;
- bouton étoile de 1 à 5 ;
- bouton garder ;
- bouton jeter.

Action finale :

> Valider ma semaine

Règle produit : la revue force la curation. Les apprentissages importants sont gardés, le bruit est jeté, et les étoiles donnent de la valeur à la courbe.

Critères d'acceptation :

- l'utilisateur peut noter chaque entrée ;
- l'utilisateur peut garder ou jeter une entrée ;
- une `WeeklyReview` est créée ;
- les entrées jetées ne sont plus visibles dans les insights principaux.

## Courbe d'apprentissage

Objectif : donner un feedback visuel motivant.

Métriques MVP par jour :

- nombre d'entrées gardées ;
- somme des étoiles ;
- moyenne des étoiles.

Score simple :

```ts
dailyScore = sum(rating of kept entries)
```

UI attendue :

- courbe sur 7 jours ;
- courbe sur 30 jours ;
- cards `jours actifs`, `apprentissages gardés`, `score moyen`, `meilleure journée`.

Critères d'acceptation :

- les stats sont calculées localement ;
- la courbe est lisible ;
- les entrées jetées ne comptent pas ;
- si aucune donnée, afficher un empty state motivant.

## Calendrier d'apprentissage

Objectif : visualiser les jours avec apprentissages.

UI attendue :

- vue mensuelle simple ;
- chaque jour affiche un point si au moins une entrée ;
- chaque jour peut avoir une intensité visuelle selon le nombre d'entrées ou les étoiles ;
- cliquer sur un jour affiche les apprentissages du jour.

Critères d'acceptation :

- le calendrier montre les jours actifs ;
- une journée passée peut être consultée ;
- le design reste simple et lisible.

## Réglages

Objectif : permettre à l'utilisateur de contrôler son expérience.

Réglages MVP :

- heures de rappel ;
- premier jour de la semaine ;
- export JSON ;
- import JSON ;
- réinitialisation des données locales ;
- gestion des presets : renommer, archiver, supprimer.

Critères d'acceptation :

- les réglages sont sauvegardés localement ;
- l'export JSON fonctionne ;
- l'import JSON restaure l'état ;
- les presets sont modifiables.

## Reminders MVP côté UI

Objectif : créer une première version des rappels sans complexité serveur.

Comportement :

- l'utilisateur définit des heures ;
- l'application affiche un bandeau si un rappel est dû ;
- exemple : `Il est 14h. Tu as appris quelque chose depuis ce matin ?`

Critères d'acceptation :

- les rappels sont configurables ;
- le bandeau apparaît au bon moment quand l'application est ouverte ;
- Web Push n'est pas obligatoire au MVP.