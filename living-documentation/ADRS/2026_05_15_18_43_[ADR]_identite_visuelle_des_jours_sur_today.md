---
**date:** 2026-05-15
**status:** To be validated
**description:** Chaque jour rendu reçoit un fond pastel pleine largeur avec deux gradients radiaux diagonaux, un mask vertical pour fondre dans le suivant via le fond AppShell, un thème assigné par position rendue (today reçoit le premier, on remonte le passé), et la pastille du haut sync sa couleur avec le jour actif.
**tags:** adr, today-page, design, day-themes, gradients, vertical-fade, alternance, ux, aurora, scroll-to-entry

---

# Identité visuelle des jours sur Today

## Contexte

L'ADR `Timeline Today multi-jours scroll-up et day-anchored pills` a établi le rendu sur 7 jours. Visuellement les jours étaient interchangeables: même fond beige, séparés au mieux par une pastille slate avec le label du jour. Pour un site qui se veut joyeux et "cool", chaque jour devait gagner une identité chromatique propre, sans tomber dans le carnaval.

Plusieurs essais successifs:

1. Pastille `Hier / Mardi 13 mai` au-dessus de chaque section: utile mais visuellement pauvre, et fait doublon avec la pastille fixe en haut du viewport.
2. Séparateurs en pointillés `─── Hier ───`: trop discret, presque invisible.
3. Fonds pastel par jour avec mapping date → couleur: bug de "trous chromatiques" quand des jours sont vides (Mar/Mer/Jeu vides → jump direct Mon=Sunset → Ven=Sky qui sont non-adjacents dans le rainbow).

Le bon registre est: traiter chaque journée comme une scène colorée, en garantissant la continuité chromatique d'une scène à l'autre.

## Décision

### Sept thèmes pastel cycliques

Une palette de 7 thèmes (Sage, Sunset, Sunrise, Blossom, Lavender, Sky, Mint) ordonnée en arc-en-ciel cyclique vert → orange → rose → violet → bleu → vert. Chaque thème expose:

```ts
type DayTheme = {
  primaryColor: string;   // rgba pour le blob principal
  secondaryColor: string; // rgba pour le blob secondaire
  pill: { background, color, ring }; // assortiment pour la pastille du haut
};
```

### Composition unifiée, direction alternée

Tous les fonds utilisent la même structure visuelle: deux blobs radiaux placés en diagonale opposée. Le primaire en haut (offset y=28%), le secondaire en bas (offset y=75%). Cette composition vient du thème "rose" qui plaisait visuellement.

```css
radial-gradient(at 22% 28%, primary, transparent 55%),
radial-gradient(at 78% 75%, secondary, transparent 60%)
```

La direction alterne entre `leftToRight` (TL+BR) et `rightToLeft` (TR+BL) selon la parité de l'index du jour dans `renderedDays`. Couplé à l'alternance gauche/droite des cards, l'ensemble produit un effet de vague descendante.

### Mapping par position rendue, pas par date

Comme on n'affiche pas les jours vides, le mapping date → thème laissait des trous chromatiques. La règle adoptée: mapping par position dans `renderedDays`, en partant d'aujourd'hui et en remontant le passé.

- Today (index `length - 1`) → `DAY_THEMES[0]` (Sage)
- Le rendu juste précédent → `DAY_THEMES[1]` (Sunset)
- Et ainsi de suite, modulo 7

Deux jours rendus consécutifs sont donc toujours sur des thèmes adjacents dans le rainbow, peu importe combien de jours vides ont été zappés. La continuité visuelle est garantie. La pastille du haut suit le même mapping pour rester cohérente.

Conséquence à connaître: si l'utilisateur ajoute une entrée à un ancien jour vide, sa couleur se cale à sa nouvelle position rendue et les jours plus anciens se décalent d'un cran. Acceptable, l'utilisateur le voit en temps réel.

### Fondu vertical entre jours

Le fond n'est pas peint sur la `<section>` directement mais sur une div absolue interne (`pointer-events-none absolute inset-0`) qui porte un mask vertical:

```css
mask-image: linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%);
```

Les 18% du haut et du bas s'estompent en transparent, laissant passer le fond pastel d'`AppShell`. Du coup la transition entre deux sections passe par une zone neutre commune et donne l'impression d'un fondu enchaîné, plus aucune cassure visuelle. `WebkitMaskImage` est aussi spécifié pour Safari.

### Pleine largeur viewport

Le wrapper outer du composant `TodayPage` casse la padding du `<main>` d'`AppShell` via `-mx-4 sm:-mx-6 lg:-mx-8`. Les sections de jour vont donc bord à bord du viewport (la couleur s'étend au-delà de la zone des cards). Les contenus à l'intérieur (cards, H1 d'Aujourd'hui) restent centrés via `mx-auto max-w-5xl` ou `max-w-2xl`.

### Pastille active synchronisée

La pastille fixe en haut du viewport qui indique le jour actif (`Aujourd'hui` / `Hier` / `Mardi 13 mai`) prend les couleurs `{ background, color, ring }` du thème du jour actif via styles inline. Une transition CSS de 300ms anime le changement de couleur quand l'utilisateur scrolle d'un jour à l'autre. Couleur neutre slate de fallback si aucun jour actif détecté.

### Alternance L/R des cards continue entre jours

Avant: l'alternance gauche/droite des cards repartait à 0 à chaque jour, ce qui faisait que la première card de chaque journée était à gauche. Après: on passe un `startIndex` cumulé à chaque section (somme des entrées des jours précédents) et chaque card calcule son côté avec `(startIndex + index) % 2 === 0`. La zigzag reste donc continue, indépendamment des frontières de jours et des nombres d'entrées par jour.

### Scroll smooth vers la nouvelle entrée

Après une création réussie, on stocke l'`id` retourné par `createCustomEntry` ou `createEntryFromPreset` dans une ref (`pendingScrollEntryIdRef`). Un `useLayoutEffect` sur `renderedDays` détecte le re-render avec la nouvelle entrée dans le DOM et appelle `scrollIntoView({ block: "nearest", behavior: "smooth" })` sur l'élément `[data-entry-id="..."]`. Le `block: "nearest"` ne scrolle que si l'entrée n'est pas déjà visible, donc l'animation reste pertinente sans être agressive. Le scroll initial vers la H1 d'Aujourd'hui après ajout (qui existait par héritage du design avant que le `+` soit masqué hors today) est supprimé.

## Conséquences

### PROS

- Identité visuelle distinctive sans tomber dans le bruit.
- Continuité chromatique garantie même en présence de jours vides.
- Fondu vertical et fond AppShell partagé créent l'illusion d'un seul long parchemin coloré.
- Alternance des cards et direction des gradients se renforcent en effet wave.
- Pastille du haut suit le jour actif et donne un repère couleur sans textuel additionnel sur la timeline.
- Pleine largeur viewport amplifie l'effet design.
- Scroll smooth après ajout est non agressif (nearest, donc pas de saut si déjà visible).

### CONS

- Si l'utilisateur ajoute des entrées dans un jour anciennement vide, les couleurs des jours plus anciens se décalent d'un cran (visible en live, c'est la conséquence de la règle "par position").
- 7 thèmes en dur dans le code: ajouter un thème oblige à recompter le cycle.
- Inline-styles pour les gradients et la pastille active: pas purgeable par Tailwind, mais le coût HTML reste négligeable.
- Le mask-image dépend de `WebkitMaskImage` pour Safari (déjà inclus). Le support du `mask-image` standard reste large mais à surveiller.

## Documents liés

- ADR `Timeline Today multi-jours scroll-up et day-anchored pills`
- ADR `Heuristique de rendu des couvertures Today`
- ADR `Timeline visuelle Today et navigation drawer`
- WORKLOG `Bonus 1 — Polish visuel et comportemental de Today`
