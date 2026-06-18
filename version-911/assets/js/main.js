(function () {
    'use strict';

    var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    var hlsLoadPromise = null;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadScriptOnce(src) {
        if (window.Hls) {
            return Promise.resolve();
        }
        if (hlsLoadPromise) {
            return hlsLoadPromise;
        }
        hlsLoadPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error('HLS 库加载失败'));
            };
            document.head.appendChild(script);
        });
        return hlsLoadPromise;
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = toggle.classList.toggle('is-open');
            panel.hidden = !isOpen;
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var year = panel.querySelector('[data-filter-year]');
            var type = panel.querySelector('[data-filter-type]');
            var category = panel.querySelector('[data-filter-category]');
            var container = panel.parentElement.querySelector('[data-filter-results]');
            var count = panel.querySelector('[data-filter-count]');
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));

            function apply() {
                var keyword = normalize(input && input.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var selectedCategory = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden-by-filter', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
                }
            }

            [input, year, type, category].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });
            apply();
        });
    }

    function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a href="' + escapeHtml(item.url) + '">',
            '        <div class="poster-frame">',
            '            <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.closest(\'.poster-frame\').classList.add(\'image-missing\')">',
            '            <div class="poster-fallback"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</small></div>',
            '            <div class="poster-shade"></div>',
            '            <div class="card-tags">' + tags + '</div>',
            '            <span class="poster-play" aria-hidden="true">▶</span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(item.title) + '</h3>',
            '            <p>' + escapeHtml(item.oneLine || item.summary || '') + '</p>',
            '            <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var data = window.MOVIE_SEARCH_DATA;
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var form = document.querySelector('[data-search-form]');
        if (!data || !results || !summary) {
            return;
        }
        var input = form ? form.querySelector('input[name="q"]') : null;
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function search(query) {
            var keyword = normalize(query);
            if (!keyword) {
                results.innerHTML = '';
                summary.textContent = '请输入关键词开始搜索。';
                return;
            }
            var matched = data.filter(function (item) {
                return normalize(item.searchText).indexOf(keyword) !== -1;
            }).slice(0, 120);
            summary.textContent = '“' + query + '” 找到 ' + matched.length + ' 条结果，最多展示前 120 条。';
            results.innerHTML = matched.map(cardTemplate).join('');
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value : '';
                var nextUrl = new URL(window.location.href);
                if (query) {
                    nextUrl.searchParams.set('q', query);
                } else {
                    nextUrl.searchParams.delete('q');
                }
                window.history.replaceState(null, '', nextUrl.toString());
                search(query);
            });
        }
        if (input) {
            input.addEventListener('input', function () {
                search(input.value);
            });
        }
        search(initial);
    }

    function setupPlayers() {
        document.querySelectorAll('[data-video-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-video-play]');
            var status = shell.querySelector('[data-video-status]');
            var src = shell.getAttribute('data-video-src');
            var hlsInstance = null;
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function initialize() {
                if (initialized) {
                    return Promise.resolve();
                }
                initialized = true;
                setStatus('正在初始化 HLS 播放源...');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    shell.classList.add('is-ready');
                    setStatus('已使用浏览器原生 HLS 播放能力。');
                    return Promise.resolve();
                }

                return loadScriptOnce(HLS_CDN).then(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            shell.classList.add('is-ready');
                            setStatus('m3u8 播放源加载完成。');
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus('播放源加载失败，请稍后重试或更换浏览器。');
                            }
                        });
                        return;
                    }
                    throw new Error('当前浏览器不支持 HLS 播放');
                }).catch(function (error) {
                    initialized = false;
                    setStatus(error.message || '播放器初始化失败');
                    throw error;
                });
            }

            function play() {
                initialize().then(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {
                            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
                        });
                    }
                }).catch(function () {
                    shell.classList.remove('is-ready');
                });
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                setStatus('正在播放：' + (shell.getAttribute('data-video-title') || '当前影片'));
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
                setStatus('播放结束。');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayers();
    });
}());
