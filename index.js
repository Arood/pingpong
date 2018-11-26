var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rules = {
  goal: 11,
  servesPerPlayer: 2
};

var names = {
  p1: "Player 1",
  p2: "Player 2"
};

var scores = {
  p1: 0,
  p2: 0
};

var pushScores = function() {
  io.emit('update_scores', {
    scores,
    names
  });
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/score', function(req, res){
  res.sendFile(__dirname + '/score.html');
});

app.put('/game/reset', function(req, res) {
  scores = {
    p1: 0,
    p2: 0
  };
  pushScores();
  res.send("ok");
});

app.put('/p1/add', function(req, res) {
  scores.p1++;
  pushScores();
  res.send("ok");
});

app.put('/p2/add', function(req, res) {
  scores.p2++;
  pushScores();
  res.send("ok");
});

app.put('/p1/undo', function(req, res) {
  if (scores.p1 > 0) scores.p1--;
  pushScores();
  res.send("ok");
});

app.put('/p2/undo', function(req, res) {
  if (scores.p2 > 0) scores.p2--;
  pushScores();
  res.send("ok");
});

io.on('connection', function(socket){
  pushScores();
  io.emit('set_names', {
    names
  });

  socket.on('set_name', function(e) {
    names[e.player] = e.name;
    io.emit('set_names', {
      names
    });
  });

  socket.on('set_rules', function(e) {
    rules = e;
    scores = {
      p1: 0,
      p2: 0
    };
    io.emit('set_rules', e);
  });


  socket.on('reset', function(e) {
    scores = {
      p1: 0,
      p2: 0
    };
    pushScores();
  });

  socket.on('add', function(player) {
    if (player == "p1") {
      scores.p1++;
    } else if (player == "p2") {
      scores.p2++;
    }
    pushScores();
  });

  socket.on('undo', function(player) {
    if (player == "p1") {
      if (scores.p1 > 0) scores.p1--;
    } else if (player == "p2") {
      if (scores.p2 > 0) scores.p2--;
    }
    pushScores();
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});