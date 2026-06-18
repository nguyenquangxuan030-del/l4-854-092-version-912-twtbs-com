(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = qs('[data-hero]');

    if (hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        qsa('[data-hero-prev]', hero).forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        });

        qsa('[data-hero-next]', hero).forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function applyCardFilter(form) {
        var scope = document;
        var input = qs('[data-filter-query]', form);
        var year = qs('[data-filter-year]', form);
        var region = qs('[data-filter-region]', form);
        var type = qs('[data-filter-type]', form);
        var cards = qsa('.movie-card', scope);
        var empty = qs('[data-filter-empty]');

        function update() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || '',
                    card.dataset.region || '',
                    card.dataset.type || '',
                    card.dataset.year || '',
                    card.dataset.tags || ''
                ].join(' ').toLowerCase();
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (yearValue && card.dataset.year !== yearValue) {
                    matched = false;
                }

                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }

                if (typeValue && card.dataset.type !== typeValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        qsa('input, select', form).forEach(function (field) {
            field.addEventListener('input', update);
            field.addEventListener('change', update);
        });

        update();
    }

    qsa('[data-card-filter]').forEach(applyCardFilter);

    function attachStream(video, stream, done) {
        if (!stream) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsPlayer) {
                video._hlsPlayer.destroy();
            }

            var hls = new window.Hls({
                maxBufferLength: 28,
                lowLatencyMode: true
            });

            video._hlsPlayer = hls;
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                done();
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', done, { once: true });
            return;
        }

        video.src = stream;
        done();
    }

    qsa('[data-player]').forEach(function (player) {
        var video = qs('video', player);
        var cover = qs('.player-cover', player);
        var button = qs('.play-button', player);
        var stream = player.dataset.stream || '';
        var started = false;

        function start() {
            if (!video || !stream) {
                return;
            }

            function playNow() {
                if (cover) {
                    cover.classList.add('hidden');
                }

                video.controls = true;
                var promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (!started) {
                started = true;
                attachStream(video, stream, playNow);
            } else {
                playNow();
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                start();
            });
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    });
})();
