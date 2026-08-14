# Migration des projets

Musique et Esport ne sont plus des domaines structurants codés en dur. Lors de la première ouverture authentifiée d'un compte, les anciens états non vides sont convertis en workspaces génériques avec les IDs stables `legacy-musique` et `legacy-esport`, puis les anciennes clés locales sont supprimées.

Les nouveaux comptes sans données héritées démarrent sans projet et utilisent le système existant de création de projet.
