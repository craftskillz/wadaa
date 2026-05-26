---
**date:** 2026-05-15
**status:** Partially SuperSeeded
**description:** L'écran Aujourd'hui s'étendait sur les 7 derniers jours avec ancrage sur Aujourd'hui ; la fenêtre fixe de 7 jours est remplacée par une fenêtre de six mois chargée progressivement.
**tags:** adr, today-page, timeline, scroll, multi-day, scroll-container, intersection, today-anchor, ux, svg-path, scroll-restoration, superseded-by-six-months

---

# Timeline Today multi-jours scroll-up et day-anchored pills

## Supersession partielle

La décision de fenêtre fixe `TIMELINE_DAYS_VISIBLE = 7` est remplacée par l'ADR `Timeline Today six mois en chargement progressif`. Les autres invariants restent valides : ancrage initial sur Aujourd'hui, jours passés vides masqués, nouvelles entrées toujours datées du jour réel, pastilles de jour actif et bouton `Revenir à aujourd'hui`.

## Contexte

L'ADR `Timeline visuelle Today et navigation drawer` (Ticket 07) fixait l'écran Aujourd'hui sur la seule date du jour : un chemin SVG vertical, des cards alternées, un bouton `+` au centre du viewport, et tout le contenu s'épuisait sur les entrées du jour.

L'utilisateur souhaite voir l'historique récent en restant sur la même page : remonter jusqu'à 7 jours en arrière par scroll-up, sans changer d'écran, et garder un repère visuel clair sur le jour observé. La sémantique d'écriture ne change pas : les nouvelles entrées vont toujours vers la date du jour réel.

Les itérations visuelles ont montré que restaurer un ancien jour actif au chargement pouvait faire paraître la page Aujourd'hui trop basse. Le chargement doit donc privilégier l'ancrage sur Aujourd'hui. En revanche, le bouton `+` ne doit pas apparaître quand l'utilisateur consulte le passé : il réapparaît uniquement quand Aujourd'hui est le jour actif.

## Décision

### Fenêtre temporelle

L'écran couvre les `TIMELINE_DAYS_VISIBLE = 7` derniers jours (jour courant inclus). Les jours sont rendus du plus ancien (en haut du document) au plus récent (en bas). Au chargement, la page se positionne toujours sur la section Aujourd'hui en haut du viewport. Le scroll vers le haut révèle les jours passés.

La fenêtre est paramétrée par une seule constante. Augmenter à 14 ou 30 jours plus tard ne demandera qu'un changement de cette constante.

### Filtrage des jours rendus

Seuls les jours qui ont au moins une entrée sont rendus, **plus** la section Aujourd'hui qui est toujours visible (même vide, pour héberger l'empty state d'invitation à la capture). Les jours passés sans entrée disparaissent du DOM.

Le filtrage se fait en composant via `renderedDays = days.filter(d => d.dateKey === todayKey || d.entries.length > 0)`. Le hook `useTimelineData` continue d'exposer la fenêtre complète (`days`) pour rester réutilisable. La liste `dayKeys` passée à `useActiveDay` est dérivée de `renderedDays` pour rester alignée avec ce qui est dans le DOM.

### Pile de données

`useTimelineData(daysCount)` (`src/features/entries/useTimelineData.ts`) remplace `useTodayData`. Il calcule la fenêtre `[oldestKey, todayKey]`, requête Dexie sur l'index `date`, regroupe les entrées par jour, garantit les `daysCount` jours dans le résultat et charge les presets actifs.

### Détection du jour actif

`useActiveDay(dayKeys)` (`src/features/entries/useActiveDay.ts`) attache son listener `scroll` au vrai container scrollable, l'élément `<main>` rendu par `AppShell`. Le calcul est throttlé via `requestAnimationFrame` et retient la section dont le `top` est le plus grand parmi celles situées avant l'offset fixe `ACTIVE_DAY_OFFSET_PX = 160`.

Les pastilles fixes en haut du viewport reflètent le jour actif : libellé (`Aujourd'hui`, `Hier`, date), compteur d'entrées non-`empty` du jour actif, couleur synchronisée avec le thème pastel du jour actif.

Quand l'utilisateur n'est pas sur Aujourd'hui, un bouton secondaire « Revenir à aujourd'hui » apparaît sous les pastilles et déclenche un `scrollIntoView` smooth vers la section du jour courant.

### Ancrage initial et re-snap

Today ne restaure plus l'ancien jour actif depuis `localStorage`. La persistance `today-page-active-day-v1` a été retirée de `TodayPage`. Au chargement, le `useLayoutEffect` cible directement `[data-day-section="${todayKey}"]` et appelle `scrollIntoView({ block: "start" })`.

Les images de couverture chargent de manière asynchrone et peuvent décaler les sections. Le `useLayoutEffect` de scroll initial se ré-exécute donc à chaque mise à jour de `renderedDays`, tant que l'utilisateur n'a pas interagi (`wheel`, `touchstart` ou `keydown`) et tant qu'on est dans la fenêtre `AUTO_SCROLL_GRACE_PERIOD_MS = 2500` ms après le mount.

### Bouton + visible uniquement sur Aujourd'hui

Le bouton `+` flottant est conditionné par `isOnToday`, donc par le jour actif détecté. Il n'apparaît pas quand l'utilisateur consulte un jour passé. Pour ajouter une entrée, l'utilisateur revient à Aujourd'hui via le bouton « Revenir à aujourd'hui » ou par scroll, puis le `+` réapparaît.

Le bouton est positionné en bas à droite (`fixed bottom/right`) au-dessus de la navigation basse. Son action ouvre toujours le composer « Nouvelle idée pour aujourd'hui » et l'écriture reste datée du jour réel via `entryStorage.ts`. Le backfill reste hors scope.

### Layout par section de jour

Chaque section a une hauteur minimale de 80vh. Elle contient un `TimelinePath` SVG en background, un en-tête Today uniquement pour le jour courant, la liste des entrées en cards alternées gauche/droite, et pour Aujourd'hui sans entrée un `EmptyState` avec bouton secondaire ouvrant le composer.

### Chemin SVG continu entre sections

Le `TIMELINE_PATH` est rendu une fois par section dans une SVG en `preserveAspectRatio="none"`. Il est conçu comme une chaîne de courbes de Bézier C1-continues. Empiler N sections produit un chemin visuellement continu, sans angle.

## Conséquences

### PROS

- F5 revient toujours sur Aujourd'hui, ce qui correspond mieux à l'usage principal de capture quotidienne.
- L'auto-snap pendant 2,5s gomme les décalages dus au chargement asynchrone des images de couverture, sans gêner l'utilisateur qui scrolle activement.
- Le bouton `+` ne se mélange plus à la consultation du passé ; il n'apparaît que lorsque la capture pour Aujourd'hui est contextuellement visible.
- Le bouton `+` est moins intrusif dans le fleuve, car il est placé en bas à droite.
- Continuité narrative : l'historique de la semaine est consultable sans changer d'écran.
- Jours vides masqués : la page reste compacte et orientée contenu réel.
- Chemin SVG visuellement continu sur toute la longueur du document.
- Sémantique d'écriture inchangée : entrée toujours datée du jour réel.

### CONS

- Le rafraîchissement ne restaure plus l'ancien jour consulté : l'utilisateur revient volontairement au contexte Aujourd'hui.
- L'auto-snap dépend de `performance.now()` capturé à l'initialisation via `useState(() => …)`. Si le mount est suivi d'un Suspense ou d'un long délai avant les premières données, la fenêtre de 2,5s peut être consommée avant que les images n'aient eu le temps de charger.
- Le hook `useActiveDay` connaît implicitement la structure du layout (présence d'un `<main>` scrollable). Si `AppShell` change de container scrollable, il faudra ajuster `findScrollTarget()`.
- L'`ACTIVE_DAY_OFFSET_PX` (160) est calibré sur la hauteur des pastilles fixes ; un changement majeur de ces pastilles peut décaler la détection.
- Pas de virtualisation ni de chargement paresseux : tous les jours non vides sont rendus immédiatement. Acceptable à 7 jours.

## Documents liés

- ADR `Timeline Today six mois en chargement progressif` — remplace la fenêtre fixe de 7 jours
- ADR `Timeline visuelle Today et navigation drawer` (Ticket 07) — partiellement complété par la présente décision
- ADR `Création des entrées du jour local-first`
- ADR `Miniatures locales et résolution des couvertures d'entrée` — explique l'origine des shifts de layout asynchrones
- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ROADMAP `Tickets MVP` — amélioration sur Ticket 07 livrée pendant le Ticket 08
