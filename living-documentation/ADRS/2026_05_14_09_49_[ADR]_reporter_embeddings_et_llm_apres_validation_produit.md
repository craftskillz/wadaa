---
**date:** 2026-05-14
**status:** Accepted
**description:** Les embeddings, la recherche sémantique et les usages LLM sont explicitement exclus du MVP afin de valider d'abord le coeur local-first.
**tags:** adr, embeddings, llm, recherche-semantique, post-mvp, scope, mvp, simplicite
---

# Reporter embeddings et LLM après validation produit

## Contexte

La recherche sémantique peut apporter de la valeur à long terme : retrouver des apprentissages similaires, détecter les doublons, regrouper les thèmes, proposer des tags, puis alimenter des usages LLM.

Mais le risque principal du démarrage est de complexifier le projet avant d'avoir validé le comportement coeur : saisir, relire, curer et visualiser les apprentissages.

## Décision

Le MVP n'intègre pas :

- embeddings ;
- recherche sémantique ;
- moteur IA ;
- LLM ;
- vector database.

Ces capacités sont documentées comme option post-MVP. Elles pourront être introduites après validation produit, idéalement en commençant par un stockage local d'embeddings dans IndexedDB ou SQLite WASM et une similarité cosine simple.

## Conséquences

### PROS

- Le MVP reste centré sur l'usage quotidien et la rapidité de saisie.
- Les coûts, dépendances et questions de confidentialité restent limités au démarrage.
- Les tickets initiaux peuvent livrer une valeur visuelle et testable sans infrastructure IA.

### CONS

- La recherche avancée et les regroupements automatiques ne seront pas disponibles au lancement.
- Les modèles de données devront peut-être évoluer plus tard pour stocker des embeddings.
- Une future intégration LLM nécessitera une décision séparée sur le coût, la confidentialité et l'expérience utilisateur.

## Documents liés

- `TECHNICAL / Recherche sémantique post-MVP`
- `PRODUCT / Vision produit et MVP`
- `ROADMAP / Tickets MVP`