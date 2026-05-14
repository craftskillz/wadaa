---
**date:** 2026-05-14
**status:** Accepted
**description:** Le MVP utilise le navigateur et IndexedDB comme source principale de vérité, avec un backend limité au backup/restore de snapshot JSON.
**tags:** adr, local-first, indexeddb, dexie, mvp, backup, r2, cout-faible, architecture
---

# MVP local-first avec IndexedDB comme source principale

## Contexte

Le produit doit être une application personnelle très simple, rapide à ouvrir plusieurs fois par jour, peu coûteuse à héberger et capable de fonctionner sans dépendance serveur forte.

Le coeur du MVP consiste à saisir des apprentissages, les conserver localement, les relire par jour ou par semaine, les curer, puis afficher des statistiques simples.

## Décision

Pendant le MVP, le navigateur est la source principale de vérité.

Les données applicatives sont stockées localement dans IndexedDB, via Dexie lors de l'implémentation du stockage. Le backend n'est pas requis pour utiliser le coeur produit.

Le backend Cloudflare Worker et Cloudflare R2 sont réservés à une capacité de backup/restore manuelle ultérieure :

```text
Browser -> IndexedDB -> export JSON -> Worker -> R2
```

Le Worker ne porte pas la logique métier. Il stocke et restitue un snapshot JSON complet par utilisateur.

## Conséquences

### PROS

- Le produit reste utilisable sans compte et sans serveur métier.
- Les coûts d'hébergement restent très faibles.
- Le développement du coeur produit peut avancer avant l'authentification et le backup cloud.
- Les données sont disponibles immédiatement après refresh via IndexedDB.

### CONS

- Le multi-device temps réel est hors périmètre du MVP.
- La restauration cloud nécessite une action explicite tant que la synchronisation automatique n'existe pas.
- Les migrations de données locales devront être gérées avec soin si le modèle évolue.

## Documents liés

- `PRODUCT / Vision produit et MVP`
- `TECHNICAL / Modèle de données MVP`
- `ROADMAP / Tickets MVP`