/* Configuration modifiable sans toucher au reste du code. */
window.GCNA_CONFIG = {
  // Date de début / fin de l'événement (heure locale de Lormont)
  start: new Date(2026, 11, 19, 11, 0, 0),
  end: new Date(2026, 11, 20, 1, 0, 0),

  // Rappel par e-mail (pop-up « Je note la date »).
  // Tant que cette URL est vide, le bloc « Rappel par e-mail » reste masqué.
  // Elle doit accepter un POST JSON { "email": "..." } (ex. formulaire Mailchimp / Brevo / Formspree).
  reminderEndpoint: '',

  // Page de l'événement partagée via le bouton « Partager »
  shareUrl: '',   // vide = adresse de la page courante
};
