(function() {
  var casting = function(options) {
    this.seasons = {
      season1_1: [],
      season1_2: []

    }
    this.charData = [];
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

  casting.prototype.loadBios = function() {
    var dfd = $.Deferred();
    var self = this;
    $.ajax({
      url: './data/bios.json',
      dataType: 'json',
      success: function(res) {
        self.importBios(res);
        dfd.resolve();
      },
      error: function(err) {
        console.log(err);
        dfd.fail(err)
      }
    });
    return dfd.promise();
  }

  casting.prototype.importBios = function(res) {
    this.charData = res;
  }

  casting.prototype.initialize = function(options) {
    var dfd = $.Deferred();
    var self = this;
    var promises = [];
    $.when(this.loadBios())
    .done(function() {
      for(var n = 1; n<3; n++) {
        promises.push(self.loadSeason('1_'+n));
      }
      promises.push();
      $.when.apply(self, promises)
      .done(function() {
        console.log(self.charData);
        dfd.resolve();
      })
      .fail(function() {
        dfd.reject();
      });
    })
    this.initialized = dfd.promise();
  }

  casting.prototype.importSeason = function(nSeason, seasonCharacters) {
    var seasonName = 'season'+nSeason;
    for(var n in seasonCharacters) {
      var char = new Character(seasonCharacters[n], this.charData);
      this.seasons[seasonName].push(char);
    }
  }

  window.Casting = casting;
})()
