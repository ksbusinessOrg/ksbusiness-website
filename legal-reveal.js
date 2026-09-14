// Scroll-Einblenden fuer den Fliesstext auf Impressum/Datenschutz -- gleiches
// Prinzip wie revealGroup()/updateReveals() auf index.html (Opacity+Y-Versatz
// direkt an die Scrollposition gekoppelt statt einer festen CSS-Transition),
// hier aber bewusst eigenstaendig und schlank gehalten: Legal-Seiten scrollen
// nativ (kein Fake-Fixed-Lerp-Hijack wie dort), und jeder Absatz bekommt
// seinen Reveal-Fortschritt einzeln ueber die eigene getBoundingClientRect()
// -- dadurch entsteht der Wasserfall-Effekt beim Runterscrollen ganz von
// selbst, ohne einen index-basierten Stagger wie bei den Karten-Gruppen dort.
(function(){
  var els = document.querySelectorAll('.legal-main > h2, .legal-main > h3, .legal-main > p, .legal-main > ul');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function clamp01(v){ return Math.max(0, Math.min(1, v)); }

  var dist = 28;

  function update(){
    var startBase = window.innerHeight * 0.92;
    var endBase = window.innerHeight * 0.65;
    els.forEach(function(el){
      var progress = clamp01((startBase - el.getBoundingClientRect().top) / (startBase - endBase));
      el.style.opacity = String(progress);
      el.style.transform = 'translateY(' + (dist * (1 - progress)) + 'px)';
    });
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ update(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  update();
})();
