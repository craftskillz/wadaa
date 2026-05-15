---
**date:** 2026-05-15
**status:** Accepted
**description:** L'écran Aujourd'hui s'étend sur les 7 derniers jours, ne rend que les jours non vides plus aujourd'hui, observe le scroll sur le vrai container, persiste le jour actif en localStorage et re-snap pendant 2,5s pour absorber les shifts de layout asynchrones.
**tags:** adr, today-page, timeline, scroll, multi-day, scroll-container, intersection, today-anchor, ux, svg-path, localstorage, scroll-restoration

---

# Timeline Today multi-jours scroll-up et day-anchored pills

## Contexte

L'ADR `Timeline visuelle Today et navigation drawer` (Ticket 07) fixait l'écran Aujourd'hui sur la seule date du jour : un chemin SVG vertical, des cards alternées, un bouton `+` au centre du viewport, et tout le contenu s'épuisait sur les entrées du jour.

L'utilisateur souhaite désormais voir l'historique récent en restant sur la même page : remonter jusqu'à 7 jours en arrière par scroll-up, sans changer d'écran, et garder un repère visuel clair sur le jour observé. La sémantique d'écriture (les nouvelles entrées vont toujours vers la date du jour) ne change pas.

## Décision

### Fenêtre temporelle

L'écran couvre les `TIMELINE_DAYS_VISIBLE = 7` derniers jours (jour courant inclus). Les jours sont rendus du plus ancien (en haut du document) au plus récent (en bas). Au chargement, la page se positionne sur le jour persisté (ou Aujourd'hui par défaut) en haut du viewport. Le scroll vers le haut révèle les jours passés.

La fenêtre est paramétrée par une seule constante. Augmenter à 14 ou 30 jours plus tard ne demandera qu'un changement de cette constante.

### Filtrage des jours rendus

Seuls les jours qui ont au moins une entrée sont rendus, **plus** la section Aujourd'hui qui est toujours visible (même vide, pour héberger l'empty state d'invitation à la capture). Les jours passés sans entrée disparaissent du DOM : pas de placeholder, pas de message « Aucun apprentissage », pas d'icône lune.

Le filtrage se fait en composant via `renderedDays = days.filter(d => d.dateKey === todayKey || d.entries.length > 0)`. La hook `useTimelineData` continue d'exposer la fenêtre complète (`days`) pour rester réutilisable. La liste `dayKeys` passée à `useActiveDay` est dérivée de `renderedDays` pour rester alignée avec ce qui est dans le DOM.

### Pile de données

`useTimelineData(daysCount)` (`src/features/entries/useTimelineData.ts`) remplace `useTodayData`. Il :

- calcule la fenêtre `[oldestKey, todayKey]` via `getLastDaysKeys(daysCount)` ;
- fait une seule requête Dexie `liveQuery` `db.entries.where("date").between(oldestKey, todayKey, true, true)` (l'index `date` couvre la plage) ;
- regroupe les entrées par `date` ;
- garantit que les `daysCount` jours sont toujours présents dans le tableau retourné, même quand un jour n'a aucune entrée ;
- charge en parallèle les presets actifs.

L'ancienne hook `useTodayData` est supprimée (plus aucun consommateur).

### Détection du jour actif

`useActiveDay(dayKeys)` (`src/features/entries/useActiveDay.ts`) attache son listener `scroll` au **vrai container scrollable**, qui est l'élément `<main>` rendu par `AppShell` (le `body` est `overflow-hidden` et le scroll a lieu dans ce `<main>` interne). Un listener attaché à `window` ne reçoit jamais ces événements. La fonction `findScrollTarget()` récupère le `<main>` via `document.querySelector("main")` au moment où l'effet s'exécute, avec fallback sur `window`.

Le calcul est throttlé via `requestAnimationFrame`. Pour chaque section de jour, on lit `getBoundingClientRect().top` (toujours viewport-relatif, indépendant du container scrollable) et on retient celle dont le `top` est le plus grand parmi celles ≤ `ACTIVE_DAY_OFFSET_PX = 160` pixels du haut du viewport. La constante de 160 px tient compte de la zone occupée par les pastilles fixes en haut de la page.

Chaque section de jour porte un attribut `data-day-section={dateKey}` pour servir d'ancre. La détection est rebootée quand la liste de jours change.

Les pastilles fixes en haut du viewport reflètent le jour actif :

- libellé : `formatDayLabel(activeDay, todayKey)` → `Aujourd'hui` / `Hier` / `Mardi 13 mai` ;
- ton : `mint` quand on est sur Aujourd'hui, `slate` sinon ;
- compteur : nombre d'entrées non-`empty` du jour actif uniquement.

Les sections de jours passés affichent uniquement la pastille `slate` avec le label du jour comme repère interne, sans dupliquer le compteur déjà présent dans la pastille fixe.

Quand l'utilisateur n'est pas sur Aujourd'hui, un bouton secondaire « Revenir à aujourd'hui » apparaît sous les pastilles et déclenche un `scrollIntoView` smooth vers la section du jour courant.

### Persistance de la position et restauration au reload

Le jour actif est persisté en `localStorage` (clé `today-page-active-day-v1`) à chaque changement détecté par `useActiveDay`. Au chargement, `TodayPage` lit cette valeur et l'utilise comme cible de scroll initial **si** le jour est encore dans la fenêtre visible ; sinon il retombe sur Aujourd'hui. Cela rend le rafraîchissement (F5) prévisible : l'utilisateur retrouve la page exactement où il l'avait laissée.

Côté écriture : un simple `useEffect([activeDay])` qui appelle `writeStoredActiveDay(activeDay)`. Pas de debouncing — `activeDay` ne change qu'au franchissement d'une frontière de jour, donc la fréquence est très faible.

Côté lecture : la première écriture (juste après le scroll initial) sauvegarde la même valeur que celle restaurée, donc l'opération est idempotente. Si la fonction `localStorage` n'est pas accessible (mode privé strict, quota), les helpers retombent silencieusement sur null/no-op.

### Auto-snap pendant 2,5 secondes pour absorber les shifts de layout asynchrones

Les images de couverture (`coverImage` en `Blob` Dexie) chargent de manière asynchrone après le rendu initial : chaque arrivée d'image fait grossir la card concernée, ce qui décale verticalement les sections situées en-dessous (et donc Aujourd'hui qui est en bas). Sans correction, l'utilisateur landait sur Hier au lieu d'Aujourd'hui après un F5.

Le `useLayoutEffect` qui déclenche le scroll initial se ré-exécute donc à **chaque mise à jour de `renderedDays`** (chaque arrivée d'image relance la `liveQuery` Dexie qui pousse une nouvelle valeur), tant que :

- l'utilisateur n'a pas effectué d'interaction (`wheel`, `touchstart` ou `keydown` sur le container scrollable ou le document) ;
- on est dans la fenêtre `AUTO_SCROLL_GRACE_PERIOD_MS = 2500` ms après le mount.

L'horodatage du mount est figé via `useState(() => performance.now())` (lazy init pour rester pure-render au sens de `react-hooks/purity`).

La détection d'interaction utilise `wheel` / `touchstart` / `keydown` plutôt que `scroll` parce que le scroll programmatique déclenche aussi des événements `scroll`, ce qui invaliderait notre propre auto-snap. Ces trois événements proviennent uniquement d'une action humaine.

### Bouton + visible uniquement sur Aujourd'hui

Le bouton `+` flottant au centre du viewport n'est rendu que quand `activeDay === todayKey`. Sur un jour passé, le bouton disparaît. Pour ajouter une entrée, l'utilisateur revient à Aujourd'hui via le bouton « Revenir à aujourd'hui » (ou par scroll), ce qui fait réapparaître le `+`.

Le libellé du popup reste « Nouvelle idée pour aujourd'hui ». `createCustomEntry` et `createEntryFromPreset` continuent d'utiliser `getTodayDateKey()` côté `entryStorage.ts`. Le backfill reste hors scope.

### Layout par section de jour

Chaque section a une hauteur minimale de 80vh. Elle contient :

- un `TimelinePath` SVG en background, indépendant par section ;
- un en-tête :
  - pour Aujourd'hui : le grand H1 « Qu'as-tu appris aujourd'hui ? » iconique ;
  - pour les autres jours : une pastille `slate` avec le label du jour, sans sous-titre.
- la liste des entrées en cards alternées gauche/droite (helper `EntryArticle`) ;
- pour Aujourd'hui sans entrée : un `EmptyState` invitant à ajouter avec un bouton secondaire qui ouvre le composer.

### Chemin SVG continu entre sections

Le `TIMELINE_PATH` est rendu une fois par section dans une SVG en `preserveAspectRatio="none"`. Il est conçu comme une **chaîne de courbes de Bézier C1-continues** dont la tangente au point de départ `(60, 0)` est strictement identique à la tangente au point d'arrivée `(60, 1200)` :

```
M60 0
C20 100 20 200 60 300
C100 400 100 500 60 600
C20 700 20 800 60 900
C100 1000 100 1100 60 1200
```

Chaque segment de 300 unités est un demi-arc bombé alternativement à gauche (`x = 20`) et à droite (`x = 100`). Empiler N sections produit un chemin visuellement continu, sans angle.

## Conséquences

### PROS

- F5 restaure exactement la position de lecture précédente, ou Aujourd'hui par défaut.
- L'auto-snap pendant 2,5s gomme les décalages dus au chargement asynchrone des images de couverture, sans gêner l'utilisateur qui scrolle activement.
- Continuité narrative : l'historique de la semaine est consultable sans changer d'écran.
- Jours vides masqués : la page reste compacte et orientée contenu réel.
- Chemin SVG visuellement continu sur toute la longueur du document.
- Repère visuel (pastilles + bouton de retour) qui suit exactement le jour observé.
- Sémantique d'écriture inchangée : entrée toujours datée du jour réel.
- `+` masqué hors Aujourd'hui : impossible de croire qu'on capture une entrée pour un jour passé.

### CONS

- L'auto-snap dépend de `performance.now()` capturé à l'initialisation via `useState(() => …)`. Si le mount est suivi d'un Suspense ou d'un long délai avant les premières données, la fenêtre de 2,5s peut être consommée avant que les images n'aient eu le temps de charger : le re-snap n'aura pas lieu et l'utilisateur retombera sur la page décalée. À surveiller si l'app évolue.
- `localStorage` peut être inaccessible (mode privé strict) : l'app retombe silencieusement sur Aujourd'hui, sans signal explicite à l'utilisateur.
- Le hook `useActiveDay` connaît implicitement la structure du layout (présence d'un `<main>` scrollable). Si `AppShell` change de container scrollable, il faudra ajuster `findScrollTarget()`.
- L'`ACTIVE_DAY_OFFSET_PX` (160) est calibré sur la hauteur des pastilles fixes ; un changement majeur de ces pastilles peut décaler la détection.
- Pas de virtualisation ni de chargement paresseux : tous les jours non vides sont rendus immédiatement. Acceptable à 7 jours.
- L'ajout d'une entrée nécessite d'être visuellement sur Aujourd'hui ; clic supplémentaire si l'utilisateur est sur un jour passé.

## Documents liés

- ADR `Timeline visuelle Today et navigation drawer` (Ticket 07) — partiellement complété par la présente décision
- ADR `Création des entrées du jour local-first`
- ADR `Miniatures locales et résolution des couvertures d'entrée` — explique l'origine des shifts de layout asynchrones
- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ROADMAP `Tickets MVP` — amélioration sur Ticket 07 livrée pendant le Ticket 08
