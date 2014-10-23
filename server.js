// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var loggly 		 = require('loggly');

var Player     = require('./app/models/player.js');
var Team			 = require('./app/models/team');
var Message		 = require('./app/models/message');

mongoose.connect('mongodb://players:M5k#Eeqr@ds055689.mongolab.com:55689/players'); // connect to our database
var logclient = loggly.createClient({
		token: "e3aabc3f-835f-4a34-8bcc-5f722b988922",
		subdomain: "teams",
		tags: ["NodeJS"],
		json:true
});
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
	console.log(req);
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// all routes that that start with /api/players
// ----------------------------------------------------
router.use('/players', require('./app/routes/players').players);

// all routes that that start with /api/teams
// ----------------------------------------------------
router.use('/teams', require('./app/routes/teams').teams);

// all routes that that start with /api/teams
// ----------------------------------------------------
router.use('/messages', require('./app/routes/messages').messages);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
setInterval(require('./app/routes/messages').messages.processOut, 5000);
setInterval(require('./app/routes/messages').messages.processIn, 5000);
app.listen(port);
logclient.log('Magic happens on port ' + port);
