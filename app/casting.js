(function() {
  var casting = function(options) {
    this.seasons = {
      season1: []
    }
    this.initialize(options);

  }

  casting.prototype.initialize = function(options) {
    var dfd = $.Deferred();
    var self = this;
    $.ajax({
      url: './data/season1.json',
      dataType: 'json',
      success: function(res) {
        self.importSeason(1, res);
        dfd.resolve();
      },
      error: function(err) {
        console.log(err);
        dfd.fail(err)
      }
    });
    this.initialized = dfd.promise();
  },

  casting.prototype.importSeason = function(nSeason, seasonCharacters) {
    var seasonName = 'season'+nSeason;
    for(var n in seasonCharacters) {
      var char = new Character(seasonCharacters[n]);
      this.seasons[seasonName].push(char);
    }
  }

  window.Casting = casting;
})()
