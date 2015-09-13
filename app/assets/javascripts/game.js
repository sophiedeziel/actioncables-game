function ActionCableGame (params) {
  this.players_list = new PlayersList();
  this.canvas = document.getElementById('field'),
  this.context = this.canvas.getContext('2d');
  Position.prototype.default_x = $('#game').width() / 2;
  Position.prototype.default_y = $('#game').height() / 2;
  var game = this;

  window.addEventListener('resize', function(){game.resizeCanvas(game)}, false);

  this.createFrame = function(game_instance){
    var game = game_instance;
    $.each(game.players_list.get_players(), function(i, player) {
      game.applyGravity(player.position);
    });
    game.drawStuff();
    window.requestAnimationFrame(function() {
      game.createFrame(game)
    });
  }

  this.drawStuff = function() {
    var game = this;
    $.each(game.players_list.get_players(), function(i, player) {
      var img = new Image();
      img.onload = function() {
        game.context.clearRect(player.position.x,  player.position.y, 75, 75);
        game.context.drawImage(img, player.position.x, player.position.y, 75, 75);
      };
      img.src = '/assets/moving_player.gif'
    });
  }

  this.applyGravity = function(position) {
    if (position.y <= this.canvas.height - 65) {
      position.y = position.y + 2;
    }
  }

  this.resizeCanvas = function(game_instance) {
    this.canvas.width = $('#game').innerWidth();
    this.canvas.height = $('#game').innerHeight() - $('#players').height();
    this.drawStuff();
  }


  this.createFrame(this);
}

ActionCableGame.prototype.update_players = function(players) {
  var game = this;
  $.each(players.diff(game.players_list.names()), function(i, player_name) {
    var player = game.players_list.find(player_name)
      if(player == null) {
        player = game.players_list.push(player_name);
      }
  });
  $.each(game.players_list.names().diff(players), function(i, player_name) {
    var player = game.players_list.find(player_name)
      game.players_list.remove(player_name);
  });

}

function Player(name, color) {
  this.name = name;
  this.score = 0;
  this.color = color;
  this.position = new Position(Position.prototype.default_x, Position.prototype.default_y)
}

function PlayersList() {
  var colors = [0, 90, 180, 270, 45, 135]
  var players = []
  $('#game').append($('<div id="players">'));
  $('#players').append($('<ul id="players-list">'));

  this.get_players = function(){
    return players;
  }

  this.names = function() {
    var array = []
    $.each(players, function(i, player) {
      array.push(player.name);
    });
    return array;
  };
  this.push = function(name) {
    var new_player = new Player(name, colors[players.length]);
    players.push(new_player);
    update_displays();
    return new_player;
  }
  this.find = function(name) {
    var found = null;
    $.each(players, function(i, player) {
      if(name == player.name) { found = player }
    });
    return found;
  }
  this.remove = function(name) {
    $.each(players, function(i, player) {
      if(name == player.name) { players.splice(i, 1) }
    });
    update_displays();
  }

  var update_displays = function() {
    $('#players-list').html('');
    $.each(players, function(i, player) {
      $('#players-list')
        .append($('<li data-player="' + player.name + '" style="-webkit-filter: hue-rotate('+ player.color +'deg)">')
            .append($('<span class="username">').html(player.name))
            .append($('<span class="score">').html(player.score))
            );
    });
    Game.resizeCanvas();

  }


}

function Position(x, y) {
  this.x = (x === undefined) ? Position.prototype.default_x : x;
  this.y = (y === undefined) ? Position.prototype.default_y : y;
}

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
    return false;

  // compare lengths - can save a lot of time
  if (this.length != array.length)
    return false;

  for (var i = 0, l=this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i]))
        return false;
    }
    else if (this[i] != array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}
