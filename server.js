// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://players:M5k#Eeqr@ds055689.mongolab.com:55689/players'); // connect to our database

var Player     = require('./app/models/player');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// more routes for our API will happen here

// on routes that end in /players
// ----------------------------------------------------
router.route('/players')

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
router.route('/players/:player_id')

	// get the player with that id (accessed at GET http://localhost:8080/api/players/:player_id)
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

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

