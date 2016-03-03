/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

// Simplified HTTP request client.
var request = require('request');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to download history content from Wikipedia
 */
var urlPrefix = 'https://schultzsandbox.outsystemscloud.com/DirectSupplyEcho/rest/RESTCSR/';

/**
 * CSRSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var CSRSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
CSRSkill.prototype = Object.create(AlexaSkill.prototype);
CSRSkill.prototype.constructor = CSRSkill;

CSRSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("CSRSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

CSRSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("CSRSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

CSRSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

CSRSkill.prototype.intentHandlers = {

    "GetContactNameIntent": function (intent, session, response) {
        handleNewCSRRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With CSR, you can open a CSR for any csr.";
            //"For example, you could say an csr number, or you can say exit. Now, which csr do you want?";
        var repromptText = "What is your full name?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "CSR";
    var repromptText = "With CSR, you can open a CSR for any csr. What is your full name?";
    var speechText = "<p>CSR.</p> <p>What is your full name?</p>";
    var cardOutput = "CSR. What is your full name?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleNewCSRRequest(intent, session, response) {
    var contactSlot = intent.slots.ContactName;
    var repromptText = "With CSR, you can open a CSR for any csr. What is your full name?";

    var contactName = contactSlot.value;

    var prefixContent = "<p>CSR for " + contactName + ", </p>";
    var cardContent = "CSR for " + contactName + ", ";

    var cardTitle = "CSR for " + contactName;

    getJsonCSR(contactName, function (csrResponse) {
        var speechText = "";
        var csr = csrResponse;

        if (typeof csr == "undefined") {
            speechText = "There is a problem connecting to csr Status at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            cardContent = cardContent + "CSR number is " + csr + ".";
            speechText = "<p>" + speechText + "CSR number is " + csr + "</p> ";

            var speechOutput = {
                speech: "<speak>" + prefixContent + speechText + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };

            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    });
}

function getJsonCSR(contactName, eventCallback) {
    var url = urlPrefix + contactName;

    // https.get(url, function(res) {
    //     var body = '';

    //     res.on('data', function (chunk) {
    //         body += chunk;
    //     });

    //     res.on('end', function () {
    //         eventCallback(JSON.parse(body));
    //     });
    // }).on('error', function (e) {
    //     console.log("Got error: ", e);
    // });
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            eventCallback(body);
        }
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the CSR Skill.
    var skill = new CSRSkill();
    skill.execute(event, context);
};
