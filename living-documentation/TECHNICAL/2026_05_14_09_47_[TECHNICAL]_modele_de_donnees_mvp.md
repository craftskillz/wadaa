---
**date:** 2026-05-14
**status:** Draft
**description:** Modèle de données local-first du MVP, stocké dans IndexedDB via Dexie et compatible avec export/import JSON complet.
**tags:** technique, donnees, indexeddb, dexie, local-first, entries, presets, weekly-reviews, settings, export-json
---

# Modèle de données MVP

## Principe central

Le navigateur est la source principale de vérité pendant le MVP.

```text
Browser
  └── IndexedDB
        ├── learning entries
        ├── presets
        ├── weekly reviews
        └── user settings

Cloudflare Worker
  └── API backup/restore

Cloudflare R2
  └── users/{userId}/backup.json
```

Le backend ne porte pas la logique métier du MVP. Il sert uniquement au backup et à la restauration d'un snapshot JSON complet quand cette capacité sera ajoutée.

## Implémentation actuelle

Le Ticket 03 implémente le stockage local dans `src/lib/db/` :

- `types.ts` contient les types `UserSettings`, `LearningEntry`, `LearningPreset`, `WeeklyReview` et le format d'export `LocalDataExport` ;
- `database.ts` crée la base Dexie `what-did-you-learn-today` en version 1 ;
- `repositories.ts` expose les helpers CRUD par table ;
- `validation.ts` valide minimalement les snapshots JSON avant import ;
- `localData.ts` exporte, importe et résume les données locales.

Le Ticket 05 ajoute la création des entrées du jour dans `src/features/entries/` :

- `entryStorage.ts` crée les entrées `preset`, `custom` et `empty` ;
- `useTodayData.ts` lit en live les presets actifs et les entrées de la date locale du jour ;
- `TodayPage.tsx` affiche les choix rapides, le champ libre, les entrées du jour et la suppression.

Le schéma Dexie indexe uniquement des clés IndexedDB sûres : chaînes et nombres. Les booléens comme `kept`, `discarded` et `archived` restent stockés dans les objets, mais ne sont pas indexés.

## UserSettings

```ts
type UserSettings = {
  id: "local";
  userId?: string;
  displayName?: string;
  reminderTimes: string[]; // ex: ["09:00", "14:00", "20:00"]
  weekStartsOn: "monday" | "sunday";
  createdAt: string;
  updatedAt: string;
};
```

Rôle : stocker les préférences locales et, plus tard, l'identité utilisée pour isoler le backup cloud.

## LearningEntry

```ts
type LearningEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  source: "preset" | "custom" | "empty";
  presetId?: string;
  mood?: "low" | "neutral" | "high";
  rating?: 1 | 2 | 3 | 4 | 5;
  kept: boolean;
  discarded: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Rôle : représenter une réponse de l'utilisateur pour un jour donné.

Règles actuelles :

- une entrée `preset` référence un `presetId` et son `content` reprend le label du preset au moment de la saisie ;
- une entrée `custom` reprend le texte libre trimé ;
- une entrée `empty` représente `Rien pour le moment` ;
- les nouvelles entrées commencent avec `kept: false` et `discarded: false` ;
- les insights principaux ignorent les entrées `discarded` ;
- le score quotidien MVP utilise les ratings des entrées gardées.

## LearningPreset

```ts
type LearningPreset = {
  id: string;
  label: string;
  emoji?: string;
  usageCount: number;
  createdFromEntryId?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Rôle : fournir les choix rapides de l'écran Aujourd'hui.

Règles actuelles :

- les presets archivés ne sont plus proposés dans les choix rapides ;
- le preset `Je n'ai rien appris pour le moment` est masqué sur Aujourd'hui au profit d'une action dédiée `Rien pour le moment` ;
- cliquer sur un preset incrémente `usageCount` dans la même transaction que la création d'entrée ;
- une réponse libre peut créer un preset avec `createdFromEntryId` au Ticket 06 ;
- les doublons simples doivent être évités avant création.

## WeeklyReview

```ts
type WeeklyReview = {
  id: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  selectedEntryIds: string[];
  discardedEntryIds: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
};
```

Rôle : capturer le résultat de la curation hebdomadaire.

Règles attendues :

- une revue hebdomadaire référence les entrées gardées et jetées ;
- les entrées jetées ne doivent pas compter dans les insights principaux ;
- le résumé est optionnel dans le MVP.

## Export/import JSON complet

Le stockage local fournit :

- un export complet des settings, entries, presets et weeklyReviews ;
- un import complet capable de restaurer cet état ;
- une validation minimale avant import ;
- une confirmation utilisateur avant restauration destructive dans l'interface Settings.

Le format d'export courant est :

```ts
type LocalDataExport = {
  schemaVersion: 1;
  exportedAt: string;
  data: {
    entries: LearningEntry[];
    presets: LearningPreset[];
    weeklyReviews: WeeklyReview[];
    settings: UserSettings[];
  };
};
```

## Backup cloud prévu

API attendue après le coeur local-first :

```text
GET /api/backup
PUT /api/backup
```

Stockage R2 prévu :

```text
users/{userId}/backup.json
```

Le Worker ne connaît pas la logique métier. Il stocke et restitue un snapshot JSON complet.