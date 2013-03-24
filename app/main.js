(function() {
  $(document).ready(function() {

    $('.appInfo .first').on('click', function() {
      window.board.season = 1;
      window.board.episode = 1

      $('.appInfo').removeClass('show');
      window.board.initializeBoard();
    })
    $('.appInfo .last').on('click', function() {
      window.board.season = 1;
      window.board.episode = 2;
      $('.appInfo').removeClass('show');
      window.board.initializeBoard();
    })

    $('.moreInfo .close').on('click', function() {
      $('.moreInfo').removeClass('show');
    })

    $('.showMoreInfo').on('click', function() {
      $('.moreInfo').addClass('show');
    })
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
        var hasSeenInfo = localStorage.getItem('info');
        if(!hasSeenInfo) {
          $('.moreInfo').addClass('show');
          localStorage.setItem('info', true)
        }
        window.board.initializeBoard();
      } else {
        $('.appInfo').addClass('show');
      }
    });

  });
})()
