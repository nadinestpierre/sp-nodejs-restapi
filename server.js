// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var builder = require('botbuilder');
var cors = require('cors');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3978;

// configure app to use bodyParser()
// this will let us get the data from a POST
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'API Version 0.0.1' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// REGISTER OUR BOT -------------------------------
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '88d62595-abc7-4f4e-afa3-a7d2dd704100',
    appPassword: 'iAPeEvqqeyKjofbEPqa3tjK'
});

var bot = new builder.UniversalBot(connector);

app.post('/api/messages', connector.listen());

bot.dialog('/', function (session, args) {
    session.send("Hi");
    console.log(session.message.text);
});

// START THE SERVER
// =============================================================================
app.listen(port, function () {
    console.log('Web Server listening on port %s', port);
});