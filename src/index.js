/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to download history content from Wikipedia
 */
var urlPrefix = 'https://hackathon-api.xyz/orders/';

/**
 * OrderStatusSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var OrderStatusSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
OrderStatusSkill.prototype = Object.create(AlexaSkill.prototype);
OrderStatusSkill.prototype.constructor = OrderStatusSkill;

OrderStatusSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("OrderStatusSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

OrderStatusSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("OrderStatusSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

OrderStatusSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

OrderStatusSkill.prototype.intentHandlers = {

    "GetFirstOrderIntent": function (intent, session, response) {
        handleFirstOrderRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With Order Status, you can get information for any order.  " +
            "For example, you could say an order number, or you can say exit. Now, which order do you want?";
        var repromptText = "Which order do you want?";
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
    var cardTitle = "Order Status";
    var repromptText = "With Order Status, you can get information for any order. For example, you could say an order number, or you can say exit. Now, which order do you want?";
    var speechText = "<p>Order Status.</p> <p>What order do you want?</p>";
    var cardOutput = "Order Status. What order do you want?";
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
function handleFirstOrderRequest(intent, session, response) {
    var orderSlot = intent.slots.order;
    var repromptText = "With Order Status, you can get information for any order. For example, you could say an order number, or you can say exit. Now, which order do you want?";

    var orderNumber = orderSlot.value;

    var prefixContent = "<p>Order number " + orderNumber + ", </p>";
    var cardContent = "Order number " + orderNumber + ", ";

    var cardTitle = "Order Number " + orderNumber;

    getJsonOrderStatus(orderNumber, function (orderResponse) {
        var speechText = "";
        var order = orderResponse;

        if (typeof order == "undefined") {
            speechText = "There is a problem connecting to Order Status at this time. Please try again later.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            cardContent = cardContent + "for products " + order.products + ", order status is " + order.status + " ";
            speechText = "<p>" + speechText + "for products " + order.products + ", order status is " + order.status + "</p> ";

            // speechText = speechText + " <p>Wanna go deeper in history?</p>";
            var speechOutput = {
                speech: "<speak>" + prefixContent + speechText + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };

            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    });
}

function getJsonOrderStatus(orderNumber, eventCallback) {
    var url = urlPrefix + orderNumber;

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            eventCallback(JSON.parse(body));
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the OrderStatus Skill.
    var skill = new OrderStatusSkill();
    skill.execute(event, context);
};
