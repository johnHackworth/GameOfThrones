(function() {
  var character = function(options) {
    this.initialize(options)
  }

  character.prototype.initialize = function(options) {
    this.portrait = options.portrait;
    this.name = options.name;
    this.dead = options.dead;
    this.alias = options.alias;
    this.house = options.house;
    this.bio = options.bio;
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

  window.Character = character;

})()
