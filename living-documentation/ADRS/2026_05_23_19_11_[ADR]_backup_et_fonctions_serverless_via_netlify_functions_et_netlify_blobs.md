---
**date:** 2026-05-23
**status:** To be validated
**description:** Le backup cloud et toutes les fonctions serverless du MVP utilisent Netlify Functions + Netlify Blobs, alignés sur le déploiement Netlify existant, en remplacement de la cible initiale Cloudflare Workers + R2.
**tags:** backup, serverless, netlify, netlify-functions, netlify-blobs, hosting, cout, deploiement
---

# Backup et fonctions serverless via Netlify Functions et Netlify Blobs

## Contexte

Les ADR initiaux mentionnaient Cloudflare Workers + R2 comme cible serverless du MVP (`MVP local-first avec IndexedDB comme source principale`, `Stack frontend cible React TypeScript Vite Tailwind Dexie`). Or le projet est déjà déployé sur Netlify côté frontend statique, et Cloudflare Workers est un runtime propriétaire qui ne s'exécute pas dans l'écosystème Netlify.

Maintenir deux providers (frontend sur Netlify + Worker sur Cloudflare) ajouterait :

- deux pipelines CI/CD à maintenir ;
- une configuration CORS dédiée côté Worker pour accepter le domaine Netlify ;
- deux dashboards de quotas et de facturation à surveiller ;
- une procédure de déploiement non-atomique entre frontend et backend.

La fonctionnalité visée (Tickets 14-15) est volontairement minimale : un endpoint qui reçoit ou renvoie un snapshot JSON par utilisateur. Aucun besoin propriétaire de l'écosystème Cloudflare (edge globale, durable objects, KV) n'est requis pour le MVP.

## Décision

Toutes les fonctions serverless et tout le stockage cloud du MVP passent par Netlify :

- **Frontend** : reste déployé en site statique Netlify (Vite build → `dist/` publié).
- **API backup** : une Netlify Function HTTP (`netlify/functions/backup.ts` ou via le dossier `netlify/edge-functions/` selon les besoins de latence) expose les routes :

  ```text
  GET  /api/backup     -> renvoie le snapshot JSON du user, ou 404
  PUT  /api/backup     -> reçoit un snapshot JSON, le valide, le stocke
  ```

  Le mapping route → fonction passe par les redirects Netlify dans `netlify.toml` ou par les conventions de routing des Functions.

- **Stockage** : un store **Netlify Blobs** dédié (par exemple nommé `user-backups`) tient un blob par utilisateur, clé `users/{userId}/backup.json`. La Function lit/écrit via le SDK `@netlify/blobs`.

- **Authentification** : tant que Google OAuth n'est pas livré (Ticket 16), `userId = "local"` est utilisé comme placeholder. Le Ticket 16 introduira l'identifiant Google `sub` comme `userId` stable, sans changer le schéma de stockage.

- **Validation** : la Function réutilise `parseLocalDataExport` du frontend (déplacé dans un module partagé `src/lib/db/validation.ts` déjà existant et compilable côté Function via TypeScript). Tout payload non conforme reçoit `400` avec un message court.

- **Notifications Web Push (Ticket 18)** : la subscription est également stockée via Netlify Blobs (`users/{userId}/push-subscription.json`) ; l'envoi des notifications est une Netlify Scheduled Function ou un trigger manuel pour le MVP.

## Conséquences

### PROS

- Un seul provider à gérer (compte, facturation, secrets, déploiement, logs).
- Le déploiement est atomique : un `git push` rebuild le frontend et redéploie les Functions ensemble.
- Coûts négligeables pour l'usage MVP (mono-utilisateur ou très petit nombre d'utilisateurs) : tout reste dans le free tier Netlify (125 000 invocations Functions, ~100 GB Blobs, ~1 M opérations Blobs par mois selon l'état tarifaire vérifié en mai 2026).
- La Function partage le runtime Node.js avec le code frontend pour la validation JSON, ce qui évite de dupliquer `parseLocalDataExport`.
- Le projet reste portable : si Netlify devient inadapté, basculer vers une autre cible serverless (Vercel Functions, Cloudflare Workers, etc.) reste possible parce que la logique métier dans la Function est triviale.

### CONS

- Netlify Functions a une latence cold-start typique de quelques centaines de ms ; acceptable pour un backup manuel mais à surveiller si on ajoute des opérations sensibles.
- Les Blobs Netlify n'offrent pas la même couverture globale que Cloudflare R2 ; non pertinent pour un MVP local-first.
- Les tarifs Netlify peuvent évoluer ; à recontrôler avant tout passage en production multi-user.
- Cette décision rend obsolètes les mentions « Cloudflare Worker » et « Cloudflare R2 » dans les ADR antérieurs et dans la ROADMAP ; ces documents sont mis à jour dans la même tâche.

## Documents liés

- ADR `MVP local-first avec IndexedDB comme source principale` (mis à jour pour pointer vers cette décision)
- ADR `Stack frontend cible React TypeScript Vite Tailwind Dexie` (mis à jour pour pointer vers cette décision)
- ADR `Schema dexie v1 et snapshot json local`
- ROADMAP `Tickets MVP` (Tickets 14, 15, 18 reformulés)
