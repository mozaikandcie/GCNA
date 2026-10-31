# GCNA — Le Grand Chanté Nwèl d'Ambyans

Site one-page de l'association Ambyans Twopikal (HTML / CSS / JS vanilla, sans build). Édition du 19 décembre 2026, Lormont.

## Structure
- `index.html` — page principale · `css/` · `js/` · `assets/`
- `reglement.html`, `mentions-legales.html`, `confidentialite.html` — pages légales (à faire valider par un juriste)
- `js/config.js` — dates de l'événement, preloader, endpoint du rappel e-mail, URL de partage
- `reminder.php` — rappel par e-mail (PHP, Hostinger uniquement) ; envoie l'adresse à contact@gcna.fr
- `.htaccess` (+ `assets/`, `css/`, `js/`) — HTTPS, en-têtes de sécurité, cache (Hostinger)
- `robots.txt`, `sitemap.xml` — référencement (domaine gcna.fr)

## Hébergement
Hostinger, domaine gcna.fr, déploiement Git depuis la branche `main`.

## Notes
- Remplacer une image : lui donner un **nouveau nom** (cache d'un an sur `assets/`).
- Les points ouverts sont marqués `TODO` dans `index.html` (`grep -n TODO index.html`).
- En local : `python3 -m http.server 8000`, puis http://localhost:8000 (le rappel e-mail ne fonctionne pas sans PHP).
