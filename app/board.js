(function() {

  var board = function(options) {
    this.visibleChars = {};
    this.correction = 0.8;
    this.totalWidth = window.innerWidth * this.correction;
    this.totalHeight = window.innerHeight;
    this.totalArea = this.totalWidth * this.totalHeight;
    var factor = 90 * 90
    if(this.totalArea > (1300*this.correction * 1300)) {
      factor = 130 * 130;
    } else if(this.totalArea > (1200*this.correction * 1200)) {
      factor = 115 * 115;
    } else if(this.totalArea > (1000*this.correction * 1000)) {
      factor = 105 * 105;
    } else if(this.totalArea > (900*this.correction * 800)) {
      factor = 90 * 90;
    } else if(this.totalArea > (800*this.correction * 600)) {
      factor = 85 * 85;
    } else {
      factor = 65 * 65;
    }
    this.cellSize = Math.floor(this.totalArea / factor);
    this.portraitWidth = Math.floor(this.cellSize * 2 / 3);
    this.portraitHeight = Math.floor(this.cellSize * 2 / 3);
    this.margin =  Math.floor(this.cellSize * 1 / 3);

    this.initialize(options);
  }



  board.prototype.initialize = function(options) {
    this.characters = options.characters;
    this.selector = options.selector;
    this.maxX = Math.floor(this.totalWidth / this.cellSize);
    // if(this.maxX % 2 === 0) {
    //   this.maxX--;
    // }
    this.maxY = Math.floor(this.totalHeight / this.cellSize);
    this.sideBar = $('.sideBar');
    this.sideBarBackground = $('.sideBarBackground');
    this.charTemplate = $('#characterTemplate').html();
    this.initEmptyPositions();
  }

  board.prototype.openSideBar = function() {
    this.sideBar.removeClass('closed');
    this.sideBarBackground.removeClass('closed');
    this.svg.classed('centered', false)
  }
  board.prototype.closeSideBar = function() {
    this.sideBar.addClass('closed');
    this.sideBarBackground.addClass('closed');
    this.svg.classed('centered', true)
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
    this.svg = d3.select(this.selector).append("svg")
    this.svg.attr('class', 'centered')
    // this.svg.append('defs')
    //   .append('rect')
    //   .attr('id', 'circleCropper')
    //   .attr('x', '25%').attr('y', '25%').attr('width', '50%')
    //   .attr('height', '50%').attr('rx', '15')
    // this.svg.append('clipPath')
    //   .attr('id', 'clip')
    //   .append('use')
    //   .attr('xlink:href', '#circleCropper')
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
    return ( Math.abs(x - center.x) <= 0) && ( Math.abs(y - center.y) <= 0 );
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
    var arrX = this.maxX;
    var arrY = this.maxY;
    var i = 0;
    var r = 0;
    var c = 0;
    var topE = arrX - 1;
    var topW = 0;
    var topS = arrY - 1;
    var topN = 1;
    var cc = 0;
    var route = [];
    var heading = "e";

    while(i < (arrX * arrY) -1) {
      if(this.filledPositions[c][r] == null && !this.isCentric(r,c) ) {
        return {x: r, y: c}
      }
      i++;
      if(heading === "e") {
        if(r < topE) {r++}
        else {
          heading = "s";
          c++;
          topE--;
        }
      } else if(heading === "s") {
        if(c < topS) {c++}
        else {
          heading = "w";
          r--;
          topS--;
        }
      } else if(heading === "w") {
        if(r > topW) {r--}
        else {
          heading = "n";
          c--;
          topW++;
        }
      } else if(heading === "n") {
        if(c > topN) {c--}
        else {
          heading = "e";
          r++;
          topN++;
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

    // character.view
    //   .append('use')
    //   .attr('xlink:href', '#circleCropper')
    //   .attr('stroke-width', 2)
    //   .attr('stroke', '#333333')

    var g = character.view
      .append('g')
      .attr("transform", "translate(" + (position.x * (this.portraitWidth + this.margin)) +
          "," + (position.y * (this.portraitHeight + this.margin)) + ")")
      .attr("class", this.tokenize(character.name))

    g.append('svg:image')
        .attr("xlink:href", character.portrait)
        // .attr("x", position.x * (this.portraitWidth + this.margin))
        .attr("width", this.portraitWidth)
        // .attr("y",position.y * (this.portraitHeight + this.margin))
        .attr("height", this.portraitHeight)

    if(character.organization) {
      g.append('svg:image')
        .attr("xlink:href", 'assets/houses/' + character.organization + '.png')
        .attr("x", (this.portraitWidth - this.portraitWidth / 3.5))
        .attr("width", Math.floor(this.portraitWidth / 3.5))
        .attr("y", (this.portraitHeight - this.portraitHeight/2.5))
        .attr("height", Math.floor(this.portraitHeight / 3.5))
        .attr("class", "heraldic");
    }
    if(character.house) {
      g.append('svg:image')
        .attr("xlink:href", 'assets/houses/' + character.house + '.png')
        .attr("x", (this.portraitWidth - this.portraitWidth / 3.5))
        .attr("width", Math.floor(this.portraitWidth / 3.5))
        .attr("y", (this.portraitHeight - this.portraitHeight/3.5))
        .attr("height", Math.floor(this.portraitHeight / 3.5))
        .attr("class", "heraldic");
    }


    if(character.dead) {
      g.append('svg:image')
        .attr("xlink:href", 'assets/icons/death.png')
        // .attr("x", (this.portraitWidth - this.portraitWidth / 3.5))
        .attr("width", Math.floor(this.portraitWidth / 3.5))
        .attr("y", (this.portraitHeight - this.portraitHeight/3.5))
        .attr("height", Math.floor(this.portraitHeight / 3.5))
        .attr("class", "icon dead");
    }

    g.append('svg:text')
        .text(character.alias || character.name)
        .attr("class", "charLabel ")
        .attr("name", this.tokenize(character.name))
        .attr('dx', function(d) {
          var textWidth = this.getBBox().width;
          return (self.portraitWidth - textWidth) / 2;
        })
        .attr("dy",this.portraitHeight + 10)
        // .attr('clip-path', 'url(#clip)')

      //   .append('defs')
      //   .append('pattern')
      //   .attr('id', 'image_'+this.tokenize(character.name))
      //   .attr('patternUnits', 'objectBoundingBox')
      //   .attr('height', this.portraitHeight)
      //   .attr('width', this.portraitWidth)
      //   .attr('x', 0)
      //   .attr('y', 0)
      //   .append('image')
      //   .attr('height', this.portraitHeight)
      //   .attr('width', this.portraitWidth)
      //   .attr("xlink:href", character.portrait)

      // character.view
      //   .append('circle')
      //   .attr('r', this.portraitWidth / 2)
      //   .attr("class", "charPortrait")
      //   .attr("class", this.tokenize(character.name))
      //   .attr("cx", position.x * (this.portraitWidth + this.margin ) + this.portraitWidth / 2)
      //   .attr("cy",position.y * (this.portraitHeight + this.margin) + this.portraitHeight / 2)
      //   .attr("fill", "url(#image_"+this.tokenize(character.name)+ ")")

    $(character.view).data('name', character.name)
    character.view.data = character;
    character.view.on('click', function() {
      self.clickPortrait(this);
    });
    this.sideBar.find('.close').on('click', self.closeSideBar.bind(this));
  },

  board.prototype.calculateCenter = function() {
    var middleRow = Math.floor(this.maxX / 2) ;
    var middleCol = Math.floor(this.maxY / 2) ;
    return {x: middleRow, y: middleCol};
  }

  board.prototype.clickPortrait = function(char) {
    this.selectCharacter(char);
    this.openSideBar();
  }

  board.prototype.selectCharacter = function(char) {
    var center = this.calculateCenter();
    var character = this.visibleChars[$(char).attr('name')];
    this.clearCentric();
    this.svg.selectAll('.charSelected').classed('charSelected', false);
    this.svg.selectAll('g.'+this.tokenize(character.name)).classed('charSelected', true);

    this.moveCharTo(character, center);

    this.placeFamily(character);
    this.paintRelations(character);
    this.redrawAll();
    this.characterProfile(character);
  }

  board.prototype.characterProfile = function(char) {
    console.log(char);
    console.log(this.charTemplate);
    var charData = _.template(this.charTemplate, char);
    console.log(charData);
    this.sideBar.find('.characterInfo').html(charData);
  }

  board.prototype.moveCharTo = function(char, position) {
    var self = this;
    var previousOccuper = this.filledPositions[position.y][position.x]
    var id = this.tokenize(char.name);
    this.svg.selectAll('.' + id).transition()
      .duration(800)
      .ease("back-out")
      // .attr('cx', position.x * (this.portraitWidth + this.margin) + this.portraitWidth / 2)
      // .attr('cy', position.y * (this.portraitHeight + this.margin) + this.portraitHeight /2 )

      .attr("transform", "translate(" + (position.x * (this.portraitWidth + this.margin)) +
          "," + (position.y * (this.portraitHeight + this.margin)) + ")")
      // .attr('xd', position.x * (this.portraitWidth + this.margin) )
      // .attr('dy', position.y * (this.portraitHeight + this.margin) )
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
    // nextPosition = this.iterateRelation(char.closeFriends, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.marriage, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.lovers, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.sons, nextPosition.x, nextPosition.y);
  }

  board.prototype.clearRelations = function() {
    this.svg.selectAll('path').data([]).exit().remove()
  }

  board.prototype.drawLine = function(char, destinations, relationClass) {
    console.log('aaa');
    var self = this;
    var relationPositions = {
      "parent": 0,
      "sibling": -20,
      "friend": -10,
      "lover": 10,
      "spouse": 20,
      "son": 30,
      "liege": -30,
      "enemy": 5,
      "courtesan": -5
    };
    var line = d3.svg.line()
      .x(function(d){
        var position = d.pos.x * (self.portraitWidth + self.margin) +(self.portraitWidth ) /2;
        return position;
      })
      .y(function(d){
        var position = null;
        if(d.name === char.name) {
          position = relationPositions[relationClass] + d.pos.y * (self.portraitHeight + self.margin) +(self.portraitHeight + self.margin) /2
        } else {
          position = -10 + d.pos.y * (self.portraitHeight + self.margin) +(self.portraitHeight + self.margin) /2
        }
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
            x:  char.pos.x + (relationPositions[relationClass] /100),
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
        var middlePoint2 = { pos: {
            x:  (relationPositions[relationClass] /300) + (character.pos.x ) ,
            y: (character.pos.y + char.pos.y) / 2
          }
        }
        if(middlePoint2.pos.y === char.pos.y &&
          middlePoint2.pos.y === character.pos.y &&
          Math.abs(character.pos.x - char.pos.x) >= 2
        ) {
          middlePoint2.pos.y += 0.4;
        }

        chars.push(middlePoint2);
        chars.push(character);
        return line(chars)
      })
      .attr('class', " " + relationClass + " relations_" +this.tokenize(char.name));
    if(path.node()) {
      var totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray",  totalLength*3 + " " + totalLength*3)
        .attr("stroke-dashoffset", totalLength*3)
        .transition().duration(800).delay(700)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
    }
    return line;
  }

  board.prototype.paintRelations = function(char) {
    var self = this;

    this.clearRelations();

    if(char.court.length > 0) {
      this.drawLine(char, char.court, "courtesan")
    }
    if(char.liege.length > 0) {
      this.drawLine(char, char.liege, "liege")
    }
    if(char.enemies.length > 0) {
      this.drawLine(char, char.enemies, "enemy")
    }
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

  board.prototype.paintLieges = function() {
    var self = this;
    var n = 0;
    for(var j in this.visibleChars) {

      var self = this;
      var char = this.visibleChars[j];
      if(char.liege.length > 0) {
        setTimeout(function(){console.log(self.drawLine(char, char.liege, "liege"))}, 500*n);
      }
      n++;
    }

    this.redrawAll();

  }

  window.Board = board;
})()
