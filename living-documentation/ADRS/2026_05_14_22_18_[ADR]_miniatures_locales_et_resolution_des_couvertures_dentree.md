---
**date:** 2026-05-14
**status:** Accepted
**description:** Les couvertures d'entrée sont téléchargées en arrière-plan via YouTube puis Microlink en mode `embed` (image puis logo) puis favicon, redimensionnées, stockées en Blob dans IndexedDB et exclues de l'export JSON.
**tags:** adr, local-first, today-page, cover-image, microlink, microlink-embed, favicon, blob, indexeddb, dexie, export-json, cors

---

# Miniatures locales et résolution des couvertures d'entrée

## Contexte

Le Ticket 07 a introduit une miniature visuelle dans les cards de l'écran Aujourd'hui : quand l'URL d'une entrée est une URL YouTube reconnue, la card affiche `img.youtube.com/vi/<id>/hqdefault.jpg`; sinon elle affiche un placeholder `ImageIcon`.

Le résultat est pauvre pour la majorité des URLs (sites de blog, articles, documentation). L'utilisateur souhaite récupérer une vraie image de prévisualisation, tout en conservant l'esprit local-first du MVP : les données qui s'affichent dans une card doivent rester disponibles après refresh, hors ligne, et sans dépendre d'un service tiers à chaque rendu.

Un appel direct `fetch()` depuis le navigateur vers un site quelconque est généralement bloqué par CORS. La majorité des serveurs d'images publiques (`dexie.org`, `medium.com`, blogs personnels…) ne renvoient pas `Access-Control-Allow-Origin`. Récupérer l'URL `og:image` via Microlink ne suffit donc pas : il faut télécharger l'image elle-même à travers un proxy CORS-friendly.

## Décision

L'écran Aujourd'hui télécharge une image de couverture pour chaque entrée ayant une URL, l'enregistre localement comme `Blob` dans IndexedDB, et l'affiche depuis le stockage local via `URL.createObjectURL`.

### Modèle de données

Le type `LearningEntry` dans `src/lib/db/types.ts` reçoit un champ optionnel `coverImage?: Blob`. Ce champ n'est pas indexé dans le schéma Dexie : il vit à l'intérieur de la valeur stockée. Le schéma Dexie reste en version `1`; aucune migration n'est nécessaire car ajouter un champ non indexé à des objets stockés n'invalide pas les enregistrements existants.

### Stratégie de résolution

La résolution est implémentée dans `src/features/entries/coverImage.ts` et tentée dans l'ordre :

1. **YouTube** — quand l'URL correspond à `youtu.be`, `youtube.com`, `m.youtube.com`, on calcule `https://img.youtube.com/vi/<id>/hqdefault.jpg` et on fetch directement le JPEG (CORS-ouvert sur ce CDN).
2. **Microlink embed `image.url`** — on appelle `https://api.microlink.io/?url=<url>&embed=image.url`. Dans ce mode, Microlink télécharge l'OG image côté serveur, la sert depuis son CDN avec des en-têtes CORS corrects, et le navigateur reçoit directement les octets de l'image. Cela contourne le blocage CORS observé sur les images servies par des sites tiers comme `dexie.org`.
3. **Microlink embed `logo.url`** — si aucune `og:image` n'est trouvée, on retente avec le logo du site (favicon haute résolution), toujours via le même proxy.
4. **Favicon DuckDuckGo** — fallback ultime vers `https://icons.duckduckgo.com/ip3/size/128/<hostname>.ico`, qui sert toujours une icône même si elle n'est pas représentative du contenu.

Si toutes les étapes échouent, l'entrée garde `coverImage = undefined` et la card affiche le placeholder existant.

Le passage par le mode `embed` de Microlink est ce qui rend la stratégie réellement utilisable : sans lui, on récupère bien l'URL de l'OG image mais on ne peut pas la télécharger depuis le navigateur à cause des règles CORS du site cible.

### Redimensionnement

Avant stockage, l'image est rendue dans un canvas off-screen, redimensionnée pour respecter une largeur maximale (`COVER_IMAGE_MAX_WIDTH = 720px`), puis sérialisée en JPEG qualité `0.8` via `canvas.toBlob`. Cela maintient la taille de la base IndexedDB raisonnable même avec plusieurs centaines d'entrées.

### Cycle de vie

La résolution est déclenchée **en arrière-plan après création** : `createEntryFromPreset` et `createCustomEntry` créent immédiatement l'entrée sans couverture, puis `useTodayData` (via `liveQuery` Dexie) réaffiche la card. En parallèle, `entryStorage.ts` appelle `resolveAndStoreCoverImage(entryId, url)` en fire-and-forget qui, en cas de succès, fait un `entriesRepository.put` avec le `Blob`. La card se met alors à jour automatiquement grâce à Dexie `liveQuery`.

Le rendu prend en compte trois cas dans `EntryCoverImage` (`TodayPage.tsx`) : `coverImage` présent → `<img src={objectUrl}>` ; sinon URL YouTube reconnue → `<img src={hqdefault}>` (même comportement qu'avant) ; sinon placeholder.

### Export et import JSON

Un `Blob` n'est pas sérialisable en JSON. Plutôt qu'embarquer du base64 dans l'export, l'export local strippe le champ `coverImage` lors de la sérialisation : voir `exportLocalData` dans `src/lib/db/localData.ts`. Les couvertures restent donc un **cache local reconstructible** : après import sur un autre appareil ou après reset, l'utilisateur retrouve ses entrées sans images, et les images se reconstruiront lors d'un futur ajout ou d'une action manuelle. Aucun travail de reconstruction automatique n'est planifié dans cette décision.

Côté validation (`parseLocalDataExport`), le champ `coverImage` n'apparaît pas dans le schéma version 1 et n'est donc pas attendu à l'import; l'import ignore ce champ de toute façon car l'export ne le produit pas.

### Migration des entrées existantes

Aucune résolution rétroactive n'est planifiée. Les entrées créées avant le déploiement de cette décision conservent leur rendu actuel (miniature YouTube si applicable, sinon placeholder). La récupération éventuelle de couvertures pour ces entrées sera traitée séparément si elle devient utile.

## Conséquences

### PROS

- Une vraie image de prévisualisation s'affiche pour la plupart des URLs grâce à `og:image`, y compris quand le site cible bloque les requêtes CORS sur ses images.
- Les couvertures sont disponibles hors ligne après le premier rendu et survivent au refresh.
- Microlink peut être remplacé plus tard par un endpoint du Worker Cloudflare (Ticket 12+) sans changer le code appelant : il suffira de modifier l'URL de l'API et le format du paramètre `embed` dans `coverImage.ts`.
- L'export JSON reste léger et le format de schéma version 1 reste inchangé.
- Le rendu existant pour les URLs YouTube continue de fonctionner sans appel réseau supplémentaire si la résolution de fond n'a pas encore terminé.

### CONS

- Une dépendance externe (Microlink) est introduite côté client : les URLs des utilisateurs sont envoyées à un service tiers le temps que l'app reste en MVP. À remplacer par un Worker propre dès le Ticket 12.
- Le mode `embed` de Microlink consomme deux requêtes par entrée non-YouTube dans le pire cas (image puis logo). Le quota gratuit de 50 requêtes/jour peut être atteint rapidement par un utilisateur régulier.
- Les couvertures ne survivent pas à un import sur un autre appareil tant qu'aucune re-résolution n'est planifiée.
- La résolution réseau peut échouer silencieusement et la card reste avec un placeholder, sans signal explicite à l'utilisateur.
- IndexedDB consomme plus d'espace ; le redimensionnement JPEG est obligatoire pour rester raisonnable.

## Documents liés

- ADR `MVP local-first avec IndexedDB comme source principale`
- ADR `Schema Dexie v1 et snapshot JSON local`
- ADR `Création des entrées du jour local-first`
- ADR `Timeline visuelle Today et navigation drawer`
- ROADMAP `Tickets MVP` — Ticket 07 (amélioration) et Ticket 12 (Worker R2, futur remplaçant de Microlink)
