// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');       
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;   

// configure app to use bodyParser()
// this will let us get the data from a POST
var app = express();   

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();             

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);

console.log('Magic happens on port ' + port);