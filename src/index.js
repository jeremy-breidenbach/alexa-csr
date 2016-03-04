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
var urlPrefix = 'https://schultzsandbox.outsystemscloud.com/DirectSupplyEcho/rest/RESTCSR/NewCSR?ContactName=';

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
    getWelcomeResponse(session, response);
};

CSRSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

CSRSkill.prototype.intentHandlers = {

    "GetContactNameIntent": function (intent, session, response) {
        handleContactNameRequest(intent, session, response);
    },
    
    "GetCSRDetailsIntent": function(intent, session, response) {
        handleItemsRequest(intent, session, response);
    },
    

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "";
        switch (session.attributes.stage) {
            case 0:
                speechText = "With CSR, you can open a CSR for any order. First, start by saying your full name, or you can say exit.";
                break;
            case 1:
                speechText = "You can say which items are affected, or you can say exit.";
                break;
            case 2:
                speechText = "You can give a description of the problem, or you can say exit.";
                break;
            default:
                speechText = "You can use CSR to open a CSR for any order. To start, please say your full name, or you can say exit.";
        }
        
        
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

function getWelcomeResponse(session, response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "CSR";
    var speechText = "<p>CSR.</p> <p>What is your full name?</p>";
    var cardOutput = "CSR. What is your full name?";
    var repromptText = "With CSR, you can open a CSR for any order. What is your full name?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    session.attributes.stage = 0;
    
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
function handleContactNameRequest(intent, session, response) {
    //Check if session variables are already initialized.
    session.attributes.stage = 0;
    var speechText = "To open a CSR we need your full name.  Please state your full name.";
    var repromptText = "In order to open a CSR we need your full name.  Please state your name.";

    // var prefixContent = "<p>CSR for " + contactName + ", </p>";
    // var cardContent = "CSR for " + contactName + ", ";

    // var cardTitle = "CSR for " + contactName;

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    
    response.ask(speechOutput, repromptOutput);
    
}


function handleItemsRequest(intent, session, response) {
    var speechText = "";
    var repromptText = "";

    var intentValue = intent.slots.Value;
    //check to see if session is initialized
    //if(session.attributes.stage) {
        //assign name
        if(session.attributes.stage === 0) {
            //set the session variable of the name
            session.attributes.contactname = intentValue;
            //set the next stage
            session.attributes.stage = 1;
            //set the next response
            speechText = "What items would you like to add to this CSR?";
            repromptText = "You can name any items you wish to add to this CSR";
            
            var speechOutput = {
                speech: '<speak>' + speechText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            var repromptOutput = {
                speech: '<speak>' + repromptText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            response.ask(speechOutput, repromptOutput);
        }
        //assign items
        else if(session.attributes.stage === 1) {
             //set the session variable of the items
            session.attributes.items = intentValue;
            //set the next stage
            session.attributes.stage = 2;
            //set the next response
            speechText = "What are the details of your CSR?";
            repromptText = "Can you describe the request?";
            
            var speechOutput = {
                speech: '<speak>' + speechText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            var repromptOutput = {
                speech: '<speak>' + repromptText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            response.ask(speechOutput, repromptOutput);
        }
        
        //assign the details and create the CSR
        else if(session.attributes.stage === 2) {
            
            //save description here
            session.attributes.details = intentValue;
            
            //speechText = "Creating CSR now!";
            
            //create the CSR via webservice, session.attributes.contactname, session.attributes.items, itemSlot.value (Details)
            getJsonCSR(session, function (csrResponse) { 
                
                
                //set the response? here?
                speechText = "Request " + csrResponse + " has been created, a customer service representative will follow up with you soon.";
                
                var speechOutput = {
                    speech: "<speak>" + speechText + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };

                response.tell(speechOutput);
                
            });

        }
        
        else {
            session.attributes.stage = 1;
            
            
        }
        
    //}    
    
    // else {
    //     //If the session attributes are not found, the csr must restart.
    //     speechText = "Sorry, i can't open a CSR yet. What is your full name. Say my full name is Jane Doe."

    //     repromptText = "You can say, My full name is Jane Doe.";
        
        
    // }

    
    
    

    // var itemSlot = intent.slots.Items;
    // var repromptText = "You can say which item is affected?";

    // var itemValue = itemSlot.value;

    // var prefixContent = "<p>CSR for item " + itemValue + ", </p>";
    // var cardContent = "CSR for item " + itemValue + ", ";

    // var cardTitle = "CSR for item " + itemValue;

    
}

function getJsonCSR(session, eventCallback) {
    var url = urlPrefix + session.attributes.contactname.value + "&Items=" + session.attributes.items.value + "&Details=" + session.attributes.details.value;
    //session.attributes.url = url;
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
        else{
            //session.attributes.error = error.message;
        }
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the CSR Skill.
    var skill = new CSRSkill();
    skill.execute(event, context);
};
