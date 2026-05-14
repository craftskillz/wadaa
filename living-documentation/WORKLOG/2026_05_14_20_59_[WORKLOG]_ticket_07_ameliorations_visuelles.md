---
**date:** 2026-05-14
**status:** Done
**description:** Le Ticket 07 refond l'écran Aujourd'hui en timeline visuelle, popup de saisie enrichie et navigation basse en drawer rétractable.
**tags:** worklog, ticket-07, today-page, timeline, bottom-nav, drawer, popup, media-card, visual-design
---

# Ticket 07 - Améliorations visuelles

## Contexte

Le Ticket 07 ajoute une étape visuelle avant les prochains écrans fonctionnels. Il vise la page Aujourd'hui et la navigation principale.

## Réalisation

- Transformation de `BottomNav` en drawer fixe inférieur avec poignée visible.
- Ouverture du drawer au survol, au focus et au tap sur la poignée.
- Refonte de la poignée en violet avec lanière blanche pour augmenter sa visibilité.
- Suppression du `max-width` global de `AppShell` pour aligner la scrollbar au bord du viewport.
- Ajout d'un padding bas dans `AppShell` pour que le drawer fixe ne masque pas le contenu scrollable.
- Remplacement du layout formulaire + liste de `TodayPage` par une timeline verticale.
- Ajout d'un chemin SVG vertical sinusoïdal.
- Prolongement du chemin sous le contenu via `-bottom-28` pour couvrir le bas visible au scroll maximum.
- Tri chronologique des entrées côté page pour que les nouvelles entrées apparaissent en bas.
- Alternance gauche/droite des cards d'entrée autour du chemin.
- Fixation des pastilles `Aujourd'hui` et compteur d'apprentissages en haut du viewport.
- Placement du bouton `+` au centre vertical du viewport.
- Désactivation du mouvement de survol du bouton `+` fixe pour éviter tout décalage visuel.
- Déplacement du panneau d'ajout dans une popup fixe centrée horizontalement et verticalement.
- Suppression du bouton `Rien pour le moment` dans la popup Today.
- Transformation des presets en préremplissage de l'idée plutôt qu'en création immédiate.
- Ajout d'une description obligatoire et d'une URL facultative lors de la création d'entrée.
- Affichage de la description et de l'URL dans les cards, avec miniature YouTube si possible et placeholder sinon.
- Remplacement du message de statut persistant par un toast transitoire avec fondu puis retrait du DOM.
- Placement de l'empty state en position fixe sous le bouton `+` quand aucune entrée n'existe.
- Conservation des comportements existants : suppression, custom vers preset, persistance Dexie.

## Choix retenus

La règle durable est documentée dans l'ADR `Timeline visuelle Today et navigation drawer`. Le contrat de création enrichie des entrées est documenté dans l'ADR `Création des entrées du jour local-first`.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.
- `git diff --check` : OK.
- Les contrôles navigateur de cette session sont laissés à l'utilisateur.

## Limites connues

- La récupération d'image n'est implémentée que pour les URL YouTube reconnues ; les autres URL utilisent un placeholder.
- Les anciennes entrées sans description restent affichées sans bloc description.

## Suites éventuelles

- Sur mobile réel, vérifier que les cards enrichies restent lisibles sur les plus petites largeurs.
- Définir plus tard une stratégie d'image pour les URL non YouTube.
- Si le drawer reste trop discret, ajouter un état ouvert temporaire au changement de route ou une animation de découverte.

## Documents liés

- `ROADMAP / Tickets MVP`
- ADR `Timeline visuelle Today et navigation drawer`
- ADR `Création des entrées du jour local-first`
- ADR `Transformation des réponses libres en presets réutilisables`
