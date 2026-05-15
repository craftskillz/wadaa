---
**date:** 2026-05-15
**status:** To Be Validated
**description:** Bonus post-Ticket 08 — finalisation visuelle et comportementale de la timeline Today. Heuristique d'object-fit, skeleton de chargement, fonds pastel par jour, fondu vertical entre jours, alternance L/R continue des cards, scroll smooth vers nouvelle entrée.
**tags:** worklog, bonus, today-page, polish, cover-image, day-themes, gradients, scroll, ux

---

# Bonus 1 — Polish visuel et comportemental de Today

## Contexte

Bonus rangé hors backlog initial. Après le Ticket 08 (Revue hebdomadaire) et l'ADR `Timeline Today multi-jours scroll-up et day-anchored pills`, plusieurs itérations courtes en pair-programming ont donné du caractère et du soin à l'écran Aujourd'hui. Aucun ticket roadmap correspondant — ces ajustements relèvent de la finition produit, marqués "bonus" pour rester traçables sans polluer la numérotation.

## Réalisation

### Cover image — rendu

- Wrapper `aspect-video w-full overflow-hidden bg-slate-100` autour de l'`<img>` au lieu de l'aspect appliqué sur l'élément remplacé directement (qui retombait sur les dimensions intrinsèques).
- `object-fit` choisi au `onLoad` selon le ratio source: `cover` si `1.2 ≤ ratio ≤ 2.0` (photos plausibles, vignettes YouTube 4:3, OG images standard), `contain` sinon (logos carrés, wordmarks larges, portraits).
- État initial `cover` pour ne pas flasher.
- Voir l'ADR `Heuristique de rendu des couvertures Today` pour le détail.

### Cover image — chargement

- Placeholder animé (`animate-pulse` + gradient slate) pendant que la couverture se résout en arrière-plan via Microlink.
- `aria-busy="true"` + `role="status"` pour l'accessibilité.
- Disparait automatiquement quand `entry.coverImage` arrive et que l'`<img>` se substitue.

### Identité visuelle des jours

- 7 thèmes pastel cycliques (Sage, Sunset, Sunrise, Blossom, Lavender, Sky, Mint) avec composition unifiée: deux blobs radiaux en diagonale.
- Direction alternée (`leftToRight` / `rightToLeft`) entre jours rendus consécutifs, renforce l'effet wave avec l'alternance L/R des cards.
- Mapping thème → jour basé sur la position dans `renderedDays` (today reçoit thème 0, on remonte le passé), pas par date — ce qui garantit la continuité chromatique malgré les jours vides masqués.
- Mask vertical (transparent → opaque → transparent, 18% / 82%) sur le fond de chaque section pour fondre dans la couleur du jour suivant via le fond AppShell.
- Wrapper outer en pleine largeur viewport via marges négatives `-mx-4 sm:-mx-6 lg:-mx-8`, pour étendre les fonds bord à bord.
- Voir l'ADR `Identité visuelle des jours sur Today` pour le détail.

### Pastille active synchronisée

- La pastille fixe en haut du viewport qui indique le jour actif (`Aujourd'hui` / `Hier` / `Mardi 13 mai`) prend les couleurs du thème correspondant via styles inline.
- Transition CSS de 300ms quand l'utilisateur scrolle d'un jour à l'autre.
- Couleur neutre slate de fallback si aucun jour actif détecté.

### Alternance L/R des cards continue

- Avant: chaque jour repartait à zéro, première card toujours à gauche.
- Après: `dayStartIndices` cumulé pré-calculé dans un `useMemo`, passé à chaque `DaySection`. Chaque card calcule son côté avec `(startIndex + index) % 2 === 0`. La zigzag est strictement continue d'un jour à l'autre.

### Scroll smooth vers nouvelle entrée

- `createCustomEntry`, `createEntryFromPreset`, `createEmptyEntry` retournent désormais l'`id` créé.
- `data-entry-id={entry.id}` sur chaque article.
- `pendingScrollEntryIdRef` mémorise la cible après ajout, `useLayoutEffect([renderedDays])` déclenche `scrollIntoView({ block: "nearest", behavior: "smooth" })` quand la nouvelle entrée arrive dans le DOM.
- Comportement non agressif: si l'entrée est déjà visible, aucun scroll.
- Suppression de l'ancien `scrollToToday()` après ajout (héritage du temps où le `+` était visible sur les jours passés).

## Choix retenus

Voir les deux ADR créés pour les décisions durables. Choix d'implémentation locaux à la page:

- Pré-calcul des `dayStartIndices` et `dayThemesByDateKey` via `useMemo` pour éviter mutation pendant render (règle React 19 `react-hooks/immutability`).
- Détection d'interaction utilisateur via `wheel` / `touchstart` / `keydown` (en `{ once: true }`) plutôt que `scroll` pour ne pas être déclenchée par les scroll programmatiques.
- Heuristique cover/contain par fenêtre de ratio plutôt que par sampling canvas des bords (testée et écartée pour son coût et ses faux positifs sur vidéos sombres).

## Vérifications

- `npm run lint` : OK à chaque itération.
- `npm run build` : OK à chaque itération.
- Vérifications visuelles utilisateur sur navigateur réel.
- MCP Living Documentation utilisé pour créer les deux ADR et le présent WORKLOG.

## Suites éventuelles

- Le Ticket 09 `Correctifs divers` (édition d'image dans une card) prend la suite naturelle.
- Le Ticket 19 `Chemin SVG` pourra revoir le tracé du chemin sinusoïdal si besoin.
- Possibilité d'extraire les constantes de thème dans un fichier dédié si la palette grossit (mais inutile à 7 thèmes).

## Documents liés

- ADR `Heuristique de rendu des couvertures Today`
- ADR `Identité visuelle des jours sur Today`
- ADR `Timeline Today multi-jours scroll-up et day-anchored pills`
- ADR `Miniatures locales et résolution des couvertures d'entrée`
- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ROADMAP `Tickets MVP`
