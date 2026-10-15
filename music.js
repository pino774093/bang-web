(() => {
  const tracks = [
    'assets/sound/Card%20Table%20Duel.mp3',
    'assets/sound/Saloon%20at%20Dusk%20%281%29.mp3'
  ];
  const player = new Audio();
  player.preload = 'auto';
  player.volume = 0.4;
  player.loop = false;
  let index = 0, wantsPlayback = false, playRequest = 0;

  function playTrack(trackIndex) {
    index = trackIndex % tracks.length;
    const request = ++playRequest;
    player.src = tracks[index];
    player.load();
    const result = player.play();
    result?.catch(() => {
      // Keep the playlist intent so a later user gesture can resume playback.
      if (request !== playRequest) return;
    });
  }

  player.addEventListener('ended', () => {
    if (!wantsPlayback) return;
    playTrack((index + 1) % tracks.length);
  });

  window.BangMusic = {
    start() {
      wantsPlayback = true;
      if (!player.paused) return;
      playTrack(index);
    }
  };
})();
