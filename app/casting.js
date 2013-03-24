(function() {
  var casting = function(options) {
    this.seasons = {};
    this.charData = [];
    this.initialize(options);

  }

  casting.prototype.EPISODE_LIST = [
    [
      '1_1',
      '1_2',
      '1_3',
      '1_4',
      '1_5',
      '1_6',
      '1_7',
      '1_8',
      '1_9',
      '1_10'
    ],
    [
      '2_1',
      '2_2',
      '2_3',
      '2_4',
      '2_5',
      '2_6',
      '2_7',
      '2_8',
      '2_9',
      '2_10'
    ],
    [
      '3_1'
    ]
  ]
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
      for(var n = 0, l = self.EPISODE_LIST.length; n < l; n++) {
        for(var m = 0, ll = self.EPISODE_LIST[n].length; m < ll; m++) {
          promises.push(self.loadSeason(self.EPISODE_LIST[n][m]));
          self.seasons['season'+self.EPISODE_LIST[n][m]] = [];
        }
      }
      promises.push();
      $.when.apply(self, promises)
      .done(function() {
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
