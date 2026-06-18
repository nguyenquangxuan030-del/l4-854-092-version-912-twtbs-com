(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function initImages() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            });
        });
    }

    function initMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function initSearchForms() {
        var params = new URLSearchParams(window.location.search);
        var current = params.get('q') || '';
        document.querySelectorAll('.site-search input[name="q"]').forEach(function (input) {
            input.value = current;
        });
    }

    function initCardFilter() {
        var input = document.querySelector('[data-card-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var empty = document.querySelector('[data-search-empty]');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        input.addEventListener('input', apply);
        apply();
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var cover = box.querySelector('[data-play-button]');
            if (!video || !cover) {
                return;
            }
            var playUrl = video.getAttribute('data-play') || '';
            var hls = null;
            function attach() {
                if (!playUrl) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    if (!video.src) {
                        video.src = playUrl;
                    }
                } else if (window.Hls && window.Hls.isSupported()) {
                    if (!hls) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(playUrl);
                        hls.attachMedia(video);
                    }
                } else if (!video.src) {
                    video.src = playUrl;
                }
            }
            function play() {
                attach();
                cover.classList.add('is-hidden');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
            cover.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    ready(function () {
        initImages();
        initMobileMenu();
        initHero();
        initSearchForms();
        initCardFilter();
        initPlayers();
    });
})();
