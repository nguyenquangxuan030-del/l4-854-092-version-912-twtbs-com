(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.getElementById('siteNav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }
      start();
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var input = filterForm.querySelector('input[name="q"]');
    var region = filterForm.querySelector('select[name="region"]');
    var type = filterForm.querySelector('select[name="type"]');
    var year = filterForm.querySelector('select[name="year"]');
    var params = new URLSearchParams(window.location.search);
    var initialQ = params.get('q');

    if (initialQ && input) {
      input.value = initialQ;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var q = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (regionValue && normalize(card.dataset.region) !== regionValue) {
          ok = false;
        }
        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          ok = false;
        }
        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, applyFilter);
    });

    filterForm.addEventListener('reset', function () {
      setTimeout(applyFilter, 0);
    });

    applyFilter();
  }
})();
