/* Configuration modifiable sans toucher au reste du code. */
window.GCNA_CONFIG = {
  // Date de début / fin de l'événement (heure locale de Lormont)
  start: new Date(2026, 11, 19, 11, 0, 0),
  end: new Date(2026, 11, 20, 1, 0, 0),

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
