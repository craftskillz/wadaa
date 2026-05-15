---
**date:** 2026-05-15
**status:** To be validated
**description:** Le chemin Today est rendu comme un fleuve SVG continu par section, avec berges diffuses, corps en dégradé, surface texturée et sprites PNG végétaux placés par règles de distance au fleuve, sans changer la sémantique de timeline ni la création des entrées.
**tags:** adr, today-page, timeline, svg, river, fleuve, surface-texture, png-sprites, atlas, aspect-ratio, placement-rules, visual-design, useId, mobile-first
---

# Chemin Today rendu comme fleuve SVG

## Contexte

La roadmap demande de remplacer le chemin SVG vertical de Today par un rendu plus poétique, proche d'un fleuve qui s'écoule. Les ADR précédents avaient déjà posé les invariants de l'écran Today : timeline multi-jours, sections empilées, continuité du tracé entre sections, cards alternées, ajout uniquement sur le jour courant et fonds pastel par jour.

La demande ne modifie pas le modèle local-first, la fenêtre de 7 jours, ni les règles de création d'entrée. Elle cible uniquement le langage visuel du tracé central.

Les itérations visuelles successives ont corrigé plusieurs problèmes : mouvement trop proche d'une autoroute, intersections visibles entre sections, bandes longitudinales lisibles comme du marquage routier, sprites étirés par le SVG, placements incohérents selon la nature des assets, puis aspect trop jeu vidéo introduit par les sprites de rochers.

## Décision

`TimelinePath` dans `src/features/entries/TodayPage.tsx` garde un SVG par section et conserve un tracé de Bézier C1-continu, afin que l'empilement des sections reste sans angle visible.

Le tracé central est élargi et rendu comme un fleuve par superposition de plusieurs paths sur la même courbe :

- une berge diffuse large avec filtre `feGaussianBlur` ;
- une rive claire qui sépare le fleuve des fonds pastel ;
- un corps principal en dégradé bleu, teal et indigo ;
- une texture de surface composée de petits reflets courts, transversaux, irréguliers et statiques ;
- des sprites PNG végétaux placés autour des berges.

Les largeurs du fleuve ont été agrandies à l'échelle x2 (`TIMELINE_RIVER_BANK_WIDTH`, `TIMELINE_RIVER_SHORE_WIDTH`, `TIMELINE_RIVER_BODY_WIDTH`) pour donner une vraie présence visuelle au cours d'eau sur mobile. Les sprites de berge sont eux aussi rendus à l'échelle x2 via `RIVER_SPRITE_SCALE_MULTIPLIER`, et les distances par affinité ont été doublées pour conserver les règles de proximité malgré le fleuve plus large.

Les cards alternées gardent la structure gauche/droite mais utilisent un couloir central plus large (`5rem` sur mobile, `8rem` à partir du breakpoint `sm`) et un retrait côté fleuve. Cette marge empêche les cards de coller au centre visuel quand le fleuve est large.

Le padding bas réservé à la navigation mobile est porté par la dernière `DaySection` sur Today, pas par le conteneur parent. `AppShell` garde son `pb-28` global sur les autres routes, mais le remplace par `pb-0` sur `/` pour éviter de créer une zone scrollable après la page Today. Comme `TimelinePath` est en `absolute inset-y-0` dans la section, le fleuve couvre aussi cette réserve de scroll et ne s'arrête pas avant la fin verticale maximale.

Les couches principales du fleuve (berge, rive claire, corps d'eau) utilisent `strokeLinecap="butt"` via `TIMELINE_RIVER_SECTION_CAP`. Les détails courts de surface gardent des caps arrondis. Cette séparation évite les bulles ou intersections aux raccords haut/bas de deux sections tout en préservant un rendu organique dans le corps du fleuve.

Les anciens dashs animés sur le tracé principal ont été supprimés. `RiverSurfaceTexture` rend une série déterministe de petits reflets définis par `RIVER_SURFACE_RIPPLES`. Chaque reflet est une courbe courte placée dans le corps du fleuve avec une rotation légère, plutôt qu'une bande longitudinale. Le résultat doit évoquer des remous/reflets localisés, pas une voie de circulation.

Les sprites utilisés sont des crops PNG manuels placés dans `src/assets/river-sprites/` : `blossom-tree.png`, `dense-shrub.png`, `double-palms.png`, `gentle-tree.png`, `leaf-plant.png` et `round-bush.png`. Les sprites rochers `rock-plant.png` et `tree-cluster.png` ont été retirés définitivement parce qu'ils donnaient un aspect trop jeu ; ils ne sont pas remplacés par d'autres images, afin de conserver la densité générale moins chargée demandée.

`RiverAtlasSprites` importe uniquement ces crops et les rend en `<img>` HTML dans un overlay absolu au-dessus du SVG. Les coordonnées verticales restent dérivées du référentiel du fleuve, mais les dimensions sont appliquées en pixels CSS égaux en largeur/hauteur. Cela préserve le ratio carré des sprites et garantit qu'ils apparaissent au-dessus du fleuve.

Les placements ne sont plus des `x` arbitraires. Chaque sprite déclare une `affinity` (`waterPlant` ou `treeGroup`) et un `side` (`left`, `right`). `getRiverCenterXAtY(y)` calcule la position horizontale de la courbe du fleuve à la hauteur du sprite via la même logique de Bézier que le `TIMELINE_PATH`. La distance horizontale est ensuite déterminée par l'affinité :

- `waterPlant` : plantes d'eau collées au fleuve (`double-palms.png`, `leaf-plant.png`) ;
- `treeGroup` : arbres/buissons plus éloignés, groupés ou alignés (`blossom-tree.png`, `round-bush.png`, `gentle-tree.png`, `dense-shrub.png`).

Les placements `waterPlant` peuvent rester seuls, mais privilégient des paires via `RIVER_WATER_PLANT_CLUSTER_PATTERNS`. Le motif `sideBySide` place deux plantes rapprochées sur la même berge ; `oppositeDiagonal` place deux plantes en regard diagonal sur les deux bords opposés du fleuve. Les items du motif peuvent inverser le côté de placement avec un multiplicateur de berge, sans dupliquer de coordonnées absolues.

Les placements `treeGroup` ne rendent jamais un sprite isolé. Chaque emplacement choisit un motif déterministe `three`, `four` ou `five`, défini dans `RIVER_TREE_GROUP_CLUSTER_PATTERNS`, avec des offsets serrés et de légères variations d'échelle. Les arbres et buissons apparaissent donc en bosquets compacts de 3, 4 ou 5 éléments.

Les identifiants SVG (`linearGradient`, `filter`) sont générés avec `useId()` puis nettoyés des `:` pour éviter les collisions entre les multiples instances de `TimelinePath` rendues sur les différentes sections de jour.

Les dimensions, positions et paramètres visuels porteurs de sens sont nommés par constantes (`TIMELINE_RIVER_BODY_WIDTH`, `RIVER_SURFACE_RIPPLES`, `RIVER_ATLAS_PLACEMENTS`, `WATER_PLANT_DISTANCE_PX`, etc.) pour respecter la règle `no-magic-numbers`.

## Conséquences

### PROS

- Le chemin central devient plus distinctif et mieux aligné avec l'intention poétique du produit.
- La continuité multi-sections reste préservée : le même tracé est utilisé pour toutes les couches principales du fleuve.
- Les raccords entre sections ne produisent plus de caps arrondis visibles sur les couches principales.
- La surface ne comporte plus de bandes longitudinales animées qui évoquent une route.
- Les sprites PNG végétaux donnent des artefacts de berge plus riches que les SVG maison initiaux.
- Les sprites restent carrés et ne sont plus déformés par le SVG `preserveAspectRatio="none"`.
- Les sprites apparaissent au-dessus du fleuve, pas derrière.
- Les règles d'affinité rendent les placements plus cohérents avec la nature des images.
- Les sprites de rochers ne sont plus embarqués ni rendus, ce qui réduit l'aspect jeu.
- Les plantes d'eau apparaissent le plus souvent en paires naturelles, sur une berge ou en regard diagonal.
- Les arbres et buissons ne paraissent plus isolés : ils sont rendus en bosquets compacts.
- Les cards gardent plus d'air autour du fleuve quand le tracé central est large.
- Le fleuve couvre la réserve basse de scroll et reste visible jusqu'au bas maximal.
- Le build évite d'importer la planche complète et n'embarque que les crops utilisés.

### CONS

- Le rendu devient plus dépendant de la qualité visuelle réelle dans le navigateur ; l'utilisateur doit valider l'esthétique finale.
- Les sprites sont répétés sur chaque section de jour ; si cela devient trop régulier, il faudra varier la configuration selon l'index du jour.
- Les crops PNG ajoutent du poids au build, même si c'est nettement moins que la planche complète.
- Les dimensions de sprite sont codées dans `TodayPage.tsx` ; si un crop est remplacé par une image de taille différente, il faut ajuster la configuration.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.
- Vérification navigateur non réalisée par l'agent à la demande utilisateur ; validation visuelle laissée à l'utilisateur.

## Documents liés

- ADR `Timeline visuelle Today et navigation drawer`
- ADR `Timeline Today multi-jours scroll-up et day-anchored pills`
- ADR `Identité visuelle des jours sur Today`
- ROADMAP `Tickets MVP` — Ticket 09 Chemin SVG
