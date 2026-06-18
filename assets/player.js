function createVideoPlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var ready = false;
  var hlsInstance = null;

  if (!video || !overlay) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function startPlayback() {
    prepare();
    overlay.classList.add('is-hidden');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
