(function() {
  var character = function(options, bios) {
    this.initialize(options, bios)
  }

  character.prototype.initialize = function(options, bios) {
    this.name = options.name;
    this.dead = options.dead;
    this.king = options.king;

    var bioData = this.locateCharacterInfo(bios);
    this.portrait = bioData.portrait;
    this.bio = bioData.bio;
    this.picture = bioData.picture;
    this.house = bioData.house;
    this.organization = bioData.organization;
    this.alias = bioData.alias;


    this.parents = options.parents || [];
    this.siblings = options.siblings || [];
    this.closeFriends = options.closeFriends || [];
    this.marriage = options.marriage || [];
    this.lovers = options.lovers || [];
    this.sons = options.sons || [];
    this.liege = options.liege || [];
    this.enemies = options.enemies || [];
    this.court = options.court || [];
  }

  character.prototype.locateCharacterInfo = function(bios) {
    for(var n = 0, l = bios.length; n < l; n++) {
      if(bios[n].name === this.name) {
        return bios[n];
      }
    }
  }

  window.Character = character;

})()
