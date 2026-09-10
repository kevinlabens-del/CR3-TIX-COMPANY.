# CR3@TIX COMPANY CORE

## Objectif

CR3@TIX COMPANY n'est pas un simple organigramme. Chaque employé est un programme spécialisé qui exécute réellement son travail. Le Boss définit l'intention et valide le résultat final. EMP-001 orchestre les travaux.

## Cycle autonome cible

1. Le Boss dépose une idée, une correction ou un objectif.
2. EMP-001 analyse le portefeuille et le dépôt concerné.
3. EMP-001 transforme l'objectif en tâches techniques vérifiables.
4. L'architecte prépare le plan et les contraintes.
5. Le développeur travaille dans une branche isolée.
6. Le build et les tests sont exécutés réellement.
7. Le QA accepte ou rejette le candidat.
8. En cas d'échec, la tâche retourne automatiquement au développeur avec les erreurs.
9. Le DevOps prépare un artefact ou un déploiement de prévisualisation.
10. EMP-001 synthétise le résultat pour le Boss.
11. Le Boss valide ou refuse le résultat final.
12. Après validation, la publication/merge finale peut être effectuée selon les permissions.

## Règles de sécurité

- Aucun employé ne modifie directement `main` pendant le travail normal.
- Les modifications passent par branche + tests + revue.
- Les secrets ne sont jamais stockés dans le front GitHub Pages ni dans le dépôt.
- Les opérations irréversibles, suppressions, publication en production et recrutements restent soumis à validation Boss.
- Toutes les actions sont journalisées.
- Chaque employé dispose d'une liste explicite d'outils et de dépôts autorisés.

## Composants

- `employee-registry.json` : identité et capacités des employés-programmes.
- `tasks/` : format des ordres de travail.
- `workers/` : programmes d'exécution.
- `.github/workflows/employee-worker.yml` : environnement d'exécution GitHub Actions.
- Backend COMPANY CORE : file de tâches, mémoire, audit, authentification et orchestration. Il ne doit pas être hébergé dans GitHub Pages.

## État actuel

La fondation des employés exécutables et du runner est intégrée au dépôt. Pour obtenir l'autonomie complète, le prochain composant nécessaire est le backend COMPANY CORE avec base de données, authentification et secrets côté serveur. Le front GitHub Pages devient alors uniquement le cockpit du Boss.
