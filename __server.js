// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var builder = require('botbuilder');
var cors = require('cors');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3978;

var LUIS_MODEL_ID = '9c0411da-29e0-4d8c-8993-d2ac3c049d42';
var LUIS_KEY_ID = '256b0a3193204b8ea9c9c3fc131b6804';
var LUIS_MODEL_URL = `https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/${LUIS_MODEL_ID}?subscription-key=${LUIS_KEY_ID}&verbose=true&timezoneOffset=0`;

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

var recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('SearchHotels', [
    function (session, args, next) {
        session.send('Welcome to the Hotels finder! We are analyzing your message: \'%s\'', session.message.text);

        // try extracting entities
        var cityEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'builtin.geography.city');
        var airportEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'AirportCode');

        if (cityEntity) {
            // city entity detected, continue to next step
            session.dialogData.searchType = 'city';
            next({ response: cityEntity.entity });
        } else if (airportEntity) {
            // airport entity detected, continue to next step
            session.dialogData.searchType = 'airport';
            next({ response: airportEntity.entity });
        } else {
            // no entities detected, ask user for a destination
            builder.Prompts.text(session, 'Please enter your destination');
        }
    },
    function (session, results) {
        var destination = results.response;

        var message = 'Looking for hotels';
        if (session.dialogData.searchType === 'airport') {
            message += ' near %s airport...';
        } else {
            message += ' in %s...';
        }

        session.send(message, destination);

        // Async search
        Store
            .searchHotels(destination)
            .then(function (hotels) {
                session.send('I found %d hotels:', hotels.length);

                var message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(hotels.map(hotelAsAttachment));

                session.send(message);
                session.endDialog();
            });
    }
]).triggerAction({
    matches: 'SearchHotels',
    onInterrupted: function (session) {
        session.send('Please provide a destination');
    }
});

// START THE SERVER
// =============================================================================
app.listen(port, function () {
    console.log('Web Server listening on port %s', port);
});