(function() {
  var board = function(options) {
    this.visibleChars = {};
    this.portraitWidth = 100;
    this.portraitHeight = 100;
    this.margin = 30;

    this.initialize(options);
  }

  board.prototype.initialize = function(options) {
    this.characters = options.characters;
    this.selector = options.selector;
    this.maxX = Math.floor(window.innerWidth / (this.portraitWidth + this.margin));
    this.maxY = Math.floor(window.innerHeight / (this.portraitHeight + this.margin));
    this.initEmptyPositions();
  }

  board.prototype.initEmptyPositions = function() {
    this.filledPositions = [];
    for(var n = 0; n < this.maxY; n++) {
      this.filledPositions[n] = [];
      for(var m = 0; m < this.maxX; m++) {
        this.filledPositions[n][m] = null;
      }
    }
  }

  board.prototype.initializeBoard = function() {
    this.svg = d3.select(this.selector).append("svg");

  }

  board.prototype.initializeSeason = function(nSeason) {
    var seasonName = 'season' + nSeason;
    var chars = this.characters.seasons[seasonName];
    for(var n in chars) {
      this.drawCharacter(chars[n]);
    }
  }

  board.prototype.isCentric = function(x, y) {
    var center = this.calculateCenter();
    return ( Math.abs(x - center.x) <= 2 ) && ( Math.abs(y - center.y) <= 2 );
  }

  board.prototype.isInLimits = function(x, y) {
    return (
      (x >= 0) &&
      (x < this.maxX) &&
      (y >= 0) &&
      (y < this.maxY)
    )
  }

  board.prototype.clearCentric = function() {
    var center = this.calculateCenter();
    for(var n = -2; n <= 2; n++) {
      for(var m = -2; m <= 2; m++) {
        if(!(m===0 && n ===0) && this.isInLimits(center.x + m, center.y + n)) {
          var charname = this.filledPositions[center.y + n][center.x + m];
          if(charname) {
            var previousChar = this.visibleChars[charname];
            this.moveCharTo(previousChar, this.getPosition());
          }
        }
      }
    }
  }

  board.prototype.getPosition = function() {

    for(var n = 0; n < this.maxY; n++) {
      for(var m = 0; m < this.maxX; m++) {
        if(this.filledPositions[n][m] == null && !this.isCentric(m,n) ) {
          return {x: m, y: n}
        }
      }
    }
    return {x:0, y:0}
  }

  board.prototype.tokenize = function(name) {
    return name.replace(" ","_");
  }

  board.prototype.drawCharacters = function (nSeason) {
    var seasonName = 'season' + nSeason;
    var chars = this.characters.seasons[seasonName];
    for(var n in chars) {
      if(!chars[n].pos) {
        var position = this.getPosition();
        this.filledPositions[position.y][position.x] = chars[n].name;
        chars[n].pos = position;
      }
    }
  }

  board.prototype.redrawCharacter = function(character) {
    var self = this;
    var view = $(this.svg.selectAll('.'+this.tokenize(character))[0]).parent().detach();
    view.appendTo($('svg'));
    this.visibleChars[character].view = view;
  }

  board.prototype.redrawAll = function() {
    for(var n in this.visibleChars) {
      this.redrawCharacter(this.visibleChars[n].name);
    }
  }

  board.prototype.drawCharacter = function(character) {
    var self = this;
    this.visibleChars[character.name] = character,
    character.view = this.svg.append("g")
      .attr("class", "charP")
      .attr("name", character.name);
    var position = this.getPosition();
    this.filledPositions[position.y][position.x] = character.name;
    character.pos = {x:position.x,y:position.y};
    this.visibleChars[character.name]
    character.view

      .append("foreignObject")

        .attr("x", position.x * (this.portraitWidth + this.margin))
        .attr("width", this.portraitWidth)
        .attr("y",position.y * (this.portraitHeight + this.margin))
        .attr("height", this.portraitHeight)
        .attr("class", this.tokenize(character.name))
      .append("xhtml:body")
        .html("<img class='portrait' src='"+ character.portrait +"'> </img>");


        // .append('svg:image')
        // .attr("class", "charPortrait")
        // .attr("class", this.tokenize(character.name))
        // .attr("xlink:href", character.portrait)
        // .attr("x", position.x * (this.portraitWidth + this.margin))
        // .attr("width", this.portraitWidth)
        // .attr("y",position.y * (this.portraitHeight + this.margin))
        // .attr("height", this.portraitHeight)

    $(character.view).data('name', character.name)
    character.view.data = character;
    character.view.on('click', function() {
      console.log('aaa')
      self.clickPortrait(this);
    });
  },

  board.prototype.calculateCenter = function() {
    var middlePoint = window.innerWidth / 2;
    var rows = window.innerWidth / (this.portraitWidth + this.margin)
    var cols = window.innerHeight / (this.portraitHeight + this.margin)
    var middleRow = Math.floor(rows / 2);
    var middleCol = Math.floor(cols / 2)
    return {x: middleRow, y: middleCol};
  }

  board.prototype.clickPortrait = function(char) {
    this.selectCharacter(char);
  }

  board.prototype.selectCharacter = function(char) {
    var center = this.calculateCenter();
    var character = this.visibleChars[$(char).attr('name')];
    this.clearCentric();

    this.moveCharTo(character, center);

    this.placeFamily(character);
    this.paintRelations(character);
    this.redrawAll();
  }

  board.prototype.moveCharTo = function(char, position) {
    var previousOccuper = this.filledPositions[position.y][position.x]
    var id = this.tokenize(char.name);
    this.svg.selectAll('.' + id).transition()
      .attr('x', position.x * (this.portraitWidth + this.margin) )
      .attr('y', position.y * (this.portraitHeight + this.margin) )

    if(char.pos) {
      this.filledPositions[char.pos.y][char.pos.x] = null;
    }
    this.filledPositions[position.y][position.x] = char.name;
    char.pos = position;

    if(previousOccuper) {
      var previousChar = this.visibleChars[previousOccuper];
      previousChar.pos = null;
      this.moveCharTo(previousChar, this.getPosition());
    }
  }

  board.prototype.iterateRelation =  function(relations, x, y) {
    var center = this.calculateCenter();
    for(var n in relations) {
      var chararcter = this.visibleChars[relations[n]];
      if(center.x + x < 0) x = center.x + x;
      if(center.y + y < 0) y = center.y + y;
      this.moveCharTo(chararcter, {x: center.x + x, y: center.y + y});
      x = x + 1;
      if(x > 2) {
        x = -2;
        y = y + 1;
      }
      if(x === 0 && y === 0) { x = 1 };
    }
    return {x: x, y: y}
  }

  board.prototype.placeFamily = function(char) {
    var nextPosition = {x: -2, y : -2};
    nextPosition = this.iterateRelation(char.siblings, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.parents, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.closeFriends, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.marriage, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.lovers, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.sons, nextPosition.x, nextPosition.y);
  }

  board.prototype.clearRelations = function() {
    this.svg.selectAll('path').data([]).exit().remove()
  }

  board.prototype.drawLine = function(char, destinations, relationClass) {
    var self = this;
    var relationPositions = {
      "parent": 0,
      "sibling": -20,
      "friend": -10,
      "lover": 10,
      "spouse": 20,
      "son": 30
    };
    var line = d3.svg.line()
      .x(function(d){
        var position = d.pos.x * (self.portraitWidth + self.margin) +(self.portraitWidth ) /2;
        return position;
      })
      .y(function(d){
        var position = relationPositions[relationClass] + d.pos.y * (self.portraitHeight + self.margin) +(self.portraitHeight + self.margin) /2
        return position;
      })
      .interpolate('basis')
      .tension(0.9);
    var path = this.svg.selectAll('path.'+relationClass)
      .data(destinations).enter()
      .append('path')
      .attr("transform", null)
      .attr('d', function(d) {
        var chars = [char];
        var character = self.visibleChars[d];
        var middlePoint = { pos: {
            x:  char.pos.x,
            y: (character.pos.y + char.pos.y) / 2
          }
        }
        if(middlePoint.pos.y === char.pos.y &&
          middlePoint.pos.y === character.pos.y &&
          Math.abs(character.pos.x - char.pos.x) >= 2
        ) {
          middlePoint.pos.y += 0.4;
        }

        chars.push(middlePoint);
        chars.push(character);
        return line(chars)
      })
      .attr('class', relationClass);
    if(path.node()) {
      var totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray",  totalLength*3 + " " + totalLength*3)
        .attr("stroke-dashoffset", totalLength*3)
        .transition().duration(800).delay(100)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
    }
  }

  board.prototype.paintRelations = function(char) {
    var self = this;

    this.clearRelations();

    if(char.siblings.length > 0) {
      this.drawLine(char, char.siblings, "sibling")
    }
    if(char.parents.length > 0) {
      this.drawLine(char, char.parents, "parent");
    }
    if(char.closeFriends.length > 0) {
      this.drawLine(char, char.closeFriends, "friend");
    }
    if(char.sons.length > 0) {
      console.log(char.sons);
      this.drawLine(char, char.sons, "son");
    }
    if(char.lovers.length > 0) {
      this.drawLine(char, char.lovers, "lover");
    }
    if(char.marriage.length > 0) {
      this.drawLine(char, char.marriage, "spouse");
    }
    // this.svg.selectAll('line').data(char.siblings).enter()
    //   .append('line')
    //   .attr('x1', (char.pos.x * (this.portraitWidth + this.margin)) +(this.portraitWidth + this.margin) /2)
    //   .attr('y1', (char.pos.y * (this.portraitHeight + this.margin))+(this.portraitHeight + this.margin) /2)
    //   .attr('x2', (char.pos.x * (this.portraitWidth + this.margin)) +(this.portraitWidth + this.margin) /2)
    //   .attr('y2', (char.pos.y * (this.portraitHeight + this.margin))+(this.portraitHeight + this.margin) /2)
    //   .transition().duration(600).delay(30)
    //   .attr('x2', function(d) {
    //     console.log(d);
    //     var character = self.visibleChars[d];
    //     return character.pos.x * (self.portraitWidth + self.margin) +(self.portraitWidth + self.margin) /2;
    //   })
    //   .attr('y2', function(d) {
    //     var character = self.visibleChars[d];
    //     return character.pos.y * (self.portraitHeight + self.margin) +(self.portraitHeight + self.margin) /2;
    //   })
  }

  window.Board = board;
})()
