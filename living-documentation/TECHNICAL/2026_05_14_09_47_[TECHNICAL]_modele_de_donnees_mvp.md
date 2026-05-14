---
**date:** 2026-05-14
**status:** Draft
**description:** Modèle de données local-first du MVP, destiné au stockage IndexedDB via Dexie et aux exports/imports JSON.
**tags:** technique, donnees, indexeddb, dexie, local-first, entries, presets, weekly-reviews, settings
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

Règles attendues :

- une entrée `preset` référence idéalement un `presetId` ;
- une entrée `custom` peut devenir un preset ;
- une entrée `empty` représente `Rien pour le moment` ;
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

Règles attendues :

- les presets archivés ne sont plus proposés dans les choix rapides ;
- une réponse libre peut créer un preset avec `createdFromEntryId` ;
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

Le stockage local doit fournir :

- un export complet des settings, entries, presets et weeklyReviews ;
- un import complet capable de restaurer cet état ;
- une validation minimale avant import ;
- une confirmation utilisateur avant restauration destructive.

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