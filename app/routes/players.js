var express    = require('express'); 		// call express
var players    = express.Router();
var Player     = require('../models/player');
var Message    = require('./messages').messages;
var Team     = require('../models/team');

// middleware to use for all requests
players.use(function(req, res, next) {
  // do logging
  console.log('Something is happening with players.');
  next(); // make sure we go to the next routes and don't stop here
});

players.route('/')
// create a player (accessed at POST http://localhost:8080/api/players)
  .post(function(req, res) {

    var player = new Player(); 		// create a new instance of the Player model
    player.name = req.body.name;  // set the players name (comes from the request)

    // save the player and check for errors
    player.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'Player created!' });
    });

  })

  // get all the players (accessed at GET http://localhost:8080/api/players)
  .get(function(req, res) {
    Player.find(function(err, players) {
      if (err)
        res.send(err);

      res.json(players);
    });
  });

// on routes that end in /players/:player_id
// ----------------------------------------------------

  // get the player with that id (accessed at GET http://localhost:8080/api/players/:player_id)
players.route('/:player_id')
  .get(function(req, res) {
    Player.findById(req.params.player_id, function(err, player) {
      if (err)
        res.send(err);
      res.json(player);
    });
  })

  // update the player with this id (accessed at PUT http://localhost:8080/api/players/:player_id)
  .put(function(req, res) {

    // use our player model to find the player we want
    Player.findById(req.params.player_id, function(err, player) {

      if (err)
        res.send(err);

      player.name = req.body.name; 	// update the players info

      // save the player
      player.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Player updated!' });
      });

    });
  })

  // delete the player with this id (accessed at DELETE http://localhost:8080/api/players/:player_id)
  .delete(function(req, res) {
    Player.remove({
      _id: req.params.player_id
    }, function(err, player) {
      if (err)
        res.send(err);

      res.json({ message: 'Successfully deleted' });
    });
  });

players.route('/:player_id/message')
  .post(function(req, res) {
    Player.findById(req.params.player_id, function(err, player) {
      if (err)
        res.send(err);
      if(player.active) {
        Message.create({"phone": player.cellPhone, "message": req.body.message});
        res.json({ message: 'Message created for ' + player.first_name + '!' });
      } else {
        res.json({ message: player.firstName + ' is not currently active in the system'});
      }
    });
  })


module.exports.players = players;
