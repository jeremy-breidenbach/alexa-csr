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
var statusUrlPrefix = 'https://schultzsandbox.outsystemscloud.com/DirectSupplyEcho/rest/RESTCSR/GetCSR?CSRID=';

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
    
    "GetCSRStatusIntent": function(intent, session, response) {
        handleCSRStatusRequest(intent, session, response);
    },
    
    "DSCreatePMOIntent": function(intent, session, response) {
        handleDSCreatePMORequest(intent, session, response);
    },
    
    "DSCallMeIntent": function(intent, session, response) {
        handleDSCallMeRequest(intent, session, response);
    },
    
    "DSMarketingIntent": function(intent, session, response) {
    handleDSMarketingRequest(intent, session, response);
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
            case 3:
                speechText = "You can check the status of a CSR, state the CSR number you wish to check.";
                break;
            default:
                speechText = "You can say, create a CSR, Status of CSR number, current promotions, create a PMO Request, or Call Me.";
        }
        
        
        var repromptText = "You can say, create a CSR, Status of CSR number, or Call Me.";
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
                speech: "Request Canceled, Goodbye",
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
    var cardTitle = "Welcome to the Direct Supply application, Say Help for a full list of options.";
    var speechText = "Welcome to the Direct Supply application, Say Help for a full list of options.";
    var cardOutput = "Welcome to Direct Supply";
    var repromptText = "Say Help for a full list of options.";
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

function handleDSCreatePMORequest(intent, session, response) {
        var cardTitle = "Open a PMO Request";
        var cardOutput = "What you've just said is one of the most insanely idiotic things I have ever heard. At no point in your rambling, incoherent response were you even close to anything that could be considered a rational thought. Everyone in this room is now dumber for having listened to it. I award you no points, and may God have mercy on your soul.";
        var speechText = "What you've just said is one of the most insanely idiotic things I have ever heard. At no point in your rambling, incoherent response were you even close to anything that could be considered a rational thought. Everyone in this room is now dumber for having listened to it. I award you no points, and may God have mercy on your soul.";
        
        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

        response.tellWithCard(speechOutput, cardTitle, cardOutput);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleContactNameRequest(intent, session, response) {
    //Check if session variables are already initialized.
    session.attributes.stage = 0;
    var cardTitle = "Open a CSR";
    var cardOutput = "To open a CSR we need your full name.  Please state your full name.";
    var speechText = "To open a CSR we need your full name.  Please state your full name.";
    var repromptText = "In order to open a CSR we need your full name.  Please state your name.";

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

function handleDSCallMeRequest(intent, session, response){
        var cardTitle = "Call from your Account Manager";
        var cardOutput = "Your account manager, Kevin Bacon, has been notified and will contact you shortly.";
        var speechText = "Your account manager, Kevin Bacon, has been notified and will contact you shortly.";
        
        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

        response.tellWithCard(speechOutput, cardTitle, cardOutput);
        
}

function handleDSMarketingRequest(intent, session, response){
        var cardTitle = "Promotions";
        var cardOutput = "Current Direct Supply promoitions include 10% off all invocare wheelchairs, contact your account manager for more details.";
        var speechText = "Current Direct Supply promoitions include 10% off all invocare wheelchairs, contact your account manager for more details.";
        
        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

        response.tellWithCard(speechOutput, cardTitle, cardOutput);
        
}


function handleCSRStatusRequest(intent, session, response){
    var speechText = "";
    session.attributes.stage = 3;
    var url = statusUrlPrefix + intent.slots.number.value;
    session.attributes.csrnumber = intent.slots.number.value;
    session.attributes.url = url;

    //get the csr status via webservice
    getJsonCSR(url, session, function (csrResponse) { 
        
        //set the response here
        var cardTitle = "CSR Status";
        var cardOutput = "CSR number " + session.attributes.csrnumber + " currently has a status of " + csrResponse;
        speechText = "CSR number " + session.attributes.csrnumber + " currently has a status of " + csrResponse;
        
        var speechOutput = {
            speech: "<speak>" + speechText + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

        response.tellWithCard(speechOutput, cardTitle, cardOutput);
        
    });

}


function handleItemsRequest(intent, session, response) {
    var speechText = "";
    var repromptText = "";
    var cardTitle = "";
    var cardOutput = "";

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
            cardTitle = "Items affected";
            cardOutput = "What items would you like to add to this CSR?";
            
            var speechOutput = {
                speech: '<speak>' + speechText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            var repromptOutput = {
                speech: '<speak>' + repromptText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
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
            cardTitle = "CSR Details";
            cardOutput = "What are the details of your CSR?";
            
            
            var speechOutput = {
                speech: '<speak>' + speechText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            var repromptOutput = {
                speech: '<speak>' + repromptText + '</speak>',
                type: AlexaSkill.speechOutputType.SSML
            };
            
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
        }
        
        //assign the details and create the CSR
        else if(session.attributes.stage === 2) {
            
            //save description here
            session.attributes.details = intentValue;
            var url = urlPrefix + session.attributes.contactname.value + "&Items=" + session.attributes.items.value + "&Details=" + session.attributes.details.value;
            //create the CSR via webservice, session.attributes.contactname, session.attributes.items, itemSlot.value (Details)
            getJsonCSR(url, session, function (csrResponse) { 
                var cardTitle = "CSR Created!";
                var cardOutput = "Request " + csrResponse + " has been created, a customer service representative will follow up with you soon.";
                
                //set the response here
                speechText = "Request " + csrResponse + " has been created, a customer service representative will follow up with you soon.";
                
                var speechOutput = {
                    speech: "<speak>" + speechText + "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                };

                response.tellWithCard(speechOutput, cardTitle, cardOutput);
                
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

    
    // var prefixContent = "<p>CSR for item " + itemValue + ", </p>";
    // var cardContent = "CSR for item " + itemValue + ", ";

    // var cardTitle = "CSR for item " + itemValue;

    
}

function getJsonCSR(url, session, eventCallback) {


    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            eventCallback(body);
        }
        else{

        }
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the CSR Skill.
    var skill = new CSRSkill();
    skill.execute(event, context);
};
