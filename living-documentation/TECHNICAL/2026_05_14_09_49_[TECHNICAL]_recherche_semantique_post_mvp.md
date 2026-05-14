---
**date:** 2026-05-14
**status:** Deferred
**description:** Option post-MVP pour retrouver et regrouper les apprentissages avec des embeddings, explicitement exclue du MVP.
**tags:** technique, embeddings, recherche-semantique, post-mvp, indexeddb, cosine-similarity, llm
---

# Recherche sémantique post-MVP

## Objectif

Permettre de retrouver des apprentissages de manière intelligente, sans dépendre d'un LLM, en utilisant des embeddings.

## Principe

Chaque entrée utilisateur peut être transformée en vecteur numérique.

```text
texte -> embedding (vecteur) -> stockage -> recherche par similarité
```

Cela permet de retrouver des entrées proches sémantiquement même si les mots exacts sont différents.

## Exemples

Recherche :

> base de données pas chère

Résultats possibles :

- SQLite local + R2 ;
- GitHub n'est pas une DB ;
- Cloudflare R2 pour backup.

## Cas d'usage sans LLM

- retrouver des apprentissages similaires ;
- détecter les doublons ;
- regrouper automatiquement des thèmes ;
- proposer des tags ;
- construire une navigation par sujet.

## Cas d'usage avec LLM plus tard

- générer des résumés intelligents ;
- créer un coach d'apprentissage ;
- analyser les patterns utilisateur ;
- proposer des recommandations personnalisées.

## Modèle de données possible

```ts
type LearningEmbedding = {
  entryId: string;
  model: string;
  dimensions: number;
  vector: number[];
  createdAt: string;
};
```

Stockage recommandé :

- IndexedDB via Dexie ;
- ou SQLite WASM si le besoin devient plus avancé.

## Recherche

Implémenter une similarité cosine simple.

```text
similarité(A, B) = cosinus(angle entre vecteurs)
```

Une vector database n'est pas nécessaire pour le MVP ni pour une première version post-MVP personnelle.

## Génération des embeddings

Options envisageables :

1. Local, coût nul : modèle open source calculé dans le navigateur, mais intégration plus complexe.
2. API, coût très faible : génération côté serveur, coût négligeable pour des textes courts.

## Décision MVP

Pour le MVP :

- pas d'embeddings ;
- pas de recherche sémantique ;
- pas de LLM.

Cette capacité doit être introduite uniquement après validation produit.

## Vision long terme

```text
embeddings = mémoire longue durée
LLM = intelligence / interprétation
```

Les embeddings permettent de structurer les données utilisateur pour des usages futurs, sans coût important et sans dépendance forte à un LLM.