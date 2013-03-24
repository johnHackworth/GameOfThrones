(function() {

  var board = function(options) {
    var self = this;
    this.visibleChars = {};
    this.correction = 0.85;
    this.verticalCorrection = 1;
    this.totalWidth = $('body').innerWidth() * this.correction;
    this.totalHeight = $('body').innerHeight() * this.verticalCorrection;
    this.totalArea = this.totalWidth * this.totalHeight;
    this.detectOrientation();

    this.portraitWidth = Math.floor((this.totalWidth / this.xSize) * this.correction * (2/3));
    this.portraitHeight = Math.floor((this.totalHeight / this.xSize) * this.verticalCorrection * (3/5));
    this.margin =  Math.floor((this.totalWidth / this.xSize) * this.correction * (1/3));;
    this.verticalMargin =  Math.floor((this.totalHeight / this.ySize) * this.verticalCorrection * (2/5));;

    this.initialize(options);
    $(window).on("orientationchange", function() {
      self.initialize(options);
    });
    $(window).on("resize", function() {
      self.initialize(options);
    });
  }

  board.prototype.detectOrientation = function() {
    this.xSize = 8;
    this.ySize = 7;
    // if(window.orientation === undefined || window.orientation === 0 || window.orientation === 180) {
    //   this.xSize = 9;
    //   this.ySize = 7;
    // } else {
    //   this.xSize = 7;
    //   this.ySize = 9;
    // }
  }

  board.prototype.relationTypes = ['siblings',
    'sons',
    'enemies',
    'marriage',
    'lovers',
    'liege',
    'court',
    'parents',
    'closeFriends'
  ]

  board.prototype.season = 1;
  board.prototype.episode = 1;

  board.prototype.initialize = function(options) {
    var self = this;
    this.detectOrientation();
    this.characters = options.characters;
    this.selector = options.selector;
    this.maxX = this.xSize;//Math.floor(this.totalWidth / this.cellSize);
    this.maxY = this.ySize;//Math.floor(this.totalHeight / this.cellSize);
    this.sideBar = $('.sideBar');
    this.sideBarBackground = $('.sideBarBackground');
    this.timeSelector = $('.timeSelector');
    this.charTemplate = $('#characterTemplate').html();
    this.seasonTemplate = $('#seasonSelector').html();
    this.legendButton = $('.legendButton');
    this.moreInfo = $('.showMoreInfo');

    this.legend = $('.legend');
    this.initEmptyPositions();
    this.sideBar.find('.close').on('click', self.closeSideBar.bind(this));
    this.timeSelector.find('.episode').on('click', self.changeEpisode.bind(this));
    this.sideBar.on('click', '.prevSeason', self.prevSeason.bind(this));
    this.sideBar.on('click', '.nextSeason', self.nextSeason.bind(this));
    this.sideBar.on('click', '.prevEpisode', self.prevEpisode.bind(this));
    this.sideBar.on('click', '.nextEpisode', self.nextEpisode.bind(this));
    this.legendButton.on('click', self.showLegend.bind(this));
    this.searcher = $('#search');
    this.searcher.typeahead({
      name: 'characters',
      local: this.getSeasonDatums(),
      limit: 3
    });
    this.searcher.on('change blur', function() {
      var charName = $('#search').val();
      charName.split(' ').map(function(i,e){return i.charAt(0).toUpperCase() + i.slice(1);}).join(' ')
      var char = self.visibleChars[charName];

      if(char) {
        self.selectCharacter(char);
      }
    })

    window.scrollTo(0,0)

  }

  board.prototype.showLegend = function() {
    this.legendButton.fadeOut();
    this.legend.fadeIn();
    this.moreInfo.fadeOut();
    setTimeout(this.hideLegend.bind(this),100000);
  }

  board.prototype.hideLegend = function() {
    this.legendButton.fadeIn();
    this.moreInfo.fadeIn();
    this.legend.fadeOut();
  }
  board.prototype.getSeasonDatums = function() {
    var datums = [];
    var season = this.characters.seasons["season"+this.season+"_"+this.episode];
    for(var n = 0, l = season.length; n < l; n++) {
      var datum = {};
      datum.value = season[n].name;
      datum.tokens = season[n].name.split(' ');
      datums.push(datum);
    }
    return datums;

  }

  board.prototype.prevSeason = function() {
    this.season --;
    if(this.season < 1) {
      this.season = 1;
    }
    this.episode = this.characters.EPISODE_LIST[this.season - 1].length;
    this.clearBoard();
    this.initializeSeason();
    this.renderSeasonData();
  }
  board.prototype.nextSeason = function() {
    this.season++;
    this.episode = 1;
    if(this.season > this.characters.EPISODE_LIST.length) {
      this.season = this.characters.EPISODE_LIST.length;
    }
    this.clearBoard();
    this.initializeSeason();
    this.renderSeasonData();
  }
  board.prototype.prevEpisode = function() {
    this.episode--;
    if(this.episode < 1) {
      this.episode = 1;
    }
    this.clearBoard();
    this.initializeSeason();
    this.renderSeasonData();
  }
  board.prototype.nextEpisode = function() {
    this.episode++;
    if(this.episode > this.characters.EPISODE_LIST[this.season - 1].length) {
      this.episode = this.characters.EPISODE_LIST[this.season - 1].length;
    }
    this.clearBoard();
    this.initializeSeason();
    this.renderSeasonData();
  }
  board.prototype.openSideBar = function() {
    this.sideBar.removeClass('closed');
    this.sideBarBackground.removeClass('closed');
    this.svg.classed('centered', false)
  }

  board.prototype.moveBackground = function() {
    var headings = ['north', 'south', 'east', 'west'];
    var heading = headings[Math.floor(Math.random()*4)]
    $('.background')
      .removeClass('north')
      .removeClass('south')
      .removeClass('east')
      .removeClass('west')
      .addClass(heading);
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

  board.prototype.renderSeasonData = function() {
    var seasonData = _.template(this.seasonTemplate, this);
    this.sideBar.find('.seasonSelector').html(seasonData);
  }

  board.prototype.initializeBoard = function() {
    this.svg = d3.select(this.selector).append("svg")
    this.initializeSeason();
    this.renderSeasonData();
    this.moveBackground();
    this.interval = setInterval(this.moveBackground.bind(this), 60000);
  }

  board.prototype.initializeSeason = function(nSeason) {
    // var seasonName = 'season' + nSeason;
    var seasonName = "season" + this.season + '_' + this.episode;
    localStorage.setItem('episode', this.season + '_' + this.episode)
    var chars = this.characters.seasons[seasonName];
    for(var n in chars) {
      this.drawCharacter(chars[n]);
    }
    if(this.selectedCharacter) {
      this.clickPortrait(this.selectedCharacter.view)
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


    var g = character.view
      .append('g')
      .attr("transform", "translate(" + (position.x * (this.portraitWidth + this.margin)) +
          "," + (position.y * (this.portraitHeight + this.verticalMargin)) + ")")
      .attr("class", this.tokenize(character.name))

    g.append('svg:image')
        .attr("xlink:href", character.portrait)
        .attr("width", this.portraitWidth)
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

    if(character.king) {
      g.append('svg:image')
        .attr("xlink:href", 'assets/icons/crown.png')
        .attr("width", Math.floor(this.portraitWidth / 3.5))
        .attr("y", (0))
        .attr("height", Math.floor(this.portraitHeight / 3.5))
        .attr("class", "icon king");
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


    $(character.view).data('name', character.name)
    character.view.data = character;
    character.view.on('click', function() {
      self.clickPortrait(this);
    });
  }

  board.prototype.changeEpisode = function(ev) {
    var $button = $(ev.currentTarget);
    $('.episode.selected').removeClass('selected');
    $button.addClass('selected');
    var nEpisode = $button.data('number');
    this.clearBoard();
    this.initializeSeason(nEpisode);
  }

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
    this.paintRelationLabels(character);
    this.redrawAll();
    this.characterProfile(character);

    this.selectedCharacter = character;
  }

  board.prototype.characterProfile = function(char) {
    var charData = _.template(this.charTemplate, char);
    this.sideBar.find('.characterInfo').html(charData);
  }

  board.prototype.moveCharTo = function(char, position) {
    var self = this;
    var previousOccuper = this.filledPositions[position.y][position.x]
    var id = this.tokenize(char.name);
    this.svg.selectAll('.' + id).transition()
      .duration(800)
      .ease("back-out")

      .attr("transform", "translate(" + (position.x * (this.portraitWidth + this.margin)) +
          "," + (position.y * (this.portraitHeight + this.verticalMargin)) + ")")
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
    // nextPosition = this.iterateRelation(char.lovers, nextPosition.x, nextPosition.y);
    nextPosition = this.iterateRelation(char.sons, nextPosition.x, nextPosition.y);
  }

  board.prototype.clearRelations = function() {
    this.svg.selectAll('g.relLabel').data([]).exit().remove()
    this.svg.selectAll('path').data([]).exit().remove()
  }

  board.prototype.clearCharacter = function(character) {
    $('.'+character).parent().remove();
  }

  board.prototype.clearBoard = function() {
    this.clearRelations();
    for(var name in this.visibleChars) {
      this.clearCharacter(this.tokenize(name))
    }
    this.visibleChars = {};
    this.initEmptyPositions();
  }

  board.prototype.drawLine = function(char, destinations, relationClass) {
    var self = this;
    var relationPositions = {
      "parent": 0,
      "sibling": -4,
      "friend": -2,
      "lover": 2,
      "spouse": 4,
      "son": 6,
      "liege": -6,
      "enemy": 1,
      "courtesan": -1
    };

    var line = d3.svg.line()
      .x(function(d){
        var position = d.pos.x * (self.portraitWidth + self.margin) +(self.portraitWidth ) /2;
        return position;
      })
      .y(function(d){
        var position = null;
        if(d.name === char.name) {
          position = relationPositions[relationClass] + d.pos.y * (self.portraitHeight + self.verticalMargin) +(self.portraitHeight + self.verticalMargin) /2
        } else {
          position = -10 + d.pos.y * (self.portraitHeight + self.verticalMargin) +(self.portraitHeight + self.verticalMargin) /2
        }
        return position;
      })
      .interpolate('basis')
      .tension(0.9);
    var path = this.svg.selectAll('path.'+relationClass)
      .data(destinations).enter()
      .append('g')
      .attr('class', "gPath " + relationClass + " relations_" +this.tokenize(char.name))
    var pathG = path
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
        var middlePoint2 = { pos: {
            x: character.pos.x,
            y: (character.pos.y + char.pos.y) / 2
          }
        }
        if(middlePoint2.pos.y === char.pos.y &&
          middlePoint2.pos.y === character.pos.y &&
          Math.abs(character.pos.x - char.pos.x) >= 2
        ) {
          middlePoint2.pos.y += 0.4;
        }
        // this.attr('labelPoint', [middlePoint2.pos.x, middlePoint2.pos.y]);
        chars.push(middlePoint2);
        chars.push(character);
        return line(chars)
      })
      .attr('labelPointX', function(d) {
        var character = self.visibleChars[d];
        return character.pos.x;
      })
      .attr('labelPointY', function(d) {
        var character = self.visibleChars[d];
        return character.pos.y;
      })
      .attr('class', function(d) {
        return " " + relationClass + " with_" +self.tokenize(d) +" relations_" +self.tokenize(char.name)
      })
    if(pathG.node()) {
      var totalLength = pathG.node().getTotalLength();
      pathG
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
      this.drawLine(char, char.sons, "son");
    }
    if(char.lovers.length > 0) {
      this.drawLine(char, char.lovers, "lover");
    }
    if(char.marriage.length > 0) {
      this.drawLine(char, char.marriage, "spouse");
    }
  }


  board.prototype.getSelectedRelationLabels = function(char) {
    this.relationLabels = {};

    var relations = this.relationTypes;
    for(var n = 0, l = relations.length; n<l; n++) {
      for(var i = 0, ll = char[relations[n]].length; i < ll; i ++) {
        if(!this.relationLabels[char[relations[n]][i]]) {
          this.relationLabels[char[relations[n]][i]] = [];
        }
        this.relationLabels[char[relations[n]][i]].push(this.getRelationLabelText(relations[n]))
      }

    }
  }
  board.prototype.getRelationLabelText = function(rel) {
    if(rel === 'sons') return 'son';
    if(rel === 'friends') return 'friend';
    if(rel === 'siblings') return 'sibling';
    if(rel === 'enemies') return 'enemy';
    if(rel === 'lovers') return 'lover';
    if(rel === 'marriage') return 'spouse';;
    if(rel === 'closeFriends') return 'friend';
    if(rel === 'parents') return 'parent';

    return rel;
  }

  board.prototype.paintRelationLabels = function(char) {
    var self = this;
    this.getSelectedRelationLabels(char);
    setTimeout(function() {
      for(var name in self.relationLabels) {
        if(name != undefined) {

          self.paintRelationLabel(name, self.relationLabels[name]);
        }
      }
      setTimeout(function() {
        self.svg.selectAll('.relLabel').classed('shown', true);
        self.redrawAll();
      },500);
    },500);
  }

  board.prototype.paintRelationLabel = function(charName, labels) {
    // debugger;
    var self = this;
    var char = this.visibleChars[charName];
    var group = this.svg
      .append('g')
      .attr("class", "relLabel ")
    var background = group.append('rect')
      .attr('x', (char.pos.x * (self.portraitWidth + self.margin) - 0))
      .attr('y', 15 + self.portraitHeight + char.pos.y * (self.portraitHeight + self.verticalMargin))
      .attr('rx', '1em')
      .attr('ry', '1em')
      .attr('width',(self.portraitWidth))
      .attr('height', 12 + 12 * labels.length)
      .attr('fill', '#333')

    for(var n = 0, l = labels.length; n < l; n++) {


      var text = group
        .append('svg:text')
          .attr("name", "name")
          .text(labels[n])
          .attr('dx', function(d) {
            var textWidth = this.getBBox().width;

            return ((self.portraitWidth - textWidth) / 2)  + char.pos.x * (self.portraitWidth + self.margin)
          })
          .attr('dy', function(d) {
            return 18 + (n+1) *12 + self.portraitHeight + char.pos.y * (self.portraitHeight + self.verticalMargin)
          })
    }

  }


  board.prototype.paintLieges = function() {
    var self = this;
    var n = 0;
    for(var j in this.visibleChars) {

      var self = this;
      var char = this.visibleChars[j];
      if(char.liege.length > 0) {
        setTimeout(function(){self.drawLine(char, char.liege, "liege")}, 500*n);
      }
      n++;
    }

    this.redrawAll();

  }

  window.Board = board;
})()
