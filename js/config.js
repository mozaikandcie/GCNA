/* Configuration modifiable sans toucher au reste du code. */
window.GCNA_CONFIG = {
  // Date de début / fin de l'événement (heure de Lormont, UTC+1 en décembre ; indépendant du fuseau du visiteur)
  start: new Date('2026-12-19T11:00:00+01:00'),
  end: new Date('2026-12-20T01:00:00+01:00'),

  // Preloader : durée minimale d'affichage (ms). Calée sur l'animation du titre (fin à ~2,0 s dans css/styles.css)
  // + ~1 s de lecture. Il reste plus longtemps si le chargement n'est pas terminé (max = durée + 2 s, au moins 6 s).
  preloaderMin: 3000,

  // Rappel par e-mail (pop-up « Je note la date »).
  // Tant que cette URL est vide, le bloc « Rappel par e-mail » reste masqué.
  // reminder.php (hébergement PHP, ex. Hostinger) envoie l'adresse à contact@gcna.fr ; il ne fonctionne pas sur Vercel.
  reminderEndpoint: 'reminder.php',

  // Page de l'événement partagée via le bouton « Partager »
  shareUrl: '',   // vide = adresse de la page courante
};
