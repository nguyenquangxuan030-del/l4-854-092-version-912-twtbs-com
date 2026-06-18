
(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function setupCurrentYear() {
    var nodes = document.querySelectorAll("[data-current-year]");
    nodes.forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function uniqueSorted(values) {
    return values
      .filter(Boolean)
      .filter(function (value, position, array) {
        return array.indexOf(value) === position;
      })
      .sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-CN");
      });
  }

  function setupMovieBrowser() {
    var browsers = document.querySelectorAll("[data-movie-browser]");

    browsers.forEach(function (browser) {
      var cards = Array.prototype.slice.call(browser.querySelectorAll(".movie-card"));
      var searchInput = browser.querySelector("[data-search-input]");
      var yearFilter = browser.querySelector("[data-year-filter]");
      var regionFilter = browser.querySelector("[data-region-filter]");
      var counter = browser.querySelector("[data-result-count]");

      if (!cards.length) {
        return;
      }

      if (yearFilter) {
        uniqueSorted(cards.map(function (card) {
          return card.getAttribute("data-year");
        })).forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearFilter.appendChild(option);
        });
      }

      if (regionFilter) {
        uniqueSorted(cards.map(function (card) {
          return card.getAttribute("data-region");
        })).forEach(function (region) {
          var option = document.createElement("option");
          option.value = region;
          option.textContent = region;
          regionFilter.appendChild(option);
        });
      }

      function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !year || card.getAttribute("data-year") === year;
          var matchesRegion = !region || card.getAttribute("data-region") === region;
          var show = matchesKeyword && matchesYear && matchesRegion;

          card.classList.toggle("is-hidden", !show);

          if (show) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visible);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }

      if (regionFilter) {
        regionFilter.addEventListener("change", applyFilters);
      }

      applyFilters();
    });
  }

  function setupHomeSearchQuery() {
    var browser = document.querySelector("[data-movie-browser]");
    var input = browser ? browser.querySelector("[data-search-input]") : null;
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (input && query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");

    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player-shell]");

    if (!shell) {
      return;
    }

    var video = shell.querySelector("video[data-src]");
    var trigger = shell.querySelector("[data-play-trigger]");
    var status = shell.querySelector("[data-player-status]");
    var hls = null;

    if (!video || !trigger) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var source = video.getAttribute("data-src");

      if (!source) {
        setStatus("未找到播放源。请检查当前影片的 data-src。 ");
        return;
      }

      shell.classList.add("is-loading");
      setStatus("正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().then(function () {
          shell.classList.add("is-playing");
          setStatus("正在播放");
        }).catch(function (error) {
          setStatus("浏览器阻止了自动播放，请再次点击播放器。" + (error && error.message ? " " + error.message : ""));
        });
        return;
      }

      loadHlsLibrary(function () {
        if (window.Hls && window.Hls.isSupported()) {
          if (hls) {
            hls.destroy();
          }

          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              shell.classList.add("is-playing");
              setStatus("正在播放");
            }).catch(function (error) {
              setStatus("播放已准备好，请点击视频控件开始。" + (error && error.message ? " " + error.message : ""));
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，可检查网络或 m3u8 地址。错误类型：" + data.type);
            }
          });
        } else {
          video.src = source;
          video.play().catch(function () {
            window.open(source, "_blank", "noopener");
          });
        }
      });
    }

    trigger.addEventListener("click", playVideo);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        setStatus("已暂停");
      }
    });
  }

  ready(function () {
    setupCurrentYear();
    setupMobileMenu();
    setupHeroSlider();
    setupMovieBrowser();
    setupHomeSearchQuery();
    setupPlayer();
  });
})();
