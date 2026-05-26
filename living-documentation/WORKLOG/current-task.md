---
**date:** 2026-05-26
**status:** Idle
**description:** Point de reprise après extension de la timeline Today à six mois en chargement progressif au scroll-up.
**tags:** worklog, handoff, progression, today-page, timeline, infinite-scroll, six-months
---

# Current task

Ce document est le point de reprise entre assistants IA. Tout agent doit le lire avant de continuer une tâche et le mettre à jour avant de rendre la main.

## Statut courant

Idle — Timeline Today étendue à six mois avec chargement progressif. Lint + build OK.

## Tâche courante

Aucune implémentation en cours.

## Dernière action réalisée

Extension de la page principale Aujourd'hui (2026-05-26) :

- `TodayPage.tsx` charge maintenant 7 jours au montage (`INITIAL_TIMELINE_DAYS_VISIBLE = 7`).
- Le scroll-up près du haut du `<main>` augmente la fenêtre par paliers de 14 jours (`TIMELINE_DAYS_LOAD_STEP = 14`).
- La profondeur maximale est de six mois calendaires (`TIMELINE_MAX_MONTHS_VISIBLE = 6`), calculée depuis la date locale courante.
- Les jours passés sans entrée restent masqués ; Aujourd'hui reste toujours rendu.
- Lorsqu'une tranche plus ancienne ajoute du contenu au-dessus du viewport, la page compense le delta de `scrollHeight` pour conserver la position visuelle.
- L'ancien ADR `Timeline Today multi-jours scroll-up et day-anchored pills` est marqué `Partially SuperSeeded` sur la fenêtre fixe de 7 jours.
- Nouvel ADR créé : `Timeline Today six mois en chargement progressif`, lié à `src/features/entries/TodayPage.tsx` et `src/features/entries/useTimelineData.ts`.
- `PROJECT-STACK.md` mis à jour pour remplacer la règle obsolète des 7 derniers jours.

## Prochaine action recommandée

Continuer avec le **Ticket 15 — Boutons backup / restore dans l'app** quand l'utilisateur le demande.

Avant de coder ce ticket, valider avec l'utilisateur :

1. **Stockage de la clé `BACKUP_KEY` côté frontend** : ajouter un champ `cloudBackupKey?: string` dans `UserSettings`, exposé depuis la page Réglages (section « Sauvegarde cloud »), pour que le frontend l'envoie via le header `x-backup-key`. La clé ne doit pas être exportée dans le JSON de backup.
2. **UX** : « Sauvegarder maintenant » (PUT) + « Restaurer depuis le cloud » (GET puis import local après confirmation) + « Dernière sauvegarde : ... ».
3. **Tests préalables de l'endpoint** : `netlify link` + définir `BACKUP_KEY` + lancer `npm run dev:netlify` et tester un PUT/GET manuel.

## Fichiers ou zones concernés

- `src/features/entries/TodayPage.tsx`
- `src/features/entries/useTimelineData.ts`
- `living-documentation/ADRS/2026_05_15_08_55_[ADR]_timeline_today_multijours_scrollup_et_dayanchored_pills.md`
- `living-documentation/ADRS/2026_05_26_13_35_[ADR]_timeline_today_six_mois_en_chargement_progressif.md`
- `living-documentation/AI/PROJECT-STACK.md`
- `living-documentation/WORKLOG/current-task.md`
- `living-documentation/.metadata.json`

## Vérifications réalisées

- `npm run lint` : OK.
- `npm run build` : OK.
- MCP Living Documentation disponible ; nouvel ADR créé et lié aux fichiers source.

## Vérifications restantes

- Vérification navigateur manuelle recommandée avec des données historiques réelles : depuis Today, remonter jusqu'au haut de la timeline et vérifier que les anciennes entrées apparaissent progressivement jusqu'à six mois.

## Notes de reprise

- Le chargement progressif ne requête pas les six mois au montage : `useTimelineData` ne reçoit que le nombre de jours actuellement ouverts.
- Les jours vides étant masqués, une tranche chargée sans entrée peut ne pas produire de changement visuel immédiat.
- Si la densité d'entrées devient très élevée sur six mois, envisager une virtualisation DOM ou une requête paginée par dates non vides.
