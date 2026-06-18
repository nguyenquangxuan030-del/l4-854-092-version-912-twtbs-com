(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-cards]'));
  filterInputs.forEach(function (input) {
    var targetSelector = input.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : document;
    var cards = target ? Array.prototype.slice.call(target.querySelectorAll('.movie-card')) : [];

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || card.textContent.toLowerCase();
        card.classList.toggle('hidden-card', query && text.indexOf(query) === -1);
      });
    });
  });

  var searchPanel = document.querySelector('[data-search-panel]');
  var searchResults = document.querySelector('[data-search-results]');
  var closeSearch = document.querySelector('[data-search-close]');
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
  var searchData = Array.isArray(window.SITE_SEARCH_DATA) ? window.SITE_SEARCH_DATA : [];

  function renderSearch(query) {
    if (!searchPanel || !searchResults) {
      return;
    }

    var clean = query.trim().toLowerCase();
    if (!clean) {
      searchPanel.hidden = true;
      return;
    }

    var matches = searchData.filter(function (item) {
      return item.search.indexOf(clean) !== -1;
    }).slice(0, 12);

    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-empty">未找到匹配内容</div>';
    } else {
      searchResults.innerHTML = matches.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>' +
          '</a>';
      }).join('');
    }

    searchPanel.hidden = false;
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input.value);
    });

    input.addEventListener('focus', function () {
      renderSearch(input.value);
    });
  });

  if (closeSearch && searchPanel) {
    closeSearch.addEventListener('click', function () {
      searchPanel.hidden = true;
      searchInputs.forEach(function (input) {
        input.value = '';
      });
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && searchPanel) {
      searchPanel.hidden = true;
    }
  });
})();
