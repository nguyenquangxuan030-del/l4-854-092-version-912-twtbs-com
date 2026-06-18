(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var source = box.getAttribute('data-src');
    var started = false;
    var hls = null;

    function play() {
      if (!video || !source) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      video.play().catch(function () {});
    }

    function attach() {
      if (started || !video || !source) {
        play();
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          play();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = source;
      play();
    }

    if (cover) {
      cover.addEventListener('click', attach);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          attach();
        }
      });
    }
  });
})();
