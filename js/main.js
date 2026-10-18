/* Le Grand Chanté Nwèl d'Ambyans — comportements de la page.
 * Vanilla JS, sans dépendance. Les actions sont déclarées dans le HTML avec data-action="nom". */
(function () {
  'use strict';

  var CFG = window.GCNA_CONFIG || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !root.classList.contains('motion-on');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lastFocus = null;

  /* ---------- Intro (préparée au chargement, lancée après le preloader) ---------- */
  function initIntro() {
    var intro = $('#intro');
    if (!intro || !root.classList.contains('has-intro')) return function () {};
    var particles = root.classList.contains('intro-particles');
    var timer;
    var stopParticles = null;

    function done() {
      clearTimeout(timer);
      if (stopParticles) stopParticles();
      root.classList.remove('has-intro', 'intro-run');
      try { sessionStorage.setItem('gcna-intro', '1'); } catch (e) {}
    }
    intro.addEventListener('click', done);

    if (!particles) {
      var i = 0;
      $$('.intro-word', intro).forEach(function (w) {
        var text = w.getAttribute('data-text');
        w.textContent = '';
        Array.prototype.forEach.call(text, function (c) {
          var s = document.createElement('span');
          s.textContent = c;
          s.style.animationDelay = (0.25 + (i++) * 0.05) + 's';
          w.appendChild(s);
        });
      });
    }
    return function start() {
      root.classList.add('intro-run');
      if (particles && window.gcnaIntroParticles) {
        var cv = document.createElement('canvas');
        intro.appendChild(cv);
        stopParticles = window.gcnaIntroParticles(cv, done);
        timer = setTimeout(done, 6000);
      } else {
        timer = setTimeout(done, 4200);
      }
    };
  }

  /* ---------- Preloader : progression réelle (polices, image du hero, logo, chargement de la page) ---------- */
  function initPreloader(onDone) {
    var pl = $('#preloader');
    if (!pl || !root.classList.contains('has-preload')) { onDone(); return; }
    var fill = $('#pl-fill');
    var MIN = CFG.preloaderMin || 2000, MAX = Math.max(6000, MIN + 2000);   // durée mini (config.js) et maxi (garde-fou), en ms
    var t0 = Date.now(), loaded = 0, shown = 0, over = false;
    var images = ['assets/images/hero.jpg', 'assets/images/logo-gcna.png'];
    var total = images.length + 2;        // + polices + événement load

    function tick() { loaded++; }
    images.forEach(function (src) {
      var im = new Image();
      im.onload = im.onerror = tick;
      im.src = src;
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tick, tick); else tick();
    if (document.readyState === 'complete') tick(); else window.addEventListener('load', tick);

    function finish() {
      if (over) return;
      over = true;
      fill.style.transform = 'scaleX(1)';
      pl.classList.add('pl-out');
      try { sessionStorage.setItem('gcna-preload', '1'); } catch (e) {}
      setTimeout(onDone, 250);            // l'intro démarre pendant le fondu
      setTimeout(function () { root.classList.remove('has-preload'); pl.remove(); }, 600);
    }
    setTimeout(finish, MAX);              // garde-fou indépendant de requestAnimationFrame
    (function frame() {
      if (over) return;
      var elapsed = Date.now() - t0;
      var target = Math.min(loaded / total, elapsed / MIN);   // la barre se remplit sur la durée mini
      shown += (target - shown) * 0.08 + 0.002;           // progression lissée
      if (shown > target && target < 1) shown = target;
      shown = Math.min(shown, 1);
      fill.style.transform = 'scaleX(' + shown.toFixed(3) + ')';
      if ((loaded >= total && shown >= 0.995 && elapsed >= MIN) || elapsed >= MAX) return finish();
      requestAnimationFrame(frame);
    })();
  }

  /* ---------- Scroll : navbar, bouton retour, parallax ---------- */
  function onScroll() {
    document.body.classList.toggle('scrolled', (window.scrollY || root.scrollTop || 0) > 40);
  }
  var parallaxQueued = false;
  function parallax() {
    parallaxQueued = false;
    if (reduceMotion) return;
    var vh = window.innerHeight || 1;
    $$('[data-parallax]').forEach(function (el) {
      var host = el.parentElement;
      if (!host) return;
      var r = host.getBoundingClientRect();
      if (r.bottom < -240 || r.top > vh + 240) return;
      var prog = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      el.style.transform = 'translate3d(0,' + (-prog * r.height * speed).toFixed(1) + 'px,0)';
    });
  }
  function queueParallax() {
    if (parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(parallax);
  }

  /* ---------- Compte à rebours ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickCountdown() {
    var box = $('[data-if="showCountdown"]');
    if (!box) return;
    var now = Date.now(), start = CFG.start.getTime(), end = CFG.end.getTime();
    if (now >= end) {
      box.innerHTML = '<p style="text-align:center;margin-top:44px;font-family:\'Caveat\',cursive;font-size:30px;color:#f2ba4c">Merci d\'avoir fait vibrer le village ! Rendez-vous à la prochaine édition.</p>';
      clearInterval(cdTimer);
      return;
    }
    if (now >= start) {
      box.innerHTML = '<p style="text-align:center;margin-top:44px;font-family:\'Caveat\',cursive;font-size:34px;color:#f2ba4c">L\'ambyans est lancée, viens vibrer avec nous ! 🔥</p>';
      return;
    }
    var diff = start - now;
    var d = Math.floor(diff / 86400000); diff -= d * 86400000;
    var h = Math.floor(diff / 3600000); diff -= h * 3600000;
    var m = Math.floor(diff / 60000); diff -= m * 60000;
    var s = Math.floor(diff / 1000);
    var vals = { d: String(d), h: pad(h), m: pad(m), s: pad(s) };
    Object.keys(vals).forEach(function (k) {
      var el = $('[data-cd="' + k + '"]');
      if (el) el.textContent = vals[k];
    });
  }
  var cdTimer;

  /* ---------- Compteur d'artistes ---------- */
  function countArtists() {
    var names = {};
    $$('.mqtrack .artist:not([data-nocount]):not([aria-hidden])').forEach(function (a) {
      names[a.firstElementChild.textContent.trim()] = 1;
    });
    var n = Object.keys(names).length;
    var el = $('#artist-count');
    if (el && n) el.textContent = n;
  }

  /* ---------- Slider : duplication pour la boucle ---------- */
  function initMarquee() {
    var track = $('.mqtrack');
    if (!track) return;
    $$('.artist', track).slice().forEach(function (a) {
      var c = a.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('tabindex', '-1');
      track.appendChild(c);
    });
  }

  /* ---------- Modales ---------- */
  function setIf(name, on) {
    var el = $('[data-if="' + name + '"]');
    if (el) el.hidden = !on;
    return el;
  }
  function openModal(name) {
    lastFocus = document.activeElement;
    var el = setIf(name, true);
    root.style.overflow = 'hidden';
    var btn = el && $('button[data-action^="close"]', el);
    if (btn) btn.focus();
  }
  function closeModals() {
    setIf('showHoraires', false);
    setIf('showSaveDate', false);
    root.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }
  function modalOpen() {
    return $$('[data-if="showHoraires"],[data-if="showSaveDate"]').some(function (e) { return !e.hidden; });
  }

  /* ---------- Menu mobile ---------- */
  function setMenu(open) {
    var menu = $('#mobile-menu'), burger = $('.burger');
    if (!menu || !burger) return;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    var icon = $('[data-burger-icon]', burger);
    if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

  /* ---------- Calendrier / partage ---------- */
  function fmt(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  var EVENT = {
    title: "Le Grand Chanté Nwèl d'Ambyans",
    desc: 'Là où Noël se chante aux couleurs des Antilles.',
    place: 'Salle Léo Lagrange, rue Lavergne, 33310 Lormont',
  };
  function googleCal() {
    var u = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(EVENT.title)
      + '&dates=' + fmt(CFG.start) + '/' + fmt(CFG.end)
      + '&details=' + encodeURIComponent(EVENT.desc)
      + '&location=' + encodeURIComponent(EVENT.place);
    window.open(u, '_blank', 'noopener');
  }
  function icsFile() {
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GCNA//FR', 'BEGIN:VEVENT',
      'UID:gcna-2026@ambyans', 'DTSTAMP:' + fmt(new Date()),
      'DTSTART:' + fmt(CFG.start), 'DTEND:' + fmt(CFG.end),
      'SUMMARY:' + EVENT.title.replace(/,/g, '\\,'),
      'LOCATION:' + EVENT.place.replace(/,/g, '\\,'),
      'DESCRIPTION:' + EVENT.desc,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'chante-nwel-ambyans.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function share() {
    var url = CFG.shareUrl || location.href;
    var data = { title: EVENT.title, text: 'Samedi 19 décembre 2026 — ' + EVENT.desc, url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var ok = function () { setIf('shared', true); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, ok);
    else ok();
  }

  /* ---------- Rappel e-mail ---------- */
  function submitEmail() {
    var input = $('#email-input'), consent = $('#email-consent');
    var email = input.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) { input.focus(); return; }
    if (!consent.checked) { consent.focus(); return; }
    fetch(CFG.reminderEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }),
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      setIf('emailDone', true);
      setIf('emailNotDone', false);
    }).catch(function () { input.setCustomValidity('x'); input.reportValidity && input.reportValidity(); input.setCustomValidity(''); });
  }

  /* ---------- Carte Google Maps (chargée au clic) ---------- */
  function loadMap(btn) {
    var box = $('#map-box');
    var f = document.createElement('iframe');
    f.src = btn.getAttribute('data-src');
    f.width = '100%'; f.height = '440';
    f.style.cssText = 'border:0;display:block';
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.title = 'Plan d\'accès — Salle Léo Lagrange, Lormont';
    box.replaceWith(f);
  }

  /* ---------- Actions déclaratives ---------- */
  var actions = {
    openSaveDate: function () { openModal('showSaveDate'); },
    openHoraires: function () { openModal('showHoraires'); },
    closeSaveDate: closeModals,
    closeHoraires: closeModals,
    toggleMenu: function () { var m = $('#mobile-menu'); setMenu(m.hidden); },
    closeMenu: function () { setMenu(false); },
    scrollTop: function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); },
    google: googleCal,
    ics: icsFile,
    share: share,
    submitEmail: submitEmail,
    loadMap: loadMap,
    toggleMarquee: function (el) {
      var mq = $('.mq');
      var paused = mq.classList.toggle('paused');
      el.setAttribute('aria-pressed', String(paused));
      el.textContent = paused ? '▶ Reprendre le défilement' : '⏸ Mettre le défilement en pause';
    },
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    // un fond de modale ne se ferme que si on clique sur le fond lui-même
    if (el.hasAttribute('data-backdrop') && e.target !== el) return;
    var fn = actions[el.getAttribute('data-action')];
    if (fn) fn(el, e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modalOpen()) closeModals();
    else setMenu(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); queueParallax(); }, { passive: true });
  window.addEventListener('scroll', function () { onScroll(); queueParallax(); }, { passive: true });

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader(initIntro());
    initMarquee();
    countArtists();
    onScroll();
    setTimeout(parallax, 60);
    tickCountdown();
    cdTimer = setInterval(tickCountdown, 1000);
    if (CFG.reminderEndpoint) { var rb = $('#reminder-block'); if (rb) rb.hidden = false; }
  });
})();
