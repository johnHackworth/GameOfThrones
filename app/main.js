(function() {
  $(document).ready(function() {
    // alert('a'   )
    window.casting = new Casting();
    $.when(window.casting.initialized)
    .done(function() {
      window.board = new Board({
        characters: window.casting,
        selector: "#main"
      })
      var lastEpisode = localStorage.getItem('episode');
      if(lastEpisode) {
        board.season = lastEpisode.split('_')[0];
        board.episode = lastEpisode.split('_')[1];
      }
      window.board.initializeBoard();
    });

  });
})()
