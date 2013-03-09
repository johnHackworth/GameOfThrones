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
      window.board.initializeBoard('1_0');
    });

  });
})()
