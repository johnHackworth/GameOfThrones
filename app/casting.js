(function() {
  var casting = function(options) {
    this.seasons = {
      season1_0: [],
      season1_1: []

    }
    this.initialize(options);

  }

  casting.prototype.loadSeason = function(n) {
    var dfd = $.Deferred();
    var self = this;
    $.ajax({
      url: './data/season'+n+'.json',
      dataType: 'json',
      success: function(res) {
        self.importSeason(n, res);
        dfd.resolve();
      },
      error: function(err) {
        console.log(err);
        dfd.fail(err)
      }
    });
    return dfd.promise();
  }

  casting.prototype.initialize = function(options) {
    var dfd = $.Deferred();
    var self = this;
    var promises = [];
    for(var n = 0; n<2; n++) {
      promises.push(this.loadSeason('1_'+n));
    }
    $.when.apply(this, promises)
    .done(function() {
      dfd.resolve();
    })
    .fail(function() {
      dfd.reject();
    });
    this.initialized = dfd.promise();
  }

  casting.prototype.importSeason = function(nSeason, seasonCharacters) {
    var seasonName = 'season'+nSeason;
    for(var n in seasonCharacters) {
      var char = new Character(seasonCharacters[n]);
      this.seasons[seasonName].push(char);
    }
  }

  window.Casting = casting;
})()
