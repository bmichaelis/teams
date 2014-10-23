var express    = require('express'); 		// call express
var teams    = express.Router();
var Team     = require('../models/team');
var Message    = require('./messages').messages;
var Player     = require('../models/player');

// middleware to use for all requests
teams.use(function(req, res, next) {
  // do logging
  console.log('Something is happening with teams.');
  next(); // make sure we go to the next routes and don't stop here
});

teams.route('/')
// create a team (accessed at POST http://localhost:8080/api/teams)
  .post(function(req, res) {

    var team = new Team(); 		// create a new instance of the Team model
    team.name = req.body.name;  // set the teams name (comes from the request)
    team.players = req.body.players;

    // save the team and check for errors
    team.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'Team created!' });
    });

  })

  // get all the teams (accessed at GET http://localhost:8080/api/teams)
  .get(function(req, res) {
    Team.find(function(err, teams) {
      if (err)
        res.send(err);

      res.json(teams);
    });
  });

// on routes that end in /teams/:player_id
// ----------------------------------------------------

  // get the team with that id (accessed at GET http://localhost:8080/api/teams/:player_id)
teams.route('/:team_id')
  .get(function(req, res) {
    Team.findById(req.params.team_id, function(err, team) {
      if (err)
        res.send(err);
      res.json(team);
    });
  })

  // update the team with this id (accessed at PUT http://localhost:8080/api/teams/:player_id)
  .put(function(req, res) {

    // use our team model to find the team we want
    Team.findById(req.params.team_id, function(err, team) {
      console.log('Found team: ');
      console.log(team);

      if (err)
        res.send(err);

      if (typeof req.body.name !== "undefined" || req.body.name !== null) {
        team.name = req.body.name; 	// update the teams info
      }

      if (typeof req.body.captain !== "undefined" || req.body.captain !== null) {
        team.captain = req.body.captain; 	// update the teams info
      }

      // save the team
      team.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Team updated!' });
      });

    });
  })

  // delete the team with this id (accessed at DELETE http://localhost:8080/api/teams/:player_id)
  .delete(function(req, res) {
    Team.remove({
      _id: req.params.player_id
    }, function(err, team) {
      if (err)
        res.send(err);

      res.json({ message: 'Successfully deleted' });
    });
  });

teams.route('/:team_id/players')
  .get(function(req, res) {
    Team.findById(req.params.team_id, function(err, team) {
      if (err)
        res.send(err);
      res.json(team);
    });
  })

  .put(function(req, res){
    Team.findById(req.params.team_id, function(err, team) {
      if(err)
        res.send(err)
      Player.find(function(err, players) {
        if (err)
          res.send(err);
        players.forEach(function(player){
          team.players.push(player._id);
        })

        team.save(function(err) {
          if (err)
            res.send(err);

          res.json({ message: 'Team updated!' });
        });
      });
    })
  })

teams.route('/:team_id/message')
  .post(function(req, res) {
    Team.findById(req.params.team_id, function(err, team) {
      if (err)
        res.send(err);
      team.players.forEach(function(playerId) {
        Player.findById(playerId, function(err, player) {
          if (err)
            res.send(err);
          if(player.active) {
            Message.create({"phone": player.cellPhone, "message": req.body.message});
            console.log(player);
            res.json({ message: 'Message created for ' + player.firstName + '!' });
          } else {
            res.json({ message: player.firstName + ' is not currently active in the system'});
          }

        })
      })
    });
  })

module.exports.teams = teams;
