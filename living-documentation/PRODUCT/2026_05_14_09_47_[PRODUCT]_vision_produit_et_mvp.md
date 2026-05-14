---
**date:** 2026-05-14
**status:** Draft
**description:** Vision produit, définition du MVP utilisable et principes de développement pour l'application personnelle Qu'as-tu appris aujourd'hui.
**tags:** produit, mvp, local-first, journaling, apprentissage, ux, roadmap
---

# Vision produit et MVP

## Vision

Construire une application web personnelle qui contacte l'utilisateur plusieurs fois par jour pour lui demander :

> Qu'as-tu appris aujourd'hui ?

L'application doit aider l'utilisateur à capturer rapidement ses apprentissages, trier le bruit en fin de semaine et visualiser sa progression.

## Réponses rapides attendues

L'utilisateur peut :

- répondre `Rien pour le moment` ;
- choisir une réponse prédéfinie ;
- ajouter une réponse libre ;
- transformer une réponse libre en option réutilisable ;
- revoir sa semaine ;
- mettre des étoiles aux apprentissages importants ;
- supprimer le bruit ;
- visualiser une courbe de ses apprentissages.

## Qualités produit

Le produit doit être :

- jeune ;
- moderne ;
- rapide ;
- très simple ;
- agréable à ouvrir plusieurs fois par jour ;
- local-first ;
- très peu coûteux à héberger.

## Définition du MVP utilisable

Le MVP est considéré utilisable quand :

- l'utilisateur peut saisir ses apprentissages du jour ;
- les données persistent localement ;
- il peut revoir sa semaine ;
- il peut noter, garder ou jeter ses apprentissages ;
- il peut voir une courbe simple ;
- il peut exporter et importer ses données ;
- l'interface est agréable sur mobile.

Le backup R2 et l'authentification Google sont importants, mais ils peuvent arriver après le coeur local-first.

## Principe de développement

Toujours privilégier :

- simplicité ;
- incrémentalité ;
- local-first ;
- faible coût ;
- UX rapide ;
- code lisible ;
- absence de dépendance serveur inutile.

Chaque ticket doit livrer quelque chose de testable visuellement.

## Hors périmètre MVP

Le MVP ne contient pas :

- de vraie base de données serveur ;
- de multi-device temps réel ;
- de collaboration ;
- de moteur IA ;
- de notifications complexes ;
- de dashboard admin ;
- de paiement.

## Direction UX/UI

L'application doit ressembler à un outil moderne de self-growth et de journaling, pas à un formulaire administratif.

Références visuelles :

- cards arrondies ;
- glassmorphism léger ;
- gradients doux ;
- typographie large ;
- gros boutons tactiles ;
- micro-interactions ;
- emojis bien utilisés mais pas enfantins ;
- expérience mobile-first.

Ambiance :

- jeune ;
- calme ;
- motivante ;
- très rapide ;
- une question, une réponse.

Palette suggérée :

- fond clair légèrement crème ou gris très doux ;
- accents violet, bleu et vert menthe ;
- mode sombre prévu mais pas obligatoire au premier ticket.

## Écran principal cible

L'écran principal contient :

- une grande question centrale ;
- quelques réponses rapides ;
- un champ libre ;
- un bouton d'ajout ;
- une indication de progression du jour.