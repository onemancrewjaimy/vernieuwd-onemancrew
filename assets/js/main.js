/**
 * ONEMANCREW - main.js
 *
 * Bevat alle interactie voor de site: header, mobiel menu, de geanimeerde
 * knoppen, scroll-animaties, de rekentool, de slideshow, het portfoliofilter
 * met modal, de BTS-lightbox, de FAQ-accordion en de formuliervalidatie.
 *
 * Elke module start met een guard die stopt zodra de bijbehorende elementen
 * niet op de pagina staan, dus dit ene bestand kan veilig op alle pagina's
 * worden geladen.
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    renderIcons();
    initImageFallbacks();
    initPageTransitions();
    initHeader();
    initMobileMenu();
    initHeroTimecode();
    enhanceButtons(document);
    initScrollReveal();
    initCounters();
    initStatRings();
    initFooterYear();
    initSlideshow();
    initPortfolio();
    initBtsGallery();
    initAccordion();
    initContactForm();
  }

  /* ------------------------------------------------------------------
     Iconen (Lucide)
     ------------------------------------------------------------------ */
  function renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: {
          'stroke-width': 1.75,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
      });
    }
  }

  function refreshDynamicContent(container) {
    enhanceButtons(container);
    renderIcons();
  }

  /* ------------------------------------------------------------------
     Nette fallback voor ontbrekende afbeeldingen (bijvoorbeeld BTS-foto's
     die nog niet zijn aangeleverd). De dichtstbijzijnde [data-media-fallback]
     krijgt de class "is-missing" en style.css toont een nette placeholder
     in plaats van een kapot afbeeldingsicoon.

     Let op: zolang een bestand echt ontbreekt, logt de browser zelf een
     netwerkfout in de devtools-console (dat gebeurt op elke website bij een
     ontbrekend bestand en is niet vanuit JavaScript te onderdrukken, ook
     niet via fetch()). Zodra het echte bestand op zijn plek staat, is de
     console weer volledig foutloos.
     ------------------------------------------------------------------ */
  function initImageFallbacks() {
    window.addEventListener(
      'error',
      function (event) {
        var target = event.target;
        if (!(target instanceof HTMLImageElement)) return;
        var wrapper = target.closest('[data-media-fallback]');
        if (wrapper) wrapper.classList.add('is-missing');
      },
      true
    );
  }

  /* ------------------------------------------------------------------
     Pagina-overgang: een cirkelvormige "camera sluiter" die dichtklikt
     en weer opent bij het wisselen van pagina. Gebouwd met een
     doorzichtige cirkel (het "gat") met een enorme effen box-shadow
     eromheen: door de eigen grootte van die cirkel te animeren (niet een
     clip-path), sluit het beeld echt van de randen naar binnen toe, zoals
     een sluiterblad, in plaats van dat er een zwarte cirkel vanuit het
     midden naar buiten groeit. De animatie zelf laat de browser's eigen
     CSS-transitie afhandelen, niet een handmatige requestAnimationFrame-
     loop: dat geeft een merkbaar vloeiendere beweging omdat de browser de
     tussenstappen zelf interpoleert. Puur visueel, dus bij
     prefers-reduced-motion doen we helemaal niets, dan navigeert de
     browser gewoon normaal. De standaardstand (200vmax, ruim boven de
     schermdiagonaal) staat al in de CSS, dus zelfs zonder JavaScript kan
     er nooit een zwart scherm blijven hangen.

     Dit overlay-element bestaat pas zodra dit script draait, dus zonder
     extra maatregel zou een net-genavigeerde pagina heel even normaal in
     beeld flitsen voordat wij hem alsnog abrupt afdekken. Daarom zet een
     inline scriptje bovenaan elke pagina (voor de eerste paint) al een
     class op <html> die via CSS (html.oc-transition-pending body::before)
     het scherm meteen zwart maakt. Zodra dit script draait, nemen we die
     dekking naadloos over met het echte, animeerbare overlay-element en
     verwijderen we die class weer.
     ------------------------------------------------------------------ */
  function initPageTransitions() {
    if (prefersReducedMotion) {
      document.documentElement.classList.remove('oc-transition-pending');
      return;
    }

    var STORAGE_KEY = 'oc-page-transition';
    var OPEN_SIZE = 200; // vmax, moet gelijk zijn aan de standaardwaarde in style.css
    var CLOSED_SIZE = 0;
    var SAFETY_MS = 550;

    var overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    function setHole(vmax) {
      overlay.style.width = vmax + 'vmax';
      overlay.style.height = vmax + 'vmax';
    }

    function setInstant(vmax) {
      overlay.classList.add('is-instant');
      setHole(vmax);
      void overlay.offsetWidth;
      overlay.classList.remove('is-instant');
    }

    function afterTransition(callback) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        overlay.removeEventListener('transitionend', finish);
        callback();
      }
      overlay.addEventListener('transitionend', finish);
      setTimeout(finish, SAFETY_MS);
    }

    var justNavigated = false;
    try {
      justNavigated = sessionStorage.getItem(STORAGE_KEY) === '1';
      if (justNavigated) sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      justNavigated = false;
    }

    if (justNavigated) {
      setInstant(CLOSED_SIZE);
      // Het echte overlay-element dekt het scherm nu net zo af als de
      // voorlopige CSS-cover, dus deze wissel is onzichtbaar.
      document.documentElement.classList.remove('oc-transition-pending');
      overlay.style.pointerEvents = 'auto';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          setHole(OPEN_SIZE);
          afterTransition(function () {
            overlay.style.pointerEvents = 'none';
          });
        });
      });
    } else {
      setInstant(OPEN_SIZE);
      document.documentElement.classList.remove('oc-transition-pending');
    }

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      var url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (error) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch (error) {
        /* sessionStorage kan onbeschikbaar zijn (bijv. privénavigatie), de
           overgang speelt dan gewoon af zonder dat de volgende pagina hem
           herkent als "net genavigeerd". */
      }
      overlay.style.pointerEvents = 'auto';
      setHole(CLOSED_SIZE);
      afterTransition(function () {
        window.location.href = link.href;
      });
    });

    // De pagina die je verlaat, blijft achter met de overlay dicht (dat is
    // immers het laatste beeld vlak voor de navigatie). Ga je met de
    // terug/vooruit-knop van de browser naar die pagina toe, dan kan de
    // browser hem uit de bfcache herstellen als exacte momentopname, zonder
    // dat er ook maar iets van dit script opnieuw draait. Zonder dit zou
    // het scherm dan voorgoed grijs/dicht blijven, met de overlay nog
    // klikken blokkerend ook. pageshow met persisted true vangt precies dat
    // moment op en klapt de overlay direct weer open.
    window.addEventListener('pageshow', function (event) {
      if (!event.persisted) return;
      setInstant(OPEN_SIZE);
      overlay.style.pointerEvents = 'none';
    });
  }

  /* ------------------------------------------------------------------
     Herbruikbare focus-trap voor het mobiele menu, de portfolio-modal en
     de lightbox.
     ------------------------------------------------------------------ */
  function createFocusTrap(container, options) {
    var onEscape = options && options.onEscape;
    var focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function handleKeydown(event) {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;
      var focusables = Array.prototype.slice.call(container.querySelectorAll(focusableSelector));
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    return {
      activate: function () {
        document.addEventListener('keydown', handleKeydown);
      },
      deactivate: function () {
        document.removeEventListener('keydown', handleKeydown);
      },
    };
  }

  /* ------------------------------------------------------------------
     Timecode-notatie (uu:mm:ss:ff bij 24 fps), gedeeld door de hero-HUD en
     de knoppen.
     ------------------------------------------------------------------ */
  function formatTimecode(ms) {
    var fps = 24;
    var totalFrames = Math.floor((ms / 1000) * fps);
    var ff = totalFrames % fps;
    var totalSeconds = Math.floor(totalFrames / fps);
    var ss = totalSeconds % 60;
    var mm = Math.floor(totalSeconds / 60) % 60;
    var hh = Math.floor(totalSeconds / 3600);
    return [hh, mm, ss, ff]
      .map(function (n) {
        return String(n).padStart(2, '0');
      })
      .join(':');
  }

  /* ------------------------------------------------------------------
     Doorlopende timecode in de hero-HUD, puur decoratief.
     ------------------------------------------------------------------ */
  function initHeroTimecode() {
    var elements = document.querySelectorAll('[data-live-timecode]');
    if (!elements.length) return;

    // De hero-HUD is pas vanaf 1024px zichtbaar (zie .hero__hud in
    // style.css), dus op kleinere schermen heeft een doorlopende
    // rAF-lus hiervoor geen zin en is het puur verspilde CPU/batterij.
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        el.textContent = '00:00:00:00';
      });
      return;
    }

    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var value = formatTimecode(now - start);
      elements.forEach(function (el) {
        el.textContent = value;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     Sticky header: compacter en met achtergrond zodra er gescrold wordt.
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('[data-site-header]');
    if (!header) return;

    var threshold = 24;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > threshold);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobiel hamburgermenu met fullscreen overlay.
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    var header = document.querySelector('[data-site-header]');
    if (!toggle || !menu) return;

    var lastFocused = null;
    var focusTrap = createFocusTrap(menu, { onEscape: closeMenu });

    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      if (header) header.classList.add('is-menu-open');
      document.body.classList.add('has-lock-scroll');
      lastFocused = document.activeElement;
      var firstLink = menu.querySelector('a[href], button');
      if (firstLink) firstLink.focus();
      focusTrap.activate();
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (header) header.classList.remove('is-menu-open');
      document.body.classList.remove('has-lock-scroll');
      focusTrap.deactivate();
      if (lastFocused) lastFocused.focus();
    }

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ------------------------------------------------------------------
     Knoppen: "camera start met opnemen"
     Wikkelt de bestaande knoptekst in .btn__label en voegt de REC-indicator,
     de lopende timecode, de viewfinder-hoekjes en de shutter-flits toe.
     ------------------------------------------------------------------ */
  function enhanceButtons(root) {
    var buttons = root.querySelectorAll('.btn:not(.is-enhanced)');

    buttons.forEach(function (btn) {
      btn.classList.add('is-enhanced');

      var label = document.createElement('span');
      label.className = 'btn__label';
      while (btn.firstChild) {
        label.appendChild(btn.firstChild);
      }

      var rec = document.createElement('span');
      rec.className = 'btn__rec';
      rec.setAttribute('aria-hidden', 'true');
      var dot = document.createElement('span');
      dot.className = 'btn__rec-dot';
      var time = document.createElement('span');
      time.className = 'btn__rec-time';
      time.textContent = '00:00:00:00';
      rec.appendChild(dot);
      rec.appendChild(time);

      var flash = document.createElement('span');
      flash.className = 'btn__flash';
      flash.setAttribute('aria-hidden', 'true');

      btn.appendChild(rec);
      btn.appendChild(label);
      btn.appendChild(flash);

      ['tl', 'tr', 'bl', 'br'].forEach(function (pos) {
        var corner = document.createElement('span');
        corner.className = 'btn__corner btn__corner--' + pos;
        corner.setAttribute('aria-hidden', 'true');
        btn.appendChild(corner);
      });

      attachTimecode(btn);
      attachFlash(btn);
      attachTouchFeedback(btn);
    });
  }

  function attachTimecode(btn) {
    var timeEl = btn.querySelector('.btn__rec-time');
    if (!timeEl) return;

    var raf = null;
    var startTime = null;

    function tick(now) {
      if (startTime === null) startTime = now;
      timeEl.textContent = formatTimecode(now - startTime);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (prefersReducedMotion || raf) return;
      startTime = null;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      timeEl.textContent = '00:00:00:00';
    }

    btn.addEventListener('pointerenter', start);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('focus', start);
    btn.addEventListener('blur', stop);
    btn.addEventListener('touchstart', start, { passive: true });
    btn.addEventListener('touchend', stop);
  }

  function attachFlash(btn) {
    btn.addEventListener('click', function () {
      if (prefersReducedMotion) return;
      btn.classList.remove('is-active');
      void btn.offsetWidth;
      btn.classList.add('is-active');
    });
    btn.addEventListener('animationend', function (event) {
      if (event.animationName === 'btn-flash') {
        btn.classList.remove('is-active');
      }
    });
  }

  function attachTouchFeedback(btn) {
    function activate(event) {
      if (event.pointerType === 'touch') btn.classList.add('is-touch-active');
    }
    function deactivate() {
      btn.classList.remove('is-touch-active');
    }
    btn.addEventListener('pointerdown', activate);
    btn.addEventListener('pointerup', deactivate);
    btn.addEventListener('pointercancel', deactivate);
    btn.addEventListener('pointerleave', deactivate);
  }

  /* ------------------------------------------------------------------
     Scroll-reveal via IntersectionObserver.
     ------------------------------------------------------------------ */
  function initScrollReveal() {
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, index) {
        if (child.hasAttribute('data-reveal')) {
          child.style.setProperty('--reveal-index', index);
        }
      });
    });

    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px 0px -10% 0px' }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });

    /* Veiligheidsnet: op een zware pagina (bijvoorbeeld met de carrousel,
       die meerdere backdrop-filters tegelijk tekent) kan de browser tijdens
       snel scrollen een intersection-check overslaan, waardoor een sectie
       onzichtbaar zou blijven staan. Deze met requestAnimationFrame
       gethrottlede scroll-check maakt elk element dat al voorbij de
       viewport is gescrold alsnog zichtbaar, en ontkoppelt zichzelf zodra
       alles zichtbaar is. */
    var safetyTicking = false;
    function safetyCheck() {
      safetyTicking = false;
      var viewportBottom = window.innerHeight;
      var stillPending = false;
      items.forEach(function (item) {
        if (item.classList.contains('is-visible')) return;
        var rect = item.getBoundingClientRect();
        if (rect.top < viewportBottom) {
          item.classList.add('is-visible');
          observer.unobserve(item);
        } else {
          stillPending = true;
        }
      });
      if (!stillPending) {
        window.removeEventListener('scroll', onSafetyScroll);
      }
    }
    function onSafetyScroll() {
      if (safetyTicking) return;
      safetyTicking = true;
      window.requestAnimationFrame(safetyCheck);
    }
    window.addEventListener('scroll', onSafetyScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Tellende cijfers bij resultaten. Het aantal decimalen volgt uit de
     doelwaarde zelf (bijv. "5.5" telt met één decimaal op, "100" telt in
     hele getallen), en wordt met een komma weergegeven, niet een punt.
     ------------------------------------------------------------------ */
  function formatCounterValue(value, decimals) {
    return value.toFixed(decimals).replace('.', ',');
  }

  function animateValue(el, to, duration) {
    var decimals = (String(to).split('.')[1] || '').length;
    var start = performance.now();
    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCounterValue(to * eased, decimals);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatCounterValue(to, decimals);
      }
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter-to]');
    if (!counters.length) return;

    function run(el) {
      var raw = el.getAttribute('data-counter-to');
      var to = parseFloat(raw);
      if (prefersReducedMotion) {
        el.textContent = formatCounterValue(to, (raw.split('.')[1] || '').length);
        return;
      }
      animateValue(el, to, 1500);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  /* ------------------------------------------------------------------
     Ronde voortgangsring bij de resultatenblokken. Vult zich zodra de
     kaart in beeld scrolt, gelijk op met de tellende cijfers hierboven.
     ------------------------------------------------------------------ */
  function initStatRings() {
    var rings = document.querySelectorAll('[data-ring-target]');
    if (!rings.length) return;

    function run(circle) {
      var target = parseFloat(circle.getAttribute('data-ring-target'));
      var radius = circle.r.baseVal.value;
      var circumference = 2 * Math.PI * radius;
      var offset = circumference * (1 - Math.min(Math.max(target, 0), 100) / 100);

      circle.style.strokeDasharray = String(circumference);

      if (prefersReducedMotion) {
        circle.style.strokeDashoffset = String(offset);
        return;
      }

      circle.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          circle.style.strokeDashoffset = String(offset);
        });
      });
    }

    if (!('IntersectionObserver' in window)) {
      rings.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    rings.forEach(function (ring) {
      observer.observe(ring);
    });
  }

  /* ------------------------------------------------------------------
     Footer: jaartal automatisch bijwerken.
     ------------------------------------------------------------------ */
  function initFooterYear() {
    var el = document.querySelector('[data-current-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     Bouwt de video-placeholder markup, of, zodra een project een echt
     bestand heeft (project.video in portfolio-data.js), een echte <video>
     erin. In de carrousel en op de portfoliokaart is die video alleen een
     stil eerste beeld (geen controls, geen autoplay, preload="metadata"),
     zodat er nooit ongevraagd tientallen megabytes gestreamd worden.
     Alleen de modal, die je zelf opent, krijgt echte afspeelknoppen.
     ------------------------------------------------------------------ */
  function videoMediaTemplate(project, opts) {
    opts = opts || {};
    var hasVideo = !!project.video;
    var exposeToAT = hasVideo && opts.controls;
    var tag = opts.tag || 'div';
    var textTag = tag === 'span' ? 'span' : 'p';
    var classes = 'video-placeholder video-placeholder--tinted' + (opts.extraClass ? ' ' + opts.extraClass : '');
    var html = '<' + tag + ' class="' + classes + '"' + (exposeToAT ? '' : ' aria-hidden="true"') + '>';

    if (hasVideo) {
      html +=
        '<video class="video-placeholder__video" preload="metadata" playsinline' +
        (opts.controls ? ' controls' : ' muted tabindex="-1"') +
        '><source src="' +
        project.video +
        '" type="video/mp4"></video>';
    }

    if (opts.corners !== false) {
      html +=
        '<span class="frame-corners">' +
        '<span class="frame-corners__corner frame-corners__corner--tl"></span>' +
        '<span class="frame-corners__corner frame-corners__corner--tr"></span>' +
        '<span class="frame-corners__corner frame-corners__corner--bl"></span>' +
        '<span class="frame-corners__corner frame-corners__corner--br"></span>' +
        '</span>';
    }

    if (opts.rec) {
      html += '<span class="rec-tag video-placeholder__rec"><span class="rec-tag__dot"></span>REC</span>';
    }
    if (!hasVideo || !opts.controls) {
      html += '<span class="video-placeholder__play"><i data-lucide="play"></i></span>';
    }
    if (!hasVideo && opts.text) {
      html += '<' + textTag + ' class="video-placeholder__text">Video volgt binnenkort</' + textTag + '>';
    }

    html += '</' + tag + '>';
    return html;
  }

  /* ------------------------------------------------------------------
     Carrousel "Laatste werk" (homepage). Coverflow-achtig: de actieve
     kaart staat groot en scherp, buren piepen kleiner en onscherp om de
     hoek. Gevoed door dezelfde data als de portfoliopagina, zie
     assets/js/portfolio-data.js.
     ------------------------------------------------------------------ */
  function initSlideshow() {
    var root = document.querySelector('[data-slideshow]');
    if (!root || typeof getLatestProjects !== 'function') return;

    var stage = root.querySelector('[data-slideshow-track]');
    var announcer = root.querySelector('[data-slideshow-announcer]');
    var progressWrap = root.querySelector('[data-slideshow-progress]');
    var timecodeEl = root.querySelector('[data-slideshow-timecode]');
    var prevBtn = root.querySelector('[data-slideshow-prev]');
    var nextBtn = root.querySelector('[data-slideshow-next]');
    if (!stage) return;

    var projects = getLatestProjects(5);
    if (!projects.length) return;

    var AUTOPLAY_MS = 6000;
    var MAX_VISIBLE_OFFSET = 1;
    var SPACING_PERCENT = 58;
    root.style.setProperty('--autoplay-duration', AUTOPLAY_MS + 'ms');

    var current = 0;
    var timer = null;
    var paused = false;
    var dots = [];
    var cards = [];
    var dragMoved = false;

    function cardTemplate(project, index) {
      return (
        '<div class="carousel__card glass glass--interactive" data-index="' +
        index +
        '" role="group" aria-roledescription="dia" aria-label="' +
        (index + 1) +
        ' van ' +
        projects.length +
        '">' +
        videoMediaTemplate(project, { text: true, controls: true, corners: false }) +
        '<div class="carousel__body">' +
        '<p class="eyebrow carousel__category">' +
        project.categoryLabel +
        '</p>' +
        '<h3 class="carousel__client">' +
        project.client +
        '</h3>' +
        '<p class="carousel__result">' +
        project.summary +
        '</p>' +
        '<a class="btn btn--secondary btn--on-dark btn--sm" href="portfolio.html#' +
        project.id +
        '" tabindex="-1">Bekijk project</a>' +
        '</div>' +
        '</div>'
      );
    }

    stage.innerHTML = projects.map(cardTemplate).join('');
    cards = Array.prototype.slice.call(stage.querySelectorAll('[data-index]'));

    if (progressWrap) {
      progressWrap.innerHTML = projects
        .map(function (project, index) {
          return (
            '<button type="button" class="carousel__dot" data-index="' +
            index +
            '" aria-label="Ga naar project ' +
            (index + 1) +
            ' van ' +
            projects.length +
            '"><span class="carousel__dot-fill"></span></button>'
          );
        })
        .join('');
      dots = Array.prototype.slice.call(progressWrap.querySelectorAll('[data-index]'));
    }

    refreshDynamicContent(stage);

    function restartDotAnimation() {
      dots.forEach(function (dot) {
        var fill = dot.querySelector('.carousel__dot-fill');
        if (fill) fill.style.animation = 'none';
      });
      void root.offsetWidth;
      dots.forEach(function (dot) {
        var fill = dot.querySelector('.carousel__dot-fill');
        if (fill) fill.style.animation = '';
      });
    }

    function layoutCards() {
      var total = projects.length;
      cards.forEach(function (cardEl, index) {
        var offset = index - current;
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        var abs = Math.abs(offset);
        var isActive = offset === 0;
        var scale = Math.max(1 - abs * 0.16, 0.6);
        var opacity = abs > MAX_VISIBLE_OFFSET ? 0 : Math.max(1 - abs * 0.36, 0);
        var blurPx = isActive ? 0 : Math.min(abs * 3, 7);

        cardEl.style.transform =
          'translate(-50%, -50%) translateX(' + offset * SPACING_PERCENT + '%) scale(' + scale + ')';
        cardEl.style.opacity = String(opacity);
        cardEl.style.filter = blurPx ? 'blur(' + blurPx + 'px)' : '';
        cardEl.style.zIndex = String(100 - abs);
        cardEl.style.pointerEvents = abs > MAX_VISIBLE_OFFSET ? 'none' : 'auto';
        /* De dure backdrop-filter blijft beperkt tot de kaarten die
           daadwerkelijk zichtbaar zijn, dat scheelt aardig wat renderwerk
           tijdens snel scrollen. */
        cardEl.classList.toggle('glass', abs <= MAX_VISIBLE_OFFSET);
        cardEl.setAttribute('data-active', isActive ? 'true' : 'false');
        cardEl.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        var link = cardEl.querySelector('a');
        if (link) link.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    }

    function update() {
      layoutCards();
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
        dot.classList.toggle('is-done', index < current);
      });
      if (timecodeEl) {
        var mm = String(current + 1).padStart(2, '0');
        var totalLabel = String(projects.length).padStart(2, '0');
        timecodeEl.textContent = mm + ' / ' + totalLabel;
      }
      if (announcer) {
        var activeProject = projects[current];
        announcer.textContent =
          'Project ' + (current + 1) + ' van ' + projects.length + ': ' + activeProject.client + ', ' + activeProject.categoryLabel + '.';
      }
      restartDotAnimation();
    }

    function goTo(index, userInitiated) {
      current = (index + projects.length) % projects.length;
      update();
      if (userInitiated !== false) restartAutoplay();
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function startAutoplay() {
      if (prefersReducedMotion || paused) return;
      stopAutoplay();
      timer = window.setTimeout(function () {
        goTo(current + 1, false);
        startAutoplay();
      }, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (timer) window.clearTimeout(timer);
      timer = null;
    }

    function restartAutoplay() {
      if (paused) return;
      startAutoplay();
    }

    var hoverPaused = false;
    var offscreenPaused = false;

    function applyPausedState() {
      var value = hoverPaused || offscreenPaused;
      if (value === paused) return;
      paused = value;
      root.classList.toggle('is-paused', value);
      if (value) {
        stopAutoplay();
      } else {
        restartDotAnimation();
        startAutoplay();
      }
    }

    function setPaused(value) {
      hoverPaused = value;
      applyPausedState();
    }

    /* Zodra de carrousel buiten beeld scrolt, pauzeren we ook de draaiende
       achtergrondvlek en het automatisch doorschuiven: geen renderwerk
       verspillen aan iets dat niemand ziet. */
    var carouselSection = root.closest('.carousel-section');
    if (carouselSection && 'IntersectionObserver' in window) {
      var visibilityObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            offscreenPaused = !entry.isIntersecting;
            applyPausedState();
            carouselSection.classList.toggle('is-in-view', entry.isIntersecting);
          });
        },
        { threshold: 0.01 }
      );
      visibilityObserver.observe(carouselSection);
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    if (progressWrap) {
      progressWrap.addEventListener('click', function (event) {
        var dot = event.target.closest('[data-index]');
        if (!dot) return;
        goTo(Number(dot.getAttribute('data-index')));
      });
    }

    cards.forEach(function (cardEl) {
      cardEl.addEventListener('click', function (event) {
        if (dragMoved) return;
        var index = Number(cardEl.getAttribute('data-index'));
        if (index !== current) {
          event.preventDefault();
          goTo(index);
        }
      });
    });

    root.addEventListener('pointerenter', function () {
      setPaused(true);
    });
    root.addEventListener('pointerleave', function () {
      setPaused(false);
    });
    root.addEventListener('focusin', function () {
      setPaused(true);
    });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) setPaused(false);
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    });

    /* Eén pointer-gebaseerde sleepafhandeling voor zowel muis als touch.
       setPointerCapture pas ZODRA er echt gesleept wordt, niet meteen bij
       pointerdown: zodra een element de pointer "captured" heeft, worden
       alle latere events (inclusief het click-event) daarnaar toe
       omgeleid, ook al zit de aanwijzer nog boven een link erin. Deed je
       dat al bij pointerdown, dan werkte geen enkele link of knop in de
       kaart meer, ook niet bij een simpele klik zonder slepen. */
    var dragStartX = null;
    var dragActive = false;
    var dragPointerId = null;
    var DRAG_THRESHOLD = 40;
    var MOVE_THRESHOLD = 6;

    stage.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragActive = true;
      dragMoved = false;
      dragStartX = event.clientX;
      dragPointerId = event.pointerId;
    });

    stage.addEventListener('pointermove', function (event) {
      if (!dragActive || dragStartX === null) return;
      var delta = event.clientX - dragStartX;
      if (!dragMoved && Math.abs(delta) > MOVE_THRESHOLD) {
        dragMoved = true;
        if (stage.setPointerCapture) {
          try {
            stage.setPointerCapture(event.pointerId);
          } catch (e) {
            /* negeren, niet kritiek */
          }
        }
      }
    });

    function endDrag(event) {
      if (!dragActive) return;
      dragActive = false;
      if (stage.releasePointerCapture && dragPointerId !== null) {
        try {
          stage.releasePointerCapture(dragPointerId);
        } catch (e) {
          /* negeren, niet kritiek */
        }
      }
      dragPointerId = null;
      if (dragStartX !== null) {
        var delta = event.clientX - dragStartX;
        if (Math.abs(delta) > DRAG_THRESHOLD) {
          if (delta < 0) {
            next();
          } else {
            prev();
          }
        }
      }
      dragStartX = null;
      window.setTimeout(function () {
        dragMoved = false;
      }, 0);
    }

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    update();
    startAutoplay();
  }

  /* ------------------------------------------------------------------
     Portfolio: filters, grid en modal met case study.
     ------------------------------------------------------------------ */
  function initPortfolio() {
    var grid = document.querySelector('[data-portfolio-grid]');
    if (!grid || typeof ONEMANCREW_PROJECTS === 'undefined') return;

    var filterBar = document.querySelector('[data-portfolio-filters]');
    var modalOverlay = document.querySelector('[data-portfolio-modal]');
    var modalContent = modalOverlay ? modalOverlay.querySelector('[data-portfolio-modal-content]') : null;
    var modalCloseBtn = modalOverlay ? modalOverlay.querySelector('[data-modal-close]') : null;
    var validCategories = ['alles', 'werving', 'info', 'advertenties'];
    var lastFocused = null;
    var focusTrap = modalOverlay ? createFocusTrap(modalOverlay, { onEscape: closeModal }) : null;

    function cardTemplate(project) {
      return (
        '<button type="button" class="portfolio-card has-frame-reveal glass-light glass--interactive" data-portfolio-card data-category="' +
        project.category +
        '" data-portfolio-open="' +
        project.id +
        '" id="' +
        project.id +
        '" aria-haspopup="dialog">' +
        '<span class="portfolio-card__media">' +
        videoMediaTemplate(project, { rec: false, text: false, controls: false, tag: 'span' }) +
        '</span>' +
        '<span class="portfolio-card__body">' +
        '<span class="portfolio-card__category">' +
        project.categoryLabel +
        '</span>' +
        '<span class="portfolio-card__client h4">' +
        project.client +
        '</span>' +
        '<span class="portfolio-card__summary">' +
        project.summary +
        '</span>' +
        '</span>' +
        '</button>'
      );
    }

    function render() {
      grid.innerHTML = ONEMANCREW_PROJECTS.map(cardTemplate).join('');
      refreshDynamicContent(grid);
      grid.querySelectorAll('[data-portfolio-open]').forEach(function (card) {
        card.addEventListener('click', function () {
          openModal(card.getAttribute('data-portfolio-open'));
        });
      });
    }

    function applyFilter(category) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-portfolio-card]'));
      cards.forEach(function (card) {
        var matches = category === 'alles' || card.getAttribute('data-category') === category;
        if (matches) {
          card.classList.remove('is-hidden');
          requestAnimationFrame(function () {
            card.classList.remove('is-filtered-out');
          });
        } else {
          card.classList.add('is-filtered-out');
          window.setTimeout(function () {
            if (card.classList.contains('is-filtered-out')) card.classList.add('is-hidden');
          }, 320);
        }
      });
      if (filterBar) {
        filterBar.querySelectorAll('[data-filter]').forEach(function (btn) {
          btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === category));
        });
      }
    }

    function modalTemplate(project) {
      return (
        videoMediaTemplate(project, { text: true, controls: true, corners: false, extraClass: 'modal__media' }) +
        '<div class="modal__meta">' +
        '<span class="modal__category">' +
        project.categoryLabel +
        '</span>' +
        '</div>' +
        '<h2 id="portfolioModalTitle">' +
        project.client +
        (project.title ? ' - ' + project.title : '') +
        '</h2>' +
        '<p class="lede">' +
        project.summary +
        '</p>' +
        '<div class="modal__case">' +
        '<div class="modal__case-item"><h3>Vraag</h3><p>' +
        project.challenge +
        '</p></div>' +
        '<div class="modal__case-item"><h3>Aanpak</h3><p>' +
        project.approach +
        '</p></div>' +
        '<div class="modal__case-item"><h3>Resultaat</h3><p>' +
        project.result +
        '</p></div>' +
        '</div>' +
        '<div class="btn-row modal__cta">' +
        '<a href="contact.html" class="btn btn--primary">Plan een kennismaking</a>' +
        '</div>'
      );
    }

    function openModal(id) {
      var project = getProjectById(id);
      if (!project || !modalOverlay || !modalContent) return;
      modalContent.innerHTML = modalTemplate(project);
      refreshDynamicContent(modalContent);
      modalOverlay.classList.add('is-open');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-lock-scroll');
      lastFocused = document.activeElement;
      if (modalCloseBtn) modalCloseBtn.focus();
      if (focusTrap) focusTrap.activate();
      history.replaceState(null, '', '#' + id);
    }

    function closeModal() {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('is-open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-lock-scroll');
      if (focusTrap) focusTrap.deactivate();
      history.replaceState(null, '', window.location.pathname + window.location.search);
      if (lastFocused) lastFocused.focus();
      if (modalContent) {
        // Anders speelt de video (met geluid) gewoon door op de achtergrond
        // nadat de modal al gesloten is.
        modalContent.querySelectorAll('video').forEach(function (video) {
          video.pause();
        });
      }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (event) {
        if (event.target === modalOverlay) closeModal();
      });
    }

    if (filterBar) {
      filterBar.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-filter]');
        if (!btn) return;
        applyFilter(btn.getAttribute('data-filter'));
      });
    }

    render();

    var params = new URLSearchParams(window.location.search);
    var requestedFilter = params.get('filter');
    if (requestedFilter && validCategories.indexOf(requestedFilter) !== -1) {
      applyFilter(requestedFilter);
    }

    var hashId = window.location.hash.replace('#', '');
    if (hashId && getProjectById(hashId)) {
      openModal(hashId);
    }
  }

  /* ------------------------------------------------------------------
     Behind-the-scenes galerij met lightbox (over-ons.html).
     ------------------------------------------------------------------ */
  function initBtsGallery() {
    var gallery = document.querySelector('[data-bts-gallery]');
    var lightbox = document.querySelector('[data-lightbox]');
    if (!gallery || !lightbox) return;

    var items = Array.prototype.slice.call(gallery.querySelectorAll('[data-bts-trigger]'));
    if (!items.length) return;

    var figure = lightbox.querySelector('[data-lightbox-figure]');
    var img = lightbox.querySelector('[data-lightbox-image]');
    var closeBtn = lightbox.querySelector('[data-lightbox-close]');
    var prevBtn = lightbox.querySelector('[data-lightbox-prev]');
    var nextBtn = lightbox.querySelector('[data-lightbox-next]');
    if (!figure || !img || !closeBtn) return;

    var currentIndex = 0;
    var lastFocused = null;
    var focusTrap = createFocusTrap(lightbox, { onEscape: close });

    function openAt(index) {
      currentIndex = (index + items.length) % items.length;
      var trigger = items[currentIndex];
      var sourceImg = trigger.querySelector('img');
      var isMissing = trigger.classList.contains('is-missing');
      figure.classList.toggle('is-missing', isMissing);
      if (isMissing || !sourceImg) {
        img.removeAttribute('src');
        img.alt = '';
      } else {
        img.src = sourceImg.currentSrc || sourceImg.src;
        img.alt = sourceImg.alt || '';
      }
      lightbox.classList.add('is-open');
      lastFocused = document.activeElement;
      closeBtn.focus();
      focusTrap.activate();
      document.body.classList.add('has-lock-scroll');
    }

    function close() {
      lightbox.classList.remove('is-open');
      focusTrap.deactivate();
      document.body.classList.remove('has-lock-scroll');
      if (lastFocused) lastFocused.focus();
    }

    function next() {
      openAt(currentIndex + 1);
    }

    function prev() {
      openAt(currentIndex - 1);
    }

    items.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openAt(index);
      });
    });

    closeBtn.addEventListener('click', close);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) close();
    });

    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    });
  }

  /* ------------------------------------------------------------------
     FAQ-accordion (contact.html).
     ------------------------------------------------------------------ */
  function initAccordion() {
    var accordion = document.querySelector('[data-accordion]');
    if (!accordion) return;

    var items = accordion.querySelectorAll('[data-accordion-item]');
    items.forEach(function (item) {
      var trigger = item.querySelector('[data-accordion-trigger]');
      var panel = item.querySelector('[data-accordion-panel]');
      if (!trigger || !panel) return;

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function (other) {
          other.classList.remove('is-open');
          var otherTrigger = other.querySelector('[data-accordion-trigger]');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Contactformulier: client-side validatie en verzending.
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;

    var statusEl = form.querySelector('[data-form-status]');

    var validators = {
      name: function (value) {
        return value.trim().length > 1;
      },
      email: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      },
      phone: function (value) {
        return value.trim() === '' || /^[0-9+()\s-]{6,}$/.test(value.trim());
      },
      videoType: function (value) {
        return value.trim() !== '';
      },
      message: function (value) {
        return value.trim().length > 9;
      },
    };

    var errorMessages = {
      name: 'Vul je naam in.',
      email: 'Vul een geldig e-mailadres in.',
      phone: 'Controleer je telefoonnummer.',
      videoType: 'Kies het type video.',
      message: 'Vertel ons in minstens 10 tekens waar je hulp bij zoekt.',
    };

    function fieldWrapper(el) {
      return el.closest('.form-field');
    }

    function validateField(el) {
      var validator = validators[el.name];
      if (!validator) return true;
      var valid = validator(el.value);
      var wrapper = fieldWrapper(el);
      if (wrapper) {
        wrapper.classList.toggle('has-error', !valid);
        var errorEl = wrapper.querySelector('[data-error-for]');
        if (errorEl && errorMessages[el.name]) errorEl.textContent = errorMessages[el.name];
      }
      return valid;
    }

    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
    fields.forEach(function (el) {
      el.addEventListener('blur', function () {
        validateField(el);
      });
      el.addEventListener('input', function () {
        var wrapper = fieldWrapper(el);
        if (wrapper && wrapper.classList.contains('has-error')) validateField(el);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var allValid = fields.reduce(function (acc, el) {
        var valid = validateField(el);
        return acc && valid;
      }, true);

      if (!allValid) {
        showStatus('error', 'Controleer de gemarkeerde velden en probeer het opnieuw.');
        var firstError = form.querySelector(
          '.form-field.has-error input, .form-field.has-error select, .form-field.has-error textarea'
        );
        if (firstError) firstError.focus();
        return;
      }

      /**
       * TODO: koppel dit formulier aan Formspree of Netlify Forms.
       *
       * Formspree:
       * 1. Maak een formulier aan op formspree.io en kopieer het endpoint.
       * 2. Zet in contact.html het "action" attribuut van het formulier op
       *    het Formspree-endpoint en method op "POST".
       * 3. Vervang simulateSubmit() hieronder door een fetch() naar dat
       *    endpoint, of verwijder event.preventDefault() hierboven zodat
       *    het formulier normaal verstuurt.
       *
       * Netlify Forms:
       * 1. Zet data-netlify="true" en een verborgen form-name input in het
       *    <form>-element in contact.html (zie het commentaar daar).
       * 2. Verwijder event.preventDefault() hierboven zodat Netlify de
       *    normale formulierverzending kan afvangen.
       *
       * Zolang er geen endpoint is gekoppeld, simuleert onderstaande code
       * een geslaagde verzending zodat de flow te testen is.
       */
      simulateSubmit();
    });

    function simulateSubmit() {
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');
      window.setTimeout(function () {
        showStatus('success', 'Bedankt voor je bericht. We reageren binnen 1 werkdag.');
        form.reset();
        form.querySelectorAll('.form-field').forEach(function (field) {
          field.classList.remove('has-error');
        });
        if (submitBtn) submitBtn.removeAttribute('disabled');
      }, 600);
    }

    function showStatus(type, message) {
      if (!statusEl) return;
      var icon = type === 'success' ? 'check-circle-2' : 'alert-circle';
      statusEl.innerHTML = '<i data-lucide="' + icon + '"></i><span>' + message + '</span>';
      statusEl.className = 'form-status is-visible form-status--' + type;
      statusEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
      renderIcons();
      statusEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }
})();
