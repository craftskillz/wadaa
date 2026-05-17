---
**date:** 2026-05-14
**status:** Accepted
**description:** La stack frontend MVP combine React, TypeScript, Vite, Tailwind CSS, Dexie et des composants/SVG React maison pour livrer une app locale moderne et légère.
**tags:** adr, react, typescript, vite, tailwind, dexie, svg-chart, frontend, mvp
---

# Stack frontend cible React TypeScript Vite Tailwind Dexie

## Contexte

Le MVP doit être une application web personnelle, moderne, mobile-first, rapide à développer et simple à héberger. Le dépôt ne contient pas encore de code applicatif au moment de cette décision.

Le premier ticket doit créer une base frontend typée et prête à évoluer, sans introduire de backend obligatoire.

Au moment du Ticket 11, la cible Recharts initialement envisagée pour les courbes d'apprentissage a été révisée : la dépendance n'est pas installée dans `package.json`, et les courbes MVP sont assez simples pour être rendues en SVG React maison sans alourdir la stack.

## Décision

La stack frontend cible du MVP est :

- React pour l'interface ;
- TypeScript pour les contrats de données et la maintenabilité ;
- Vite pour le développement local et le build ;
- Tailwind CSS pour une UI mobile-first rapide à construire ;
- composants maison inspirés shadcn/ui plutôt qu'une dépendance UI lourde imposée dès le départ ;
- SVG React maison pour les courbes d'apprentissage MVP ;
- Dexie pour IndexedDB ;
- Cloudflare Pages ou Workers avec assets statiques pour le déploiement cible.

Cette décision devient concrète lors du Ticket 01. Tant que le code n'est pas créé, `PROJECT-STACK.md` doit distinguer la stack cible de la stack réellement installée.

Le choix SVG pour les courbes est documenté plus précisément par l'ADR `Courbe Insights locale en SVG sans dépendance chart`. Une librairie chart peut être réévaluée plus tard si les besoins analytiques deviennent interactifs ou plus complexes.

## Conséquences

### PROS

- La stack est cohérente avec une application SPA locale et mobile-first.
- TypeScript rend les modèles `LearningEntry`, `LearningPreset`, `WeeklyReview` et `UserSettings` explicites.
- Dexie réduit la complexité d'IndexedDB sans imposer de serveur.
- Tailwind et des composants maison permettent une identité visuelle rapide sans bloquer sur un design system lourd.
- Les courbes MVP n'ajoutent pas de dépendance supplémentaire ni de poids de bundle dédié.

### CONS

- Les composants maison demandent de maintenir la cohérence UI au fil des tickets.
- Les courbes SVG maison n'offrent pas les tooltips, axes riches et comportements avancés d'une librairie spécialisée.
- Les choix de routing, tests et tooling précis restent à valider pendant le Ticket 01.
- Le mode sombre et le polish avancé ne doivent pas retarder le coeur MVP.

## Documents liés

- `PRODUCT / Vision produit et MVP`
- `PRODUCT / Parcours et écrans MVP`
- `ROADMAP / Tickets MVP`
- ADR `Courbe Insights locale en SVG sans dépendance chart`
