(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.hasAttribute("hidden");
      if (open) {
        nav.removeAttribute("hidden");
      } else {
        nav.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function movieMatches(movie, query) {
    var text = [
      movie.title,
      movie.region,
      movie.year,
      movie.genre,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(" ")
    ].join(" ");
    return normalize(text).indexOf(query) !== -1;
  }

  function renderResults(box, list) {
    if (!box) {
      return;
    }
    if (!list.length) {
      box.innerHTML = '<div class="search-result"><span></span><div><strong>没有匹配影片</strong><span>换个关键词试试</span></div></div>';
      box.removeAttribute("hidden");
      return;
    }
    box.innerHTML = list.slice(0, 8).map(function (movie) {
      return [
        '<a class="search-result" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeAttr(movie.title) + '">',
        '<div><strong>' + escapeHtml(movie.title) + '</strong>',
        '<span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span></div>',
        '</a>'
      ].join("");
    }).join("");
    box.removeAttribute("hidden");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".global-search"));
    if (!inputs.length || typeof MOVIES === "undefined") {
      return;
    }

    inputs.forEach(function (input) {
      var wrap = input.closest(".search-box");
      var results = wrap ? wrap.querySelector(".search-results") : null;
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        if (!query) {
          if (results) {
            results.setAttribute("hidden", "");
            results.innerHTML = "";
          }
          return;
        }
        renderResults(results, MOVIES.filter(function (movie) {
          return movieMatches(movie, query);
        }));
      });
      document.addEventListener("click", function (event) {
        if (wrap && !wrap.contains(event.target) && results) {
          results.setAttribute("hidden", "");
        }
      });
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector(".filter-input");
    var grid = document.querySelector(".filter-grid");
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var match = normalize(card.getAttribute("data-search")).indexOf(query) !== -1;
        card.classList.toggle("is-filter-hidden", query && !match);
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilter();
  });
})();

function initVideoPlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var wrap = document.querySelector("[data-player]");
  if (!video || !wrap || !streamUrl) {
    return;
  }

  var cover = wrap.querySelector(".player-cover");
  var loading = wrap.querySelector(".player-loading");
  var errorBox = wrap.querySelector(".player-error");
  var hls = null;

  function setLoading(show) {
    if (!loading) {
      return;
    }
    if (show) {
      loading.removeAttribute("hidden");
    } else {
      loading.setAttribute("hidden", "");
    }
  }

  function setError(show) {
    if (!errorBox) {
      return;
    }
    if (show) {
      errorBox.removeAttribute("hidden");
    } else {
      errorBox.setAttribute("hidden", "");
    }
  }

  function startPlayback() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  setLoading(true);
  setError(false);

  if (window.Hls && window.Hls.isSupported()) {
    hls = new window.Hls({
      enableWorker: true,
      backBufferLength: 90
    });
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      setLoading(false);
    });
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setLoading(false);
        setError(true);
        if (hls) {
          hls.destroy();
        }
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
    video.addEventListener("loadedmetadata", function () {
      setLoading(false);
    });
  } else {
    setLoading(false);
    setError(true);
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });
  video.addEventListener("playing", function () {
    setLoading(false);
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
}
