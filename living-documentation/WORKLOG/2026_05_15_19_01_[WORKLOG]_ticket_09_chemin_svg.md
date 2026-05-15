---
**date:** 2026-05-15
**status:** To Be Validated
**description:** Le Ticket 09 remplace le trait central de Today par un fleuve SVG continu, texturé et enrichi par des sprites PNG naturels recadrés manuellement.
**tags:** worklog, ticket-09, today-page, svg, river, fleuve, timeline, visual-design, png-sprites
---

# Ticket 09 — Chemin SVG

## Contexte

La roadmap demandait de transformer le chemin SVG vertical de Today en un rendu plus poétique, proche d'un fleuve qui s'écoule.

Plusieurs retours visuels ont guidé l'itération : mouvement trop proche d'une autoroute, intersections aux raccords de sections, bandes longitudinales lisibles comme du marquage routier, puis remplacement des artefacts SVG maison par des sprites PNG recadrés depuis un atlas naturel fourni par l'utilisateur.

## Réalisation

- Remplacement du chemin sinusoïdal fin par un fleuve SVG stratifié dans `TimelinePath`.
- Conservation d'un tracé de Bézier continu entre sections de jour.
- Ajout de plusieurs couches visuelles : berge diffuse, rive claire, corps principal en dégradé et reflets courts de surface.
- Suppression des dashs animés longitudinaux pour éviter l'effet route.
- Correction des raccords inter-sections via `strokeLinecap="butt"` sur les couches principales du fleuve.
- Ajout de `RiverSurfaceTexture`, basé sur des reflets courts, transversaux et déterministes.
- Intégration de 8 sprites PNG manuels dans `src/assets/river-sprites/` : `blossom-tree.png`, `dense-shrub.png`, `double-palms.png`, `gentle-tree.png`, `leaf-plant.png`, `rock-plant.png`, `round-bush.png`, `tree-cluster.png`.
- `TodayPage.tsx` importe uniquement ces crops et les positionne autour du fleuve via `RiverAtlasSprites` + `RIVER_ATLAS_PLACEMENTS`.
- Le PNG source complet reste à la racine et n'est pas importé par l'application.
- Nommage des dimensions, positions et paramètres visuels par constantes pour éviter les magic numbers.

## Choix retenus

La décision durable est documentée dans l'ADR `Chemin Today rendu comme fleuve SVG`.

Le changement reste strictement visuel : aucune modification du modèle IndexedDB, des hooks de timeline, de la création d'entrée ou des règles de revue hebdomadaire.

Les sprites PNG sont importés comme crops individuels plutôt que via la planche complète, afin d'éviter d'embarquer plusieurs mégaoctets d'assets inutiles dans le build.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.
- Vérification navigateur non réalisée par l'agent à la demande utilisateur ; validation esthétique laissée à l'utilisateur.

## Suites éventuelles

- Ajuster tailles et positions dans `RIVER_ATLAS_PLACEMENTS` après retour visuel utilisateur.
- Varier les sprites par index de jour si la répétition section par section devient trop visible.
- Si les sprites sont trop lourds visuellement, réduire l'opacité ou le nombre de placements.

## Documents liés

- ROADMAP `Tickets MVP` — Ticket 09 Chemin SVG
- ADR `Chemin Today rendu comme fleuve SVG`
- ADR `Timeline Today multi-jours scroll-up et day-anchored pills`
- ADR `Identité visuelle des jours sur Today`
