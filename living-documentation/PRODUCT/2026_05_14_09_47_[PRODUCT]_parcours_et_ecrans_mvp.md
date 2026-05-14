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

Objectif : permettre une saisie rapide dans une expérience visuelle de journaling, tout en conservant assez de contexte pour relire l'apprentissage plus tard.

UI attendue après les ajustements du Ticket 07 :

- grande question scrollable : `Qu'as-tu appris aujourd'hui ?` ;
- pastilles fixes en haut : `Aujourd'hui` et compteur d'apprentissages ;
- chemin vertical sinusoïdal représentant la progression du jour, étiré jusqu'au bas de la zone scrollable et jusque dans la zone basse du drawer ;
- bouton `+` fixe, centré verticalement sur le chemin ;
- empty state fixe sous le bouton `+` lorsqu'aucune entrée n'existe ;
- popup d'ajout centrée horizontalement et verticalement ;
- choix rapides qui préremplissent l'idée sans créer immédiatement l'entrée ;
- champ `Idée` pour le résumé court ;
- champ `Description` obligatoire, en textarea haute et redimensionnable ;
- champ `URL facultative` ;
- bouton unique `Ajouter à ma journée` ;
- entrées du jour affichées en cards alternées à gauche et à droite du chemin ;
- cards affichant l'idée, la description, l'URL éventuelle et une miniature YouTube si l'URL est reconnue ;
- navigation principale sous forme de drawer inférieur rétractable avec poignée visible.

Comportement :

- cliquer sur un preset préremplit l'idée ;
- écrire dans le champ idée crée une entrée custom si aucun preset correspondant n'est sélectionné ;
- la description est obligatoire pour ajouter l'entrée ;
- l'URL est facultative et doit être valide si renseignée ;
- les entrées du jour apparaissent sur le chemin chronologique, les plus récentes en bas ;
- permettre de supprimer une entrée du jour ;
- permettre à une entrée custom de devenir un preset.

Critères d'acceptation :

- une entrée peut être ajoutée rapidement, avec description obligatoire ;
- les entrées du jour s'affichent immédiatement ;
- les données restent après refresh ;
- l'écran est mobile-first ;
- le footer est un drawer inférieur ;
- le chemin vertical est sinusoïdal ;
- les idées se disposent alternativement à droite et à gauche du chemin.

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
