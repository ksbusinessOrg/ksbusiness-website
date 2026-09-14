(function(){
  // Scrollspy für die Bottom-Nav: markiert den Link zur Section, die gerade
  // im mittleren Band des Viewports liegt. Kein Öffnen/Schließen mehr nötig
  // (siehe [[project_klaus_website_scroll_test]] — Burger-Dropdown ersetzt),
  // daher hier nur noch Aktiv-Zustand statt Menü-Logik. Läuft harmlos auch
  // auf Desktop mit (Bottom-Nav ist dort nur per CSS ausgeblendet).
  var bottomNav = document.getElementById('bottom-nav');
  if (!('IntersectionObserver' in window)) return;
  // Jetzt auch die Desktop-Pill (#site-nav) mit -- vorher nur Bottom-Nav,
  // die schwebende Nav oben hatte gar keinen Aktiv-Zustand.
  var links = document.querySelectorAll('#bottom-nav a[data-section], #site-nav a[data-section]');
  if (!links.length) return;
  var linkBySection = {};
  links.forEach(function(a){ linkBySection[a.dataset.section] = a; });

  function setActive(id){
    links.forEach(function(a){ a.classList.toggle('is-active', a.dataset.section === id); });
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  Object.keys(linkBySection).forEach(function(id){
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();

(function(){
  // Referenzen-Slider (nur mobil aktiv, siehe CSS @media(max-width:900px)):
  // Pagination-Punkte markieren die gerade sichtbare Karte im horizontalen
  // Scroll-Snap-Container. Läuft auf Desktop harmlos mit (Punkte per CSS
  // ausgeblendet, .ref-grid scrollt dort nicht).
  var refGrid = document.querySelector('.ref-grid');
  var refDots = document.querySelectorAll('.ref-dot');
  if (refGrid && refDots.length && 'IntersectionObserver' in window){
    var refCards = refGrid.querySelectorAll('.ref-card');
    var refObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var idx = Array.prototype.indexOf.call(refCards, entry.target);
        refDots.forEach(function(d, i){ d.classList.toggle('is-active', i === idx); });
      });
    }, { root: refGrid, threshold: 0.6 });
    refCards.forEach(function(c){ refObserver.observe(c); });
  }

  // Kontakt-Tabs (nur mobil sichtbar, siehe CSS): Formular/Booking-Karte
  // sind jetzt zwei Panels IN einer gemeinsamen, nativ scrollenden Snap-
  // Spur (.kontakt-tab-track) -- swipen läuft über echtes Scrollen samt
  // Einrasten (scroll-snap-align/-stop), kein eigener Touch-Schwellenwert
  // mehr nötig. Tabs scrollen programmatisch zum jeweiligen Panel; ein
  // IntersectionObserver hält bei manuellem Swipe den Tab-Status aktuell
  // -- gleiches Prinzip wie die Referenzen-Pagination oben.
  var kontaktTabs = document.querySelectorAll('.kontakt-tab');
  var kontaktTrack = document.querySelector('.kontakt-tab-track');
  if (kontaktTabs.length && kontaktTrack){
    var kontaktPanels = kontaktTrack.querySelectorAll('.kontakt-form, .booking-card');
    kontaktTabs.forEach(function(btn){
      btn.addEventListener('click', function(){
        // Direkt scrollLeft auf der Spur setzen statt scrollIntoView --
        // scrollIntoView kollidierte mit dem eigenen Fake-Fixed-Scroll-
        // System der Seite (position:fixed + JS-Transform) und verschob
        // dabei den vertikalen Seiten-Scroll mit ("Layout springt nach
        // links"/driftet). So bleibt es rein horizontal, auf der Spur
        // selbst.
        var idx = btn.dataset.tab === 'booking' ? 1 : 0;
        kontaktTrack.scrollTo({ left: idx * kontaktTrack.clientWidth, behavior:'smooth' });
      });
    });
    if ('IntersectionObserver' in window){
      var kontaktObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          var idx = Array.prototype.indexOf.call(kontaktPanels, entry.target);
          var tab = idx === 1 ? 'booking' : 'form';
          kontaktTabs.forEach(function(b){
            var active = b.dataset.tab === tab;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-selected', active ? 'true' : 'false');
          });
        });
      }, { root: kontaktTrack, threshold: 0.6 });
      kontaktPanels.forEach(function(p){ kontaktObserver.observe(p); });
    }
  }
})();

(function(){
  var content = document.getElementById('smooth-content');
  var spacer = document.getElementById('smooth-spacer');
  var nav = document.getElementById('site-nav');
  var bottomNav = document.getElementById('bottom-nav');
  // Footer zählt hier mit (kein <section id>, aber jetzt .theme-light),
  // sonst bleibt die Pill über dem hellen Footer fälschlich im Dunkel-Stil.
  var themeSections = document.querySelectorAll('section[id], footer');
  var heroInner = document.querySelector('.hero-inner');
  var heroSection = document.querySelector('.hero');
  var h1Parallax = document.querySelector('.h1-parallax');
  var layerEls = document.querySelectorAll('.layer');
  // .arb-box-reveal (Foto-Karte, Foto, dunkle Karte) bewusst NICHT im
  // selben querySelectorAll wie Punkte/Kicker/Absätze: der gemeinsame
  // Stagger-Index (i*stagger als Schwellenwert-Verschiebung) geht davon
  // aus, dass alle Elemente einer Gruppe nur wenige Pixel auseinander
  // liegen (wie die 4 Punkte oder die 3 Absätze) -- bei den großen,
  // ~80-90px weiter auseinander liegenden Boxen summierte sich der
  // Index-Versatz (bei der Karte z.B. Index 6 -> 420px Vorsprung) so
  // stark auf, dass die Karte schon fertig eingeblendet war, bevor sie
  // überhaupt im Viewport auftauchte (kein sichtbares Einfliegen mehr).
  // Eigene, kleiner gestaffelte Gruppe behebt das.
  var arbeitsweiseEls = document.querySelectorAll('.arbeitsweise .js-reveal:not(.arb-box-reveal)');
  var arbeitsweiseBoxEls = document.querySelectorAll('.arb-box-reveal');
  var referenzenHeadEls = document.querySelectorAll('.referenzen-head .js-reveal');
  var refCards = document.querySelectorAll('.ref-card');
  var referenzenSection = document.querySelector('.referenzen');
  var refColA = document.querySelector('.ref-col-a');
  var refColB = document.querySelector('.ref-col-b');
  var kontaktHeadEls = document.querySelectorAll('.kontakt-head .js-reveal');
  var kontaktCards = document.querySelectorAll('.kontakt-form, .booking-card');
  var headKicker = document.querySelector('.layers-head .kicker');
  var headTitle = document.getElementById('layers-title');
  var titleWords = headTitle ? headTitle.querySelectorAll('.word') : [];
  var arbeitsweiseTitleEl = document.getElementById('arbeitsweise-title');
  var arbeitsweiseTitleWords = arbeitsweiseTitleEl ? arbeitsweiseTitleEl.querySelectorAll('.word') : [];
  var referenzenTitleEl = document.getElementById('referenzen-title');
  var referenzenTitleWords = referenzenTitleEl ? referenzenTitleEl.querySelectorAll('.word') : [];
  var kontaktTitleEl = document.getElementById('kontakt-title');
  var kontaktTitleWords = kontaktTitleEl ? kontaktTitleEl.querySelectorAll('.word') : [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Einmalig: Wörter mit einer bewusst gesetzten Sonderfarbe (z.B. das rote
  // "sprechen." im Kontakt-Titel) merken sich diese Farbe, damit der
  // Grau->Ink-Verlauf unten sie nicht überschreibt.
  document.querySelectorAll('h2 .word').forEach(function(w){
    if (w.style.color) { w.dataset.targetColor = w.style.color; }
  });

  function hexToRgb(hex){
    hex = hex.replace('#','');
    return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
  }
  function lerpColor(a, b, t){
    return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*t) + ',' + Math.round(a[1]+(b[1]-a[1])*t) + ',' + Math.round(a[2]+(b[2]-a[2])*t) + ')';
  }
  // Bewusst EXTREMERE Endpunkte als die normalen --muted/--ink Design-Tokens:
  // "gedimmt" blendet fast mit dem eigenen Hintergrund, "voll sichtbar"
  // geht auf maximalen Kontrast (reines Weiß/Schwarz) — dadurch ist der
  // Sprung beim Aufleuchten klar erkennbar, nicht nur eine feine Nuance.
  var DARK_DIM = hexToRgb('#2A3140'), DARK_FULL = hexToRgb('#FFFFFF');
  var LIGHT_DIM = hexToRgb('#C7CDD6'), LIGHT_FULL = hexToRgb('#000000');

  function setSpacerHeight(){
    spacer.style.height = content.offsetHeight + 'px';
  }

  var isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;

  // Pill (Desktop) und Bottom-Nav (Mobile) wechseln Hell/Dunkel je nachdem,
  // welche Section gerade an ihrer Position durchscrollt (siehe CSS-
  // Kommentare bei .nav / .bottom-nav). Reiner Farb-/Kontrast-Zustand,
  // keine Bewegung — läuft deshalb bewusst auch unter reduced-motion (nur
  // die Transition dafür ist per CSS deaktiviert).
  // Lokal dunkle Karten (.dark-surface) innerhalb einer .theme-light-Section
  // (z.B. der Arbeitsweise-Kasten "Nah am Kunden") sollen die Nav wieder
  // dunkel einfärben, sobald sie darunter durchläuft -- genau wie über
  // echten dunklen Sections. Deshalb zusätzlich zum Section-Check auch
  // gegen die Bounding-Box jeder .dark-surface prüfen (x UND y, da diese
  // Karten anders als Sections nicht die volle Breite einnehmen).
  var darkSurfaces = document.querySelectorAll('.dark-surface');
  function sectionIsLightAt(x, y){
    var isLight = false;
    themeSections.forEach(function(sec){
      var r = sec.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom && sec.classList.contains('theme-light')) isLight = true;
    });
    darkSurfaces.forEach(function(ds){
      var r = ds.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) isLight = false;
    });
    return isLight;
  }
  function updateNavTheme(){
    if (nav){
      var navRect = nav.getBoundingClientRect();
      var cx = navRect.left + navRect.width / 2;
      nav.classList.toggle('nav-on-light', sectionIsLightAt(cx, navRect.bottom + 4));
    }
    if (bottomNav){
      var bnRect = bottomNav.getBoundingClientRect();
      var cx2 = bnRect.left + bnRect.width / 2;
      bottomNav.classList.toggle('nav-on-light', sectionIsLightAt(cx2, bnRect.top - 4));
    }
  }


  if (reduceMotion) {
    // Kein Scroll-Hijacking — natives Verhalten, alles direkt sichtbar.
    content.style.position = 'static';
    layerEls.forEach(function(el){ el.style.opacity = 1; el.style.transform = 'none'; });
    if (headKicker){ headKicker.style.opacity = 1; headKicker.style.transform = 'none'; }
    titleWords.forEach(function(w){ w.style.opacity = 1; w.style.transform = 'none'; });
    updateNavTheme();
    window.addEventListener('scroll', updateNavTheme, { passive:true });
    return;
  }

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }

  function updateReveals(){
    var vh = window.innerHeight;
    updateNavTheme();

    // Hero: sanfter Parallax-/Fade-Effekt beim Verlassen der Section nach oben.
    if (heroInner && heroSection){
      var heroTop = heroSection.getBoundingClientRect().top;
      var heroProgress = clamp01(-heroTop / vh);
      heroInner.style.transform = 'translateY(' + (heroProgress * 90) + 'px)';
      heroInner.style.opacity = String(1 - heroProgress * 0.95);

      // Headline bekommt eine eigene, stärkere Bewegungsrate als der Rest
      // (Eyebrow/Subtext/CTA) — dadurch wirkt sie beim Scrollen "lebendiger"
      // und läuft sichtbar schneller als ihre Umgebung, statt als starrer
      // Teil desselben Blocks mitzulaufen.
      if (h1Parallax){
        h1Parallax.style.transform = 'translateY(' + (heroProgress * -55) + 'px)';
      }
    }

    // Section-Überschrift (Kicker + H2): löst etwas FRÜHER aus als die
    // Kacheln darunter, damit die Leserichtung oben->unten erhalten bleibt.
    var headStart = vh * 0.95;
    var headEnd = vh * 0.68;
    if (headKicker){
      var kRect = headKicker.getBoundingClientRect();
      var kProgress = clamp01((headStart - kRect.top) / (headStart - headEnd));
      headKicker.style.opacity = String(kProgress);
      headKicker.style.transform = 'translateY(' + (30 * (1 - kProgress)) + 'px)';
    }
    // Headline: Wort-für-Wort-Reveal über eine BREITE Scrolltiefe — jetzt für
    // jede Section-Headline aufgerufen (siehe revealWords()-Definition unten).
    revealWords(headTitle, titleWords);
    revealWords(arbeitsweiseTitleEl, arbeitsweiseTitleWords);
    revealWords(referenzenTitleEl, referenzenTitleWords);
    revealWords(kontaktTitleEl, kontaktTitleWords);

    // Leistungs-Kacheln: Einflug direkt an den Scroll-Fortschritt gekoppelt
    // (kein einmaliges Ein-/Ausblenden, sondern kontinuierlich mitlaufend).
    var start = vh * 0.92;
    var end = vh * 0.55;
    layerEls.forEach(function(el, i){
      var rect = el.getBoundingClientRect();
      var elStart = start + i * 40; // minimaler Zeitversatz pro Kachel
      var elEnd = end + i * 40;
      var progress = clamp01((elStart - rect.top) / (elStart - elEnd));
      el.style.opacity = String(progress);
      el.style.transform = 'translateY(' + (36 * (1 - progress)) + 'px)';
    });

    // Arbeitsweise/Referenzen/Kontakt: gleiches Prinzip, generalisiert —
    // eine Gruppe von Elementen, kontinuierlich mit leichtem Stagger.
    revealGroup(arbeitsweiseEls, { stagger: 70 });
    revealGroup(arbeitsweiseBoxEls, { stagger: 50 });
    revealGroup(referenzenHeadEls, { stagger: 60 });
    revealGroup(refCards, { stagger: 55 });

    // Referenzen: die zwei Karten-Spalten laufen beim Durchscrollen der
    // Section unterschiedlich schnell (Idee von app-mail.webflow.io) —
    // eigener Transform-Layer auf .ref-col, unabhängig vom js-reveal-
    // Transform auf den einzelnen .ref-card-Kindern darin (zwei
    // verschachtelte Transforms auf Eltern/Kind kollidieren nicht).
    // Nur auf Desktop: auf Mobile steht .ref-grid eh nur einspaltig.
    if (referenzenSection && refColA && refColB){
      if (window.innerWidth > 900){
        var refRect = referenzenSection.getBoundingClientRect();
        var refProgress = clamp01((vh - refRect.top) / (vh + refRect.height));
        var refDrift = (refProgress - 0.5) * -1;
        refColA.style.transform = 'translateY(' + (refDrift * 160) + 'px)';
        refColB.style.transform = 'translateY(' + (refDrift * 320) + 'px)';
      } else {
        refColA.style.transform = 'none';
        refColB.style.transform = 'none';
      }
    }

    revealGroup(kontaktHeadEls, { stagger: 60 });
    revealGroup(kontaktCards, { stagger: 70 });
  }

  // Generalisierte Version der Wort-für-Wort-Reveal-Logik: container liefert
  // die Scroll-Referenzposition, words sind die einzelnen .word-Spans darin.
  function revealWords(container, words, opts){
    if (!container || !words || !words.length) return;
    opts = opts || {};
    var vh = window.innerHeight;
    var tRect = container.getBoundingClientRect();
    var tStart = opts.start !== undefined ? opts.start : vh * 1.05;
    var tEnd = opts.end !== undefined ? opts.end : vh * 0.15;
    var band = opts.band !== undefined ? opts.band : 0.85;
    var overall = clamp01((tStart - tRect.top) / (tStart - tEnd));
    var n = words.length;
    // Auf hellen Sections braucht der Verlauf andere Endpunkte als auf
    // dunklen (siehe Kommentar bei DARK_DIM/LIGHT_DIM oben). .dark-surface
    // markiert eine lokal dunkle Karte INNERHALB einer .theme-light-Section
    // (z.B. die Arbeitsweise-Karte) -- die zählt für den Text-Verlauf als
    // dunkel, sonst würde der Text Richtung Schwarz statt Weiß aufhellen
    // und beim Scrollen sichtbar dunkler statt heller werden.
    var isLight = !!container.closest('.theme-light') && !container.closest('.dark-surface');
    var dimRgb = isLight ? LIGHT_DIM : DARK_DIM;
    var fullRgb = isLight ? LIGHT_FULL : DARK_FULL;
    words.forEach(function(w, i){
      var t = overall * n - i;
      var wp = clamp01(t / band);
      w.style.transform = 'translateY(' + (0.12 * (1 - wp)) + 'em)';
      if (w.dataset.targetColor){
        // Sonderfarbe (Akzent, z.B. Rot) behalten — nur über Opacity dimmen,
        // nicht zur Ink-Farbe überblenden.
        w.style.color = w.dataset.targetColor;
        w.style.opacity = String(0.35 + wp * 0.65);
      } else {
        w.style.opacity = 1;
        w.style.color = lerpColor(dimRgb, fullRgb, wp);
      }
    });
  }

  function revealGroup(list, opts){
    opts = opts || {};
    var startBase = opts.start !== undefined ? opts.start : window.innerHeight * 0.92;
    var endBase = opts.end !== undefined ? opts.end : window.innerHeight * 0.6;
    var stagger = opts.stagger !== undefined ? opts.stagger : 40;
    var dist = opts.dist !== undefined ? opts.dist : 36;
    list.forEach(function(el, i){
      var rect = el.getBoundingClientRect();
      var elStart = startBase + i * stagger;
      var elEnd = endBase + i * stagger;
      var progress = clamp01((elStart - rect.top) / (elStart - elEnd));
      el.style.opacity = String(progress);
      el.style.transform = 'translateY(' + (dist * (1 - progress)) + 'px)';
    });
  }

  if (isTouch) {
    // Mobil: komplett natives Scrollen, kein Fake-Fixed-Position-Hijack mehr.
    // Der träge Scrub-Look (Desktop-ease 0.09) ist ein reiner Desktop-Effekt
    // — auf Touch war die Position ohnehin längst auf ~1:1 reduziert. Der
    // ganze Hijack-Mechanismus (position:fixed + Spacer + JS-Transform +
    // eigene maxScroll-Grenze) brachte auf Mobile dadurch nur noch Bugs
    // (Sprung am unteren Rand, weil maxScroll mit dem schwankenden
    // window.innerHeight beim Ein-/Ausblenden der Adressleiste neu berechnet
    // wurde; gelegentliches Ruckeln durch die zusätzliche JS-Schicht über der
    // nativen Scroll-Physik), aber keinen sichtbaren Vorteil mehr. Rebeccas
    // Regel: auf Mobile geht sauberes, natives Scrollen vor Optik — deshalb
    // hier komplett raus. Die Wort-/Kachel-Reveals bleiben unverändert, die
    // hängen nur an der echten Scrollposition (getBoundingClientRect), nicht
    // am Hijack-Mechanismus.
    content.style.position = 'static';
    spacer.style.display = 'none';
    var touchTicking = false;
    function onTouchScroll(){
      if (touchTicking) return;
      touchTicking = true;
      requestAnimationFrame(function(){ updateReveals(); touchTicking = false; });
    }
    window.addEventListener('scroll', onTouchScroll, { passive:true });
    updateReveals();
  } else {
    setSpacerHeight();
    window.addEventListener('resize', setSpacerHeight);
    // Layout (u.a. durch Web-Font) kann sich nach dem ersten Messen noch
    // leicht verschieben — einmal nachmessen, ohne eine ganze Polling-Schleife
    // aufzuziehen.
    setTimeout(setSpacerHeight, 300);

    // Anker-Links (Nav, Hero-CTA) funktionieren mit dem Fake-Fixed-Scroll
    // NICHT von selbst: #layers & Co. liegen innerhalb von #smooth-content,
    // das position:fixed ist — der Browser kann ein position:fixed-
    // Nachfahren-Element nicht per natives scrollIntoView/#hash-Sprung
    // "in den sichtbaren Bereich scrollen" (window.scrollY bewegt es ja gar
    // nicht direkt, nur unser eigener Transform tut das). Deshalb hier
    // manuell nachgebaut: Ziel-Offset selbst berechnen und window.scrollTo
    // aufrufen — current/raf() holen sich den neuen Wert dann wie gewohnt
    // per Lerp ab, der Klick scrollt also mit demselben weichen Scrub wie
    // normales Scrollen.
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var id = a.getAttribute('href').slice(1);
        var targetEl = document.getElementById(id);
        if (!targetEl) return;
        e.preventDefault();
        var offset = 110; // Klarabstand unter der schwebenden Nav-Pill (matcht scroll-margin-top)
        var desiredScrollY = window.scrollY + targetEl.getBoundingClientRect().top - offset;
        // behavior:'instant' erzwingen, sonst würde das globale
        // scroll-behavior:smooth (siehe CSS) hier zusätzlich zum eigenen
        // Lerp noch eine zweite, konkurrierende Glättung auffahren.
        window.scrollTo({ top: Math.max(0, desiredScrollY), left: 0, behavior: 'instant' });
        history.pushState(null, '', '#' + id);
      });
    });

    var current = 0, target = 0;
    var ease = 0.09; // kleiner = "schwerer"/träger, angelehnt an GSAP scrub:1

    function raf(){
      target = window.scrollY;
      // An der eigenen Höhe deckeln (Footer zählt jetzt mit dazu, da er
      // innerhalb von #smooth-content liegt und ganz normal als letzter
      // Abschnitt im selben Lerp-Scroll mitläuft).
      var maxScroll = Math.max(0, content.offsetHeight - window.innerHeight);
      var clampedTarget = Math.min(target, maxScroll);
      current += (clampedTarget - current) * ease;
      if (Math.abs(clampedTarget - current) < 0.05) current = clampedTarget;
      content.style.transform = 'translate3d(0,' + (-current) + 'px,0)';
      updateReveals();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Cross-Page-Anker: kommt man z.B. von impressum.html mit
  // index.html#kontakt an, greift der Klick-Handler oben nicht (der
  // reagiert nur auf Klicks INNERHALB dieser Seite) -- und der native
  // Browser-Sprung zum Fragment landet bei #smooth-content (Desktop:
  // position:fixed) sowieso ins Leere, siehe Notiz dort. Deshalb hier
  // einmalig beim Laden dasselbe Offset-Scrollto nachholen, sobald Layout
  // (inkl. Web-Font-Nachmessen) sich beruhigt hat -- Funktion so simpel wie
  // moeglich gehalten, sie muss nur den einen initialen Fall abdecken, kein
  // hashchange-Listener noetig, weil #smooth-content-Klicks das eh selbst
  // regeln.
  if (location.hash) {
    var scrollToInitialHash = function(){
      var targetEl = document.getElementById(location.hash.slice(1));
      if (!targetEl) return;
      var offset = 110;
      var desiredScrollY = window.scrollY + targetEl.getBoundingClientRect().top - offset;
      window.scrollTo({ top: Math.max(0, desiredScrollY), left: 0, behavior: 'instant' });
    };
    requestAnimationFrame(function(){ setTimeout(scrollToInitialHash, 60); });
  }
})();

(function(){
  // Spotlight-Umlauf Leistungen: gleiches Raster-Gestaltungsmuster wie im
  // Hero, hier auf bereits dauerhaft sichtbare Karten angewendet -- ein
  // sanftes Aufleuchten wandert nacheinander durch, statt Elemente
  // erscheinen/verschwinden zu lassen (die Karten selbst bleiben stehen).
  var cards = document.querySelectorAll('.layer');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var HOLD = 2500;
  var i = 0;
  function step(){
    cards.forEach(function(c){ c.classList.remove('is-lit'); });
    cards[i].classList.add('is-lit');
    i = (i + 1) % cards.length;
    setTimeout(step, HOLD);
  }
  step();
})();

(function(){
  // Spotlight-Umlauf Referenzen: gleiches Muster wie bei Leistungen, hier
  // auf .ref-card-surface statt .layer (siehe CSS-Kommentar dort).
  var cards = document.querySelectorAll('.ref-card-surface');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var HOLD = 2500;
  var i = 0;
  function step(){
    cards.forEach(function(c){ c.classList.remove('is-lit'); });
    cards[i].classList.add('is-lit');
    i = (i + 1) % cards.length;
    setTimeout(step, HOLD);
  }
  step();
})();

// Gemeinsamer Toast fuer Erfolgsmeldungen (Kontaktformular + Terminbuchung),
// window.showToast() global verfuegbar, damit beide Scripte unten darauf
// zugreifen koennen, ohne das Element doppelt anzulegen.
(function(){
  var toast = document.getElementById('site-toast');
  var text = document.getElementById('site-toast-text');
  var closeBtn = document.getElementById('site-toast-close');
  if (!toast) return;
  var hideTimer;

  function hide(){
    toast.classList.remove('is-visible');
    clearTimeout(hideTimer);
    setTimeout(function(){ toast.hidden = true; }, 300);
  }
  window.showToast = function(message, container){
    clearTimeout(hideTimer);
    text.textContent = message;
    // In die jeweils betroffene Box verschieben (.kontakt-form oder
    // .booking-card, siehe Aufrufstellen) -- appendChild verschiebt das
    // bestehende Element, statt es zu duplizieren.
    (container || document.body).appendChild(toast);
    toast.hidden = false;
    // Reflow erzwingen, damit die Einblend-Transition auch greift, wenn der
    // Toast unmittelbar zuvor schon mal (aus-)geblendet wurde.
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    hideTimer = setTimeout(hide, 6000);
  };
  closeBtn.addEventListener('click', hide);
})();

(function(){
  // Kontaktformular: echter Versand statt des bisherigen Platzhalter-
  // Submits (kein action/method -- hing bisher komplett in der Luft).
  var form = document.getElementById('kontakt-form');
  if (!form) return;
  var status = document.getElementById('kontakt-form-status');
  var submitBtn = form.querySelector('.kontakt-submit');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    submitBtn.disabled = true;
    status.hidden = false;
    status.className = 'form-status';
    status.textContent = 'Wird gesendet…';

    fetch('/.netlify/functions/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('kontakt-name').value,
        email: document.getElementById('kontakt-email').value,
        nachricht: document.getElementById('kontakt-nachricht').value,
      }),
    }).then(function(res){
      if (res.ok) return res.json();
      return res.json().catch(function(){ return {}; }).then(function(data){
        throw new Error(data.error || 'Das hat leider nicht geklappt. Bitte spaeter erneut versuchen.');
      });
    }).then(function(){
      status.hidden = true;
      window.showToast('Danke! Ihre Nachricht ist angekommen, Klaus meldet sich bei Ihnen.', form);
      form.reset();
    }).catch(function(err){
      status.className = 'form-status is-error';
      status.textContent = err.message || 'Das hat leider nicht geklappt. Bitte spaeter erneut versuchen.';
    }).finally(function(){
      submitBtn.disabled = false;
    });
  });
})();

(function(){
  // Terminbuchung: Tag waehlen -> freie Halbstunden-Slots (Mo-Fr, 16-18
  // Uhr, naechste 10 Werktage) -> kurzes Formular -> Buchung per Netlify
  // Function (siehe netlify/functions/book-slot.js). Belegte Slots kommen
  // nur als IDs vom Server (keine Namen/E-Mails oeffentlich sichtbar,
  // siehe get-slots.js).
  var daysEl = document.getElementById('booking-days');
  var timesEl = document.getElementById('booking-times');
  var selectConfirmBtn = document.getElementById('booking-select-confirm');
  var confirmForm = document.getElementById('booking-confirm');
  var backBtn = document.getElementById('booking-back');
  var statusEl = document.getElementById('booking-status');
  if (!daysEl || !timesEl) return;

  var SLOT_TIMES = ['1600', '1630', '1700', '1730'];
  var SLOT_LABELS = { '1600': '16:00', '1630': '16:30', '1700': '17:00', '1730': '17:30' };
  var WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  function pad(n){ return String(n).padStart(2, '0'); }
  function dateKey(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  var days = [];
  var cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.length < 10) {
    var wd = cursor.getDay();
    if (wd !== 0 && wd !== 6) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  var bookedSlotIds = [];
  var selectedDayIndex = 0;
  var selectedSlotId = null;

  function isPast(day, timeCode){
    var slotDate = new Date(day);
    slotDate.setHours(parseInt(timeCode.slice(0, 2), 10), parseInt(timeCode.slice(2, 4), 10), 0, 0);
    return slotDate.getTime() <= Date.now();
  }

  function renderDays(){
    daysEl.innerHTML = '';
    days.forEach(function(day, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === selectedDayIndex ? 'true' : 'false');
      btn.className = 'booking-day' + (i === selectedDayIndex ? ' is-active' : '');
      btn.textContent = WEEKDAY_SHORT[day.getDay()] + ' ' + pad(day.getDate()) + '.' + pad(day.getMonth() + 1) + '.';
      btn.addEventListener('click', function(){
        selectedDayIndex = i;
        selectedSlotId = null;
        selectConfirmBtn.disabled = true;
        confirmForm.hidden = true;
        renderDays();
        renderTimes();
      });
      daysEl.appendChild(btn);
    });
  }

  function renderTimes(){
    timesEl.innerHTML = '';
    var day = days[selectedDayIndex];
    SLOT_TIMES.forEach(function(timeCode){
      var slotId = dateKey(day) + '_' + timeCode;
      var booked = bookedSlotIds.indexOf(slotId) !== -1;
      var past = isPast(day, timeCode);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.disabled = booked || past;
      btn.className = 'booking-time' + (btn.disabled ? ' is-booked' : '') + (slotId === selectedSlotId ? ' is-active' : '');
      btn.textContent = SLOT_LABELS[timeCode] + (booked ? ' · belegt' : '');
      if (!btn.disabled) {
        btn.addEventListener('click', function(){
          // Zeit nur auswaehlen/markieren -- NICHT sofort das Formular
          // aufklappen. Erst der eigene "Diesen Termin auswaehlen"-Button
          // fuehrt weiter, damit man sich die Wahl nochmal anschauen kann,
          // bevor man zur Eingabe von Name/E-Mail kommt. Erneuter Klick auf
          // die bereits aktive Pille waehlt wieder ab.
          selectedSlotId = (slotId === selectedSlotId) ? null : slotId;
          renderTimes();
          statusEl.hidden = true;
          confirmForm.hidden = true;
          selectConfirmBtn.disabled = !selectedSlotId;
        });
      }
      timesEl.appendChild(btn);
    });
  }

  selectConfirmBtn.addEventListener('click', function(){
    confirmForm.hidden = false;
    document.getElementById('booking-name').focus();
  });

  backBtn.addEventListener('click', function(){
    selectedSlotId = null;
    selectConfirmBtn.disabled = true;
    confirmForm.hidden = true;
    renderTimes();
  });

  confirmForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (!selectedSlotId) return;
    var submitBtn = confirmForm.querySelector('.kontakt-submit');
    submitBtn.disabled = true;
    statusEl.hidden = false;
    statusEl.className = 'form-status';
    statusEl.textContent = 'Wird angefragt…';

    fetch('/.netlify/functions/book-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: selectedSlotId,
        name: document.getElementById('booking-name').value,
        email: document.getElementById('booking-email').value,
      }),
    }).then(function(res){
      if (res.ok) return res.json();
      return res.json().catch(function(){ return {}; }).then(function(data){
        throw new Error(data.error || 'Das hat leider nicht geklappt. Bitte spaeter erneut versuchen.');
      });
    }).then(function(){
      confirmForm.hidden = true;
      confirmForm.reset();
      statusEl.hidden = true;
      window.showToast('Termin angefragt! Klaus meldet sich zur Bestätigung bei Ihnen.', document.querySelector('.booking-card'));
      selectedSlotId = null;
      selectConfirmBtn.disabled = true;
      loadBookedSlots();
    }).catch(function(err){
      statusEl.className = 'form-status is-error';
      statusEl.textContent = err.message || 'Das hat leider nicht geklappt. Bitte spaeter erneut versuchen.';
      selectedSlotId = null;
      selectConfirmBtn.disabled = true;
      loadBookedSlots();
    }).finally(function(){
      submitBtn.disabled = false;
    });
  });

  function loadBookedSlots(){
    fetch('/.netlify/functions/get-slots').then(function(res){
      if (!res.ok) throw new Error();
      return res.json();
    }).then(function(data){
      bookedSlotIds = data.bookedSlotIds || [];
      renderTimes();
    }).catch(function(){
      // Stiller Fallback -- Kalender bleibt nutzbar, nur ohne bekannte
      // Belegungen, statt den ganzen Bereich zu blockieren.
    });
  }

  // Tage-Leiste per Maus ziehbar machen -- overflow-x:auto allein reagiert
  // nur auf Touch/Trackpad-Wischen bzw. Mausrad, nicht auf Klicken+Ziehen.
  // Pointer Events statt Maus-Events, aber nur fuer pointerType "mouse"
  // verdrahtet, damit echtes Touch-Scrollen unangetastet nativ bleibt.
  (function(){
    var isDown = false, startX = 0, scrollStart = 0, moved = false;
    daysEl.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      isDown = true; moved = false;
      startX = e.clientX; scrollStart = daysEl.scrollLeft;
      daysEl.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function(e){
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      daysEl.scrollLeft = scrollStart - dx;
    });
    window.addEventListener('pointerup', function(){
      isDown = false;
      daysEl.classList.remove('is-dragging');
    });
    // Capture-Phase, damit das VOR dem Klick-Handler des jeweiligen
    // Tag-Buttons greift -- sonst wuerde ein Ziehen ueber einen Chip
    // hinweg am Ende versehentlich diesen Tag auswaehlen.
    daysEl.addEventListener('click', function(e){
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
  })();

  // Ausfaden links/rechts abhaengig vom Scroll-Stand -- am Anfang kein
  // Fade links (sonst wuerde der allererste Tag halb ausgeblendet
  // aussehen, obwohl es gar nichts davor gibt), am Ende entsprechend kein
  // Fade rechts.
  (function(){
    var FADE = '28px';
    function updateDaysFade(){
      var atStart = daysEl.scrollLeft <= 1;
      var atEnd = daysEl.scrollLeft + daysEl.clientWidth >= daysEl.scrollWidth - 1;
      var mask;
      if (atStart && atEnd) {
        mask = 'none';
      } else if (atStart) {
        mask = 'linear-gradient(to right, black 0, black calc(100% - ' + FADE + '), transparent 100%)';
      } else if (atEnd) {
        mask = 'linear-gradient(to right, transparent 0, black ' + FADE + ', black 100%)';
      } else {
        mask = 'linear-gradient(to right, transparent 0, black ' + FADE + ', black calc(100% - ' + FADE + '), transparent 100%)';
      }
      daysEl.style.maskImage = mask;
      daysEl.style.webkitMaskImage = mask;
    }
    daysEl.addEventListener('scroll', updateDaysFade, { passive: true });
    window.addEventListener('resize', updateDaysFade);
    updateDaysFade();
  })();

  renderDays();
  renderTimes();
  loadBookedSlots();
})();
