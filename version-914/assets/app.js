(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var activeFilter = 'all';

    function applyFilter() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';

        filterCards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var category = card.getAttribute('data-category') || '';
            var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchesFilter = activeFilter === 'all' || type === activeFilter || category === activeFilter;

            card.classList.toggle('is-hidden', !(matchesKeyword && matchesFilter));
        });
    }

    if (filterInput && filterCards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            filterInput.value = query;
        }

        filterInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-chip') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilter();
        });
    });

    if (filterCards.length) {
        applyFilter();
    }

    var video = document.getElementById('movie-player');
    var playButton = document.querySelector('[data-play-trigger]');

    if (video && playButton) {
        var streamUrl = playButton.getAttribute('data-video');
        var ready = false;
        var hlsInstance = null;

        function loadAndPlay() {
            if (!ready) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }

                ready = true;
            }

            playButton.classList.add('is-hidden');
            video.play().catch(function () {});
        }

        playButton.addEventListener('click', loadAndPlay);

        video.addEventListener('click', function () {
            if (video.paused) {
                loadAndPlay();
            }
        });

        video.addEventListener('play', function () {
            playButton.classList.add('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
