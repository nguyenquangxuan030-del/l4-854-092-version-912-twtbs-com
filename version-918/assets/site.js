(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var next = hero.querySelector(".hero-next");
    var prev = hero.querySelector(".hero-prev");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".searchable-list"));
    if (!lists.length) {
      return;
    }
    var keyword = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    var category = document.querySelector("[data-filter-category]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && keyword) {
      keyword.value = q;
    }

    function value(el) {
      return el ? el.value.trim().toLowerCase() : "";
    }

    function apply() {
      var text = value(keyword);
      var regionValue = value(region);
      var yearValue = value(year);
      var typeValue = value(type);
      var categoryValue = value(category);
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.children).forEach(function (card) {
          var haystack = (card.getAttribute("data-title") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var ok = true;
          if (text && haystack.indexOf(text) === -1) {
            ok = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          if (categoryValue && haystack.indexOf(categoryValue) === -1) {
            ok = false;
          }
          card.classList.toggle("hidden-by-filter", !ok);
        });
      });
    }

    [keyword, region, year, type, category].forEach(function (el) {
      if (!el) {
        return;
      }
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });
    apply();
  }

  window.initMoviePlayer = function (url, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video) {
      return;
    }
    var player = video.closest(".movie-player");
    var attached = false;

    function start() {
      if (!attached) {
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      if (player) {
        player.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (player) {
        player.classList.add("is-playing");
      }
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
