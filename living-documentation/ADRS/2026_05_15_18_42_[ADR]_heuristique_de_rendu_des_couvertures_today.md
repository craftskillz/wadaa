---
**date:** 2026-05-15
**status:** Accepted
**description:** Une couverture d'entrée est rendue dans un wrapper aspect-video, avec un object-fit choisi au load selon le ratio source (cover pour ratios 1.2-2.0, contain sinon) et un skeleton animé pendant la résolution asynchrone du blob.
**tags:** adr, today-page, cover-image, object-fit, aspect-ratio, skeleton, animate-pulse, ux

---

# Heuristique de rendu des couvertures Today

## Contexte

L'ADR `Miniatures locales et résolution des couvertures d'entrée` a posé le pipeline de récupération (YouTube → Microlink → favicon) et de stockage local des couvertures. Reste à décider comment ces images, dont les proportions varient énormément, sont rendues dans la card.

Premier essai: `object-cover` universel sur l'`<img>`. Résultat: les vignettes YouTube cadrent parfaitement (les bandes de letterbox internes au JPEG sont croppées, on voit la vidéo seule), mais les wordmarks (ex. logo Arolla, ratio ~3.3) ou les logos carrés sont croppés agressivement et deviennent illisibles.

Deuxième essai: `object-contain` partout. Résultat: logos lisibles, mais YouTube se retrouve avec deux niveaux de letterbox (les bandes noires dans le JPEG + les bandes ajoutées par contain). Visuellement régressif sur le cas le plus fréquent.

Il faut une décision par image et un wrapper qui n'expose pas les quirks d'`aspect-ratio` appliqué directement sur un élément remplacé.

## Décision

### Wrapper aspect-video, image en h-full w-full

Le composant `EntryCoverImage` (`src/features/entries/TodayPage.tsx`) rend systématiquement la structure suivante:

```tsx
<div className="aspect-video w-full overflow-hidden bg-slate-100">
  <img className="block h-full w-full ..." src={previewUrl} onLoad={...} />
</div>
```

Le wrapper applique `aspect-ratio: 16/9` sur un élément block (où la propriété est respectée de façon stable par tous les navigateurs). L'`<img>` fille remplit en `h-full w-full`, ce qui rend l'`object-fit` prévisible. Toutes les cards ont des proportions strictement uniformes.

Appliquer `aspect-video` directement sur l'`<img>` avait été essayé et donnait un comportement non garanti (les éléments remplacés peuvent retomber sur leurs dimensions intrinsèques selon l'agent). Le wrapper est la forme robuste.

### Choix de l'object-fit au load

Au `onLoad` de l'image, on lit `naturalWidth / naturalHeight` et on choisit:

| Ratio source | Mode | Cas typique |
|---|---|---|
| 1.2 ≤ ratio ≤ 2.0 | `object-cover` | YouTube hqdefault (4:3 = 1.33), 16:9 (1.78), OG image standard (1.91) |
| < 1.2 ou > 2.0 | `object-contain` | Logo carré, portrait, wordmark très large (~3) |

Constantes: `COVER_MIN_FILL_RATIO = 1.2`, `COVER_MAX_FILL_RATIO = 2.0`. Choisies pour englober les ratios "photo plausible" et exclure les formats logos. État initial: `cover` pour ne pas flasher. Le ratio est lu sur l'image RÉELLEMENT chargée (donc le blob redimensionné par `resizeImageBlob` si applicable), pas sur la source d'origine. C'est cohérent: c'est ce ratio que l'utilisateur voit.

Décisions intermédiaires écartées:

- Détection d'uniformité des bords par sampling canvas pour distinguer "logo avec whitespace" d'une "vraie photo": fonctionnait correctement pour Arolla mais ajoutait un coût canvas par image et donnait des faux positifs (vidéos sombres). Fenêtre de ratio plus simple, suffisante pour l'usage normal.
- Forcer cover pour toutes les URLs YouTube indépendamment du ratio: pas nécessaire, le ratio 1.33 tombe naturellement dans la fenêtre cover.

### Skeleton de chargement

Quand l'entrée a une URL mais pas encore de `coverImage` blob (résolution Microlink en cours), le composant rend un placeholder animé:

```tsx
<div
  aria-busy="true"
  role="status"
  className="animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100"
>
  <ImageIcon />
</div>
```

C'est le pattern skeleton classique (Notion, Linear, Vercel). Subtil mais clair, sans dépendance externe ni gif. Il disparaît automatiquement quand `entry.coverImage` arrive et que l'`<img>` se substitue par re-render via `liveQuery`.

## Conséquences

### PROS

- Une seule règle de rendu, prévisible pour toutes les images.
- Logos préservés, photos remplies.
- Skeleton fournit un signal de chargement immédiat sans payer le poids d'un asset externe ni gérer un autre format.
- Toutes les cards ont la même hauteur visuelle (16:9) → grille du jour cohérente.
- Pas de coût canvas / pixel-sampling à chaque image.

### CONS

- Heuristique par ratio: une image panoramique réelle (ex. cinéma 21:9 = 2.33) tombera en contain et aura des bandes haut/bas. Cas rare mais à connaître.
- Le `onLoad` ne se déclenche pas si l'image échoue silencieusement → reste en `cover` par défaut, mais ce cas affiche le placeholder de toute façon.
- L'`<img>` doit être chargée pour mesurer son ratio: pas de pré-décision côté serveur ni au stockage.
- Les seuils sont en dur dans le code; un changement de palette d'images cible peut justifier de les retoucher.

## Documents liés

- ADR `Miniatures locales et résolution des couvertures d'entrée`
- ADR `Timeline visuelle Today et navigation drawer`
- ADR `Timeline Today multi-jours scroll-up et day-anchored pills`
- WORKLOG `Bonus 1 — Polish visuel et comportemental de Today`
