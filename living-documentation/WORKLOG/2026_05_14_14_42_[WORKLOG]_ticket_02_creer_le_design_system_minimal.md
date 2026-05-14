---
**date:** 2026-05-14
**status:** Done
**description:** Suivi opérationnel du Ticket 02 pour formaliser le design system minimal, les composants UI réutilisables et l'harmonisation visuelle mobile-first.
**tags:** worklog, ticket-02, design-system, frontend, ui, tailwind, mobile-first
---

# Ticket 02 - Créer le design system minimal

## Statut

Done

## Objectif

Créer une base UI jeune, moderne et cohérente avec des composants réutilisables.

## Scope livré

Inclus :

- formalisation de `Card`, `Button`, `Input`, `Textarea`, `EmojiBadge`, `EmptyState` ;
- harmonisation de `StatusPill` avec le helper de classes ;
- création d'un export central `src/components/ui/index.ts` ;
- création du helper `classNames` dans `src/lib/styles/` ;
- refactor des pages placeholders pour utiliser les composants UI ;
- maintien d'une interface responsive mobile-first ;
- vérification lint, build et routes principales.

Exclus :

- logique métier persistée ;
- IndexedDB / Dexie ;
- vrais formulaires de réglages ;
- thème sombre complet ;
- installation d'une bibliothèque UI externe.

## Progression

- [x] Créer les composants UI manquants
- [x] Définir les styles réutilisables
- [x] Refactorer l'écran Aujourd'hui
- [x] Refactorer les autres pages principales
- [x] Vérifier `npm run lint`
- [x] Vérifier `npm run build`
- [x] Vérifier visuellement desktop et mobile
- [x] Mettre à jour documentation et métadonnées

## Fichiers touchés

- `src/lib/styles/classNames.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/EmojiBadge.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Textarea.tsx`
- `src/components/ui/StatusPill.tsx`
- `src/components/ui/index.ts`
- `src/features/entries/TodayPage.tsx`
- `src/features/entries/CalendarPage.tsx`
- `src/features/reviews/WeekPage.tsx`
- `src/features/insights/InsightsPage.tsx`
- `src/features/settings/SettingsPage.tsx`
- `src/features/onboarding/OnboardingPage.tsx`
- `living-documentation/AI/PROJECT-STACK.md`
- `living-documentation/WORKLOG/current-task.md`

## Vérifications

- `npm run lint` : OK
- `npm run build` : OK
- `curl -I http://localhost:5173/` : OK, serveur utilisateur joignable
- `curl -I http://127.0.0.1:5173/` : KO, le serveur utilisateur n'écoute pas IPv4
- `curl -I http://[::1]:5173/` : OK, serveur utilisateur joignable en IPv6
- Vérification navigateur desktop via `http://[::1]:5173/` : OK
- Vérification DOM mobile `390x844` : OK
- Routes vérifiées directement dans le navigateur : `/`, `/week`, `/calendar`, `/insights`, `/settings`

## Notes de reprise

Le serveur de développement était lancé par l'utilisateur avec `npm run dev`. Dans cet environnement, il répond sur `localhost` / `::1`, mais pas sur `127.0.0.1`. Pour les prochaines vérifications navigateur Codex, utiliser `http://[::1]:5173/` si `http://127.0.0.1:5173/` échoue.

Le prochain ticket recommandé est le Ticket 03 : installer IndexedDB avec Dexie. Il devra introduire le stockage local, les tables MVP, les helpers CRUD et l'export/import JSON complet.