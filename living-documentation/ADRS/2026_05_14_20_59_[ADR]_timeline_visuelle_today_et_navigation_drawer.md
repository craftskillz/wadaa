---
**date:** 2026-05-14
**status:** Accepted
**description:** L'écran Aujourd'hui adopte une timeline verticale sinusoïdale avec popup de saisie enrichie, cards média, éléments fixes et navigation principale en drawer inférieur rétractable.
**tags:** adr, today-page, timeline, visual-design, bottom-nav, drawer, popup, media-card, mobile-first, ux
---

# Timeline visuelle Today et navigation drawer

## Contexte

Le Ticket 07 modifie fortement l'expérience visuelle de l'écran Aujourd'hui sans changer la source de vérité locale ni les comportements métier fondamentaux des Tickets 05 et 06.

L'objectif produit est de sortir d'une disposition formulaire + liste, pour donner à la capture quotidienne un aspect plus narratif : les apprentissages doivent s'inscrire le long d'un chemin vertical et les nouvelles idées doivent arriver en bas de ce chemin.

## Décision

L'écran Aujourd'hui est organisé autour d'un chemin SVG vertical sinusoïdal, rendu par `TimelinePath` dans `TodayPage.tsx`. Le SVG est placé dans un conteneur absolu ancré en haut et prolongé sous le contenu via `-bottom-28`, afin que le chemin couvre aussi la zone basse visible au scroll maximum, devant le drawer.

Les entrées du jour sont triées chronologiquement par `createdAt` côté page, afin que les nouvelles entrées apparaissent en bas du chemin. Les cards alternent à gauche et à droite du chemin via leur index dans la liste chronologique.

La question `Qu'as-tu appris aujourd'hui ?` reste dans le flux scrollable. Les pastilles de contexte `Aujourd'hui` et compteur d'apprentissages sont fixes en haut du viewport. Le bouton `+` est fixe au centre vertical du viewport et désactive le mouvement de survol du composant `Button` afin de ne pas se déplacer visuellement. Quand aucune entrée n'existe, l'empty state est lui aussi fixe sous ce bouton.

Le feedback d'action est un toast fixe sous les pastilles : chaque message est créé avec un identifiant unique, reste visible pendant une courte durée, s'estompe par transition d'opacité, puis est retiré du DOM. Cela évite que `Ajouté à ta journée` ou `Entrée supprimée` restent affichés indéfiniment.

Le formulaire d'ajout est déplacé dans une popup fixe déclenchée par le bouton `+`, centrée horizontalement et verticalement dans le viewport. Les choix rapides préremplissent le champ `Idée` au lieu de créer immédiatement l'entrée. La popup exige une `Description`, accepte une `URL facultative`, et expose un seul bouton principal `Ajouter à ma journée`.

Les cards affichent l'idée courte, la description multi-ligne et l'URL éventuelle. Quand l'URL est une URL YouTube reconnue, une miniature vidéo est affichée via `img.youtube.com`; sinon la card affiche un placeholder visuel. L'URL reste cliquable dans la card.

La navigation principale n'est plus un footer visible en permanence. `BottomNav` devient un drawer fixe en bas de viewport : une poignée violette avec lanière blanche reste visible, le panneau remonte au survol, au focus ou au tap sur la poignée.

`AppShell` n'est plus contraint par un `max-width` global afin que la scrollbar du contenu soit alignée au bord du viewport. Il augmente aussi le padding bas du `main` pour éviter que le drawer fixe masque le contenu scrollable.

## Conséquences

### PROS

- L'écran Aujourd'hui devient plus distinctif et plus proche d'un parcours de journaling.
- Les entrées sont perçues comme une progression chronologique plutôt qu'une simple liste CRUD.
- Le bouton `+` rend la capture accessible depuis le centre du viewport.
- Les cards deviennent plus riches grâce à la description et à l'URL optionnelle.
- Les pastilles fixes gardent le contexte visible sans figer la question principale.
- La navigation conserve les routes MVP tout en libérant de l'espace visuel.

### CONS

- La page Today porte plus de logique de présentation que précédemment.
- La capture exige désormais plus qu'un simple clic sur un preset.
- Le drawer repose sur des interactions hover/focus/tap et devra être surveillé sur mobile réel.
- L'alternance gauche/droite réduit l'espace horizontal disponible pour les cards sur petits écrans.
- Les validations automatisées disponibles restent lint et build ; les contrôles navigateur de cette session sont laissés à l'utilisateur.

## Documents liés

- `ROADMAP / Tickets MVP`
- `PRODUCT / Parcours et écrans MVP`
- `WORKLOG / Ticket 07 Améliorations visuelles`
- ADR `Création des entrées du jour local-first`
- ADR `Transformation des réponses libres en presets réutilisables`
