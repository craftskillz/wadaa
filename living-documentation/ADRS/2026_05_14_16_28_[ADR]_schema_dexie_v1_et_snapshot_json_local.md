---
**date:** 2026-05-14
**status:** Accepted
**description:** Le stockage local MVP utilise un schéma Dexie v1 aligné sur les modèles métier et un snapshot JSON versionné pour export/import complet.
**tags:** adr, dexie, indexeddb, schema-v1, export-json, import-json, local-first, storage, validation
---

# Schéma Dexie v1 et snapshot JSON local

## Contexte

Le MVP est local-first : le navigateur reste la source principale de vérité et le backend n'est pas requis pour utiliser le coeur produit.

Les ADR existants définissent le choix IndexedDB/Dexie et la stack frontend. Le Ticket 03 rend ce choix concret en créant le premier contrat de stockage local et le format de backup local manipulé par l'application.

## Décision

Créer une base Dexie nommée `what-did-you-learn-today` en version 1 avec quatre tables :

- `entries` pour les `LearningEntry` ;
- `presets` pour les `LearningPreset` ;
- `weeklyReviews` pour les `WeeklyReview` ;
- `settings` pour les `UserSettings`.

Exposer les types métier dans `src/lib/db/types.ts`, la base dans `src/lib/db/database.ts`, les helpers CRUD dans `src/lib/db/repositories.ts`, puis les fonctions d'export/import complet dans `src/lib/db/localData.ts`.

Le format d'export est un snapshot JSON versionné :

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

L'import valide minimalement la structure avant restauration et remplace le contenu local dans une transaction Dexie.

Le schéma Dexie n'indexe pas les booléens (`kept`, `discarded`, `archived`) car ce ne sont pas des clés IndexedDB sûres. Ces champs restent stockés dans les objets et seront filtrés côté requête tant qu'un besoin de performance ne justifie pas un index dérivé.

## Conséquences

### PROS

- Les tickets suivants peuvent s'appuyer sur une couche locale stable et typée.
- L'export/import JSON complet existe avant le backup R2, ce qui garde le coeur MVP indépendant du serveur.
- Le champ `schemaVersion` prépare les migrations futures du format de snapshot.
- L'absence d'index booléen évite une hypothèse IndexedDB fragile.

### CONS

- Les filtres sur `kept`, `discarded` et `archived` se feront d'abord côté application.
- Les migrations Dexie et les migrations de snapshots JSON devront être ajoutées explicitement si les modèles évoluent.
- L'import est destructif par design et doit rester protégé par une confirmation utilisateur.

## Documents liés

- ADR `MVP local-first avec IndexedDB comme source principale`
- ADR `Stack frontend cible React TypeScript Vite Tailwind Dexie`
- `TECHNICAL / Modèle de données MVP`
- `WORKLOG / Ticket 03 Installer IndexedDB avec Dexie`