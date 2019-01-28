/**
 * Author:    Guha Arumugam
 * Created:   08.11.2018
 * Company:   Acumen Solution Inc
 * 
 * Revised by:    <Revised Author>
 * Revised Date:  <Revised Date>
 * 
 * (c) Copyright under MIT License Terms (https://github.com/guhaanandhnec08/SalesforceAlexaIntegration).
 **/

/**
 * App ID for the skill to restrict access
 */
var APP_ID = 'amzn1.ask.skill.646f674c-8070-488c-a2a0-ae4b92dca1a2';
//'amzn1.ask.skill.646f674c-8070-488c-a2a0-ae4b92dca1a2'; 
//replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/*** 
 * NEED TO BE SECURED IN AN ENCRYPTED FILE FOR SECURE ACCESS
 */
var CLIENT_ID = '<Client ID from Connected App in Salesforce>';
var CLIENT_SECRET = '<Client Secret key from Connect App>';
var USERNAME = '<Super Admin Username>';
var PASSWORD = '<Super Admin Password with Security token>';
var CALLBACK_URL = 'http://localhost:3000/oauth/_callback';

/*** 
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var nforce = require('nforce');
var _ = require('lodash');
var moment = require('moment-timezone');
var pluralize = require('pluralize');
var creds = require('creds.js');

//STATIC VARIABLES 
var spchIntent = '';

/*** 
 * Salesforce is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Salesforce = function () {
  AlexaSkill.call(this, APP_ID);
};

var org = nforce.createConnection({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: CALLBACK_URL,
  environment: 'production',
  mode: 'single'
});

// Extend AlexaSkill
Salesforce.prototype = Object.create(AlexaSkill.prototype);
Salesforce.prototype.constructor = Salesforce;

Salesforce.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log("Salesforce onSessionStarted requestId: " + sessionStartedRequest.requestId +
    ", sessionId: " + session.sessionId);
  // any initialization logic goes here
};

//Welcome message from Alexa as a part of App initiation
Salesforce.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log("Salesforce onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  response.ask("Hi! Welcome to Cable Plus Application. I'm happy to help you today, but before that can you please confirm if you are a customer or a service agent?");
};

/*** 
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Salesforce.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log("Salesforce onSessionEnded requestId: " + sessionEndedRequest.requestId +
    ", sessionId: " + session.sessionId);
  // any cleanup logic goes here
};



Salesforce.prototype.intentHandlers = {
  /*** 
  Confirm the User Type 
  */
  // Ask for user type
  caseGetUserTypeIntent: function (intent, session, response) {
    handleCaseGetUserTypeRequest(intent, session, response);
  },
  //Authenticate User with the passcode
  CaseUserAuthenticateIntent: function (intent, session, response) {
    handleCaseUserAuthRequest(intent, session, response);
  },
  /***/


  /*** 
  FETCH DETAILS OF A CASE 
  */
  // check the status of an case by number
  CheckCaseIntent: function (intent, session, response) {
    console.log('>>>>CheckCaseIntent');
    handleCaseFindRequest(intent, session, response);
  },
  CheckCaseFieldIntent: function (intent, session, response) {
    console.log('>>>>CheckCaseFieldIntent');
    handleFetchCaseRequest(intent, session, response);
  },
  /***/


  /*** 
  CREATING A NEW CASE
  */
  // Case create intent
  CaseStartIntent: function (intent, session, response) {
    handleCaseStartRequest(intent, session, response);
  },
  // Case Customer First Name
  CustomerFNameIntent: function (intent, session, response) {
    handleCustomerFNAMERequest(intent, session, response);
  },
  // Case Customer Last Name
  CustomerLNameIntent: function (intent, session, response) {
    handleCustomerLNAMERequest(intent, session, response);
  },
  // Case subject intent
  CaseGetSubjectIntent: function (intent, session, response) {
    handleCaseGetSubIntent(intent, session, response);
  },
  // Case description intent
  CaseGetDescriptionIntent: function (intent, session, response) {
    handleCaseGetDescIntent(intent, session, response);
  },
  // Case priority intent
  CaseGetPriorityIntent: function (intent, session, response) {
    handleCaseGetPriorityIntent(intent, session, response);
  },
  /***/



  /*** 
  UPDATING A CASE
  */
  //Tell: Update a case --> Alexa asks Case #
  UpdateCaseIntent: function (intent, session, response) {
    handleUpdateCaseIntent(intent, session, response);
  },
  //Tell: Case # is --> Alexa asks for field
  UpdateCaseGetNumIntent: function (intent, session, response) {
    handleUpdateCaseGetNumIntent(intent, session, response);
  },
  //Tell: field is  --> Alexa asks for value for the field
  UpdtGetCaseFieldIntent: function (intent, session, response) {
    handleUpdtGetCaseFieldIntent(intent, session, response);
  },
  //Tell: field value is  --> Alexa updates the field for the given case #
  UpdtGetCaseFieldValIntent: function (intent, session, response) {
    handleUpdtGetCaseFieldValIntent(intent, session, response);
  },
  /***/



  /*** 
  CLOSE A CASE
  */
  //Tell: Close a case --> Alexa ask case #
  CloseCaseIntent: function (intent, session, response) {
    handleCaseCloseRequest(intent, session, response);
  },
  //Tell: Case # --> Alexa asks reason for closing the case
  CloseCaseGetNumberIntent: function (intent, session, response) {
    handleCloseCaseGetNumberIntent(intent, session, response);
  },
  //Tell: Reason is --> Alexa will close the case
  UpdateCaseCloseIntent: function (intent, session, response) {
    console.log('INTENT ?????', intent);
    handleUpdateCloseCaseIntent(intent, session, response);
  },
  /***/


  /*** 
  NEW CASES CREATED TODAY
  */
  //Tell: Any cases for me today --> Alexa reads list of cases
  ListNewCasesRequest: function (intent, session, response) {
    handleListNewCasesRequest(intent, session, response);
  },
  /***/


  /*** 
  CHECK MY CALENDAR
  */
  //Tell: Any events created for today --> Alexa reads all the tasks created for today
  MyCalendarIntent: function (intent, session, response) {
    handleMyCalendarRequest(response);
  },
  /***/


  /*** 
  Default Help intent for Alexa - Salesforce app
  *
  //Tell: If Alexa did not understand this intent will be triggered
  */
  HelpIntent: function (intent, session, response) {
    response.ask("You can ask me to check for any new cases. The status of a specific case or to create a new case, or, you can say exit... What can I help you with today?");
  },
  /***/


  /*** 
  THANK YOU INTENT FOR ALEXA 
  *
  //Tell: Thanks/Thank you/Good Bye --> Alexa bids good bye
  */
  StopIntent: function (intent, session, response) {
    response.tellWithCard("Okay! See you later " + userAlexaName + ". Have a nice day!");
  },
  /***/

};

/***********************************************
 ******* User Authentication funtaions *********
 ***********************************************/
var userTypeVar = '';
var userAlexaName = '';
var userAuthTrialOne = false;

function isUserHasVal() {
  console.log(userTypeVar);
  if (userTypeVar == 'customer' || userTypeVar == 'service agent') {
    return true;
  } else
    return false;
}

function isUser() {
  console.log(userTypeVar);
  if (userTypeVar == 'service agent') {
    return true;
  } else
    return false;
}

function isCustomer() {
  console.log(userTypeVar);
  if (userTypeVar == 'customer') {
    return true;
  } else
    return false;
}
/***********************************************
 ******* END of Authentication *********
 ***********************************************/

/*
REDIRECT TO AUTHENTICATE
*/
function handleRedirectToAuth(intent, session, response) {
  var speechOutput = "";

  speechOutput = "I'm sorry there is some problem authenticating you. Can you please confirm if you are a customer or a service agent one more time?";

  response.ask(speechOutput);
}
/***/


/*** 
Authenticate the user with Alexa User Authenitcation object in salesforce
*
//Tell: Tell if you are customer/Service Agent --> Alexa welcomes the appropriate user.
*/
function handleCaseGetUserTypeRequest(intent, session, response) {
  var speechOutput = "";
  userTypeVar = session.attributes.userType = intent.slots.userType.value;
  //var userType = session.attributes.userType;
  console.log(userTypeVar);
  if (userTypeVar == 'customer') {
    speechOutput = "Thanks for connecting with us! How can I help you today? ";
  } else if (userTypeVar == 'service agent') {
    speechOutput = "Thanks for confirming. Can you please authenticate yourself. Just to make sure you are not fooling my intelligence... Please read your passcode assigned to you.";
  }
  response.ask(speechOutput);
}
/***/


/*** 
Authenticate the user with Alexa User Authenitcation object in salesforce.
*
//Alexa takes your passcode and identifies you in the system. 
*/
function handleCaseUserAuthRequest(intent, session, response) {
  var userPasscode = session.attributes.userPasscode = intent.slots.userPasscode.value;
  console.log('>>>>', userPasscode);
  var query = "Select Passcode__c,UserName__c from User_Authentication__c where Passcode__c = '" + userPasscode + "'" + " Limit 1";
  org.authenticate({
      username: USERNAME,
      password: PASSWORD
    })
    .then(function () {
      return org.query({
        query: query
      })
    }).then(function (results) {
      var speechOutput = 'Sorry, I could not find you in the system. Are you sure you are an authenticated service agent? Please try again reading your passcode slowly one more time.';
      if (results.records.length > 0) {
        var cs = results.records[0];
        userAlexaName = cs.get('UserName__c');
        speechOutput = 'Hello ' + cs.get('UserName__c') + '! Welcome back! Thank You for authenticating yourself. How can I help you Today?';
        response.ask(speechOutput, "Salesforce", speechOutput);
      } else {
        if (userAuthTrialOne == false) {
          userAuthTrialOne = true;
          response.ask(speechOutput, "Salesforce", speechOutput);
        } else {
          speechOutput = 'Sorry again, Looks like you are not a service agent in Cable Plus system. Please try creating a new passcode in your salesforce system or please contact your system administrator';
          response.tellWithCard(speechOutput, "Salesforce", speechOutput);
        }
      }
    }).error(function (err) {
      var errorOutput = 'Sorry, there was a problem while making connection with Cable Plus application.';
      response.tellWithCard(errorOutput, "Salesforce", errorOutput);
    });

}
/***/




/*** 
CREATE A NEW CASE
*
//Tell: Want to create a case --> Alexa asks for purpose/subject.
*/
function handleCaseStartRequest(intent, session, response) {
  spchIntent = '';
  if (isUserHasVal()) {
    handleCustomerINFORequest(intent, session, response);
  } else
    handleRedirectToAuth(intent, session, response);
}

//INTERNAL METHOD ONLY
//Alexa asks for FIRST NAME of the customer.
function handleCustomerINFORequest(intent, session, response) {
  spchIntent = '';
  if (isUserHasVal()) {
    if (isCustomer()) {
      var speechOutput = "Before creating your request, can I have some of your basic information? Can you please give me your first name.";
      response.ask(speechOutput);
    } else if (isUser()) {
      var speechOutput = "Sure, Can you please give me the First Name of your customer?";
      response.ask(speechOutput);
    }
  } else {
    handleRedirectToAuth(intent, session, response);
  }
}
//FIRST NAME: Alexa asks for first name of the customer.
function handleCustomerFNAMERequest(intent, session, response) {
  spchIntent = '';
  session.attributes.FirstName = intent.slots.FirstName.value;
  console.log('>>>>>', session.attributes.FirstName);
  if (isUserHasVal()) {
    if (isCustomer()) {
      var speechOutput = "And... Your Last name?";
      response.ask(speechOutput);
    } else if (isUser()) {
      var speechOutput = "OK, What is the last name of the customer?";
      response.ask(speechOutput);
    }
  } else
    handleRedirectToAuth(intent, session, response);
}
//LAST NAME: Alexa asks for last name of the customer.
function handleCustomerLNAMERequest(intent, session, response) {
  spchIntent = '';
  //console.log(isUserHasVal());
  session.attributes.LastName = intent.slots.LastName.value;
  console.log('>>>>>', session.attributes.LastName);
  if (isUserHasVal()) {
    if (isCustomer()) {
      var speechOutput = "OK now, let's create a new request., What is the purpose of your new case request?";
      response.ask(speechOutput);
    } else if (isUser()) {
      var speechOutput = "OK, What is the purpose of your new case request?";
      response.ask(speechOutput);
    }
  } else
    handleRedirectToAuth(intent, session, response);
}

//Tell: Tell the subject line for the case --> Alexa asks for the description for the case.
function handleCaseGetSubIntent(intent, session, response) {
  if (isUserHasVal()) {
    if (isCustomer()) {
      var speechOutput = "Got it, Can you describe your purpose with more details please? It will help us to provide the resolusion with minimum turn around time.";
      session.attributes.Subject = intent.slots.Subject.value;
      console.log('>>>>>', session.attributes.Subject);
      response.ask(speechOutput);
    } else if (isUser()) {
      var speechOutput = "Okay. What is the description for this case?";
      session.attributes.Subject = intent.slots.Subject.value;
      console.log('>>>>>', session.attributes.Subject);
      response.ask(speechOutput);
    }
  } else
    handleRedirectToAuth(intent, session, response);
}

//Tell: Tell the description for the case --> Alexa asks for priority of the case.
function handleCaseGetDescIntent(intent, session, response) {
  if (isUserHasVal()) {
    if (isCustomer()) {
      var speechOutput = "Okay!, What's the priority of your request?";
      session.attributes.Description = intent.slots.Description.value;
      console.log('>>>>>', session.attributes.Description);
      response.ask(speechOutput);
    } else if (isUser()) {
      var speechOutput = "Okay!, What's the priority for this case?";
      session.attributes.Description = intent.slots.Description.value;
      console.log('>>>>>', session.attributes.Description);
      response.ask(speechOutput);
    }
  } else
    handleRedirectToAuth(intent, session, response);
}

//Tell: Tell the priority value for the case --> Alexa creates the case and confirms the user.
function handleCaseGetPriorityIntent(intent, session, response) {
  var caseID;
  var obj = nforce.createSObject('Case');
  obj.set('Subject', session.attributes.Subject);
  obj.set('Description', session.attributes.Description);
  if (intent.slots.Priority.value == 'high' || intent.slots.Priority.value == 'HIGH' || intent.slots.Priority.value == 'High') {
    obj.set('Priority', 'Critical');
  } else if (intent.slots.Priority.value == 'medium' || intent.slots.Priority.value == 'Medium' || intent.slots.Priority.value == 'MEDIUM') {
    obj.set('Priority', 'Major');
  } else {
    obj.set('Priority', 'Minor');
  }
  //Replace with a apex call to fecth recordtypeId dynamically
  obj.set('RecordTypeId', '012f10000019URDAA2');
  obj.set('Type', 'Problem');
  obj.set('Status', 'New');
  obj.set('Country_CablePlus__c', 'US');
  obj.set('State__c', 'VA');
  obj.set('Origin', 'Alexa');
  obj.set('Reason', 'New problem');
  obj.set('AlexaContactFirstName__c', session.attributes.FirstName);
  obj.set('AlexaContactLastName__c', session.attributes.LastName);
  console.log('>>>>>', session.attributes.Subject);
  console.log('>>>>>', session.attributes.Description);
  console.log('>>>>>', intent.slots.Priority.value);
  console.log('>>>>>', session.attributes.FirstName);
  console.log('>>>>>', session.attributes.LastName);

  org.authenticate({
      username: USERNAME,
      password: PASSWORD
    })
    .then(function () {
      return org.insert({
        sobject: obj
      })
    }).then(function (results) {
      if (results.success) {
        console.log(results);

        caseID = results.id;

        fetchCreatedCase(caseID, session, response, 'insert');
      } else {
        speechOutput = 'Sorry, there was a problem in salesforce while creating your request. Please try again.';
        response.tellWithCard(speechOutput, "Salesforce", speechOutput);
      }
    }).error(function (err) {
      var errorOutput = 'Sorry, there was a problem in salesforce authentication. Please try again.';
      response.tell(errorOutput, "Salesforce", errorOutput);
    });
}
/***/


/*** 
UPDATE A CASE WITH CASE #
*
//Tell: Want to update a case --> Alexa asks for the case #
*/
function handleUpdateCaseIntent(intent, session, response) {
  spchIntent = '';
  console.log(userTypeVar);
  if (isUserHasVal()) {
    if (isUser()) {
      var speechOutput = "Sure, Tell me the request or case number?";
      response.ask(speechOutput);
    } else {
      var speechOutput = "Sorry, As a customer you do not have permission to update a case request. Please email or call our service agents for further assistance. Is there anything else I can help you with?";
      response.ask(speechOutput);
    }
  } else
    handleRedirectToAuth(intent, session, response);
}
//Tell: Tell the case # --> Alexa asks for the field to update.
function handleUpdateCaseGetNumIntent(intent, session, response) {
  if (spchIntent == 'close case') {
    console.log(spchIntent);
    session.attributes.caseNumUpd = intent.slots.caseNumUpd.value;
    handleCloseCaseGetNumberIntent(intent, session, response);
  } else if (spchIntent == 'fetch case') {
    console.log(spchIntent);
    session.attributes.caseNumUpd = intent.slots.caseNumUpd.value;
    handleCaseNumFindRequest(intent, session, response);
  } else {
    var speechOutput = "Got it, Which field do you want to update?";
    session.attributes.caseNumUpd = intent.slots.caseNumUpd.value;
    response.ask(speechOutput);
  }

}
//Tell: Tell the Field name to update --> Alexa asks for the value for the field to update.
function handleUpdtGetCaseFieldIntent(intent, session, response) {
  if (spchIntent == 'fetch case') {
    console.log(spchIntent);
    handleFetchCaseRequest(intent, session, response);
  } else {
    session.attributes.UPDATE_FIELD = intent.slots.UPDATE_FIELD.value;
    var speechOutput = "Okay, what is the value you want to update for " + session.attributes.UPDATE_FIELD + "?";

    response.ask(speechOutput);
  }

}
//Tell: Tell the field value --> Alexa updates the field value and confirms back to the user.
function handleUpdtGetCaseFieldValIntent(intent, session, response) {
  var caseNumber = session.attributes.caseNumUpd;
  session.attributes.UPD_FLD_VAL = intent.slots.UPD_FLD_VAL.value;
  var q = "Select id,status,priority,caseNumber from case where caseNumber = '" + caseNumber + "'";
  var caseID;
  var speechOutput;
  org.authenticate({
      username: USERNAME,
      password: PASSWORD
    })
    .then(function () {
      org.query({
        query: q
      }, function (err, resp) {
        if (!err && resp.records) {
          console.log(resp.records[0]);
          var cs = resp.records[0];
          console.log('$$$$ Field Val: ', session.attributes.UPD_FLD_VAL);
          cs.set('status', session.attributes.UPD_FLD_VAL);
          console.log('$$$$ Field Values Set.');
          org.update({
            sobject: cs
          }, function (err, resp) {
            console.log('Entering Update!');
            if (!err) {
              console.log(resp);
              console.log(intent.slots.UPD_FLD_VAL.value);
              console.log(session.attributes.UPDATE_FIELD);
              console.log('$$$$ Update worked!');
              speechOutput = 'The Request ' + caseNumber + 'is updated successfuly. Is there anything else I can help you with?';
              response.ask(speechOutput, "Salesforce", speechOutput);
            } else {
              console.log('$$$$ Update Failed!');
              speechOutput = 'The case Update Failed. Please Try again.';
              response.ask(speechOutput, "Salesforce", speechOutput);
            }
          });
        } else {
          console.log('$$$$ Query Failed!');
          speechOutput = 'Sorry, there was a salesforce problem while retrieveing the case. Please try again.';
          response.tellWithCard(speechOutput, "Salesforce", speechOutput);
        }

      });
    }).error(function (err) {
      var errorOutput = 'Sorry, there was a Salesforce problem, Salesforce authentication failed.';
      response.tell(errorOutput, "Salesforce", errorOutput);
    });

}
/***/


/*** 
CLOSE A CASE WITH THE CASE #
*
//Tell: Want to close a case --> Alexa asks for a case # 
*/
function handleCaseCloseRequest(intent, session, response) {
  spchIntent = 'close case';
  if (isUserHasVal()) {
    if (isUser()) {
      var speechOutput = "OK, Please tell me the case number or request number to close.";
      response.ask(speechOutput);
    } else {
      var speechOutput = "Sorry, As a customer you do not have permission to close a case request. Please email or call our service agents for further assistance. Is there anything else I can help you with?";
      response.ask(speechOutput);
    }
  } else {
    handleRedirectToAuth(intent, session, response);
  }
}
//Tell: Tell the case # --> Alexa asks for reason to close the case.
function handleCloseCaseGetNumberIntent(intent, session, response) {
  session.attributes.caseNumUpd = intent.slots.caseNumUpd.value;
  var speechOutput = "Got it!, What is your reason for closing the request or case?.";
  response.ask(speechOutput);
}
//Tell: Tell the reason to close the case --> Alexa closes the case and confirms the user.
function handleUpdateCloseCaseIntent(intent, session, response) {
  var caseReason = session.attributes.caseReason = intent.slots.caseReason.value;
  var caseNumber = session.attributes.caseNumUpd;
  var caseID;
  var speechOutput;
  var q = "Select id,status,caseNumber,Reason,Close_Reason__c,Case_Comments_Alexa__c from case where caseNumber = '" + caseNumber + "'";
  org.authenticate({
      username: USERNAME,
      password: PASSWORD
    })
    .then(function () {
      org.query({
        query: q
      }, function (err, resp) {
        if (!err && resp.records) {
          console.log(resp.records[0]);
          var cs = resp.records[0];
          cs.set('status', 'Closed');
          cs.set('Close_Reason__c', 'Issue/Problem Resolved');
          cs.set('Case_Comments_Alexa__c', caseReason);
          console.log('@@@@ Case close attributes are set.');
          org.update({
            sobject: cs
          }, function (err, resp) {
            console.log('Entering close update!');
            if (!err) {
              console.log(resp);
              console.log(session.attributes.caseReason);
              console.log(session.attributes.caseNumUpd);
              console.log('@@@@ close worked!');
              spchIntent = '';
              speechOutput = 'Cool! The Request ' + caseNumber + 'is closed successfuly. The customer will be notified with an email. Is there anything else I can help you with?';
              response.ask(speechOutput, "Salesforce", speechOutput);
            } else {
              console.log('@@@@ close Failed!');
              speechOutput = 'Sorry, The case closure Failed. Please Try again.';
              response.ask(speechOutput, "Salesforce", speechOutput);
            }
          });
        } else {
          console.log('@@@@ Query Failed!');
          console.log(resp);
          console.log(err);
          speechOutput = 'Sorry, there was a salesforce problem while querying the case. Please try again.';
          response.tellWithCard(speechOutput, "Salesforce", speechOutput);
        }
      });
    }).error(function (err) {
      var errorOutput = 'Sorry, there was a Salesforce problem, Salesforce authentication failed.';
      response.tellWithCard(errorOutput, "Salesforce", errorOutput);
    });

}
/***/


/*** 
FETCH A CASE BY CASE #
*
//Tell: Tell me about a case --> Alexa asks for case number.
*/
function handleCaseFindRequest(intent, session, response) {
  spchIntent = 'fetch case';
  if (isUserHasVal()) {
    if (isUser()) {
      var speechOutput = "OK, Please tell me the case number or request number to find.";
      response.ask(speechOutput);
    } else {
      var speechOutput = "Sorry, unfortunately we do not have this feature available for customers. Please search for your case in our community portal by clicking on the link provided in the email for the respective case. For more assistance, please email or contact our service agents. Is there anything else I can help you with?";
      response.ask(speechOutput);
    }
  } else {
    handleRedirectToAuth(intent, session, response);
  }
}
//Tell: Tell the case # --> Alexa asks about the field to read from the case.
function handleCaseNumFindRequest(intent, session, response) {
  spchIntent = 'fetch case';
  var speechOutput = "Got it, What information you want to know about this case?.";
  response.ask(speechOutput);

}
//Tell: Tell the field name --> Alexa gets the field data and reads out.
function handleFetchCaseRequest(intent, session, response) {
  var caseNumber = session.attributes.caseNumUpd;
  var fieldName = intent.slots.chckCaseFld.value;
  console.log(fieldName);
  var query = "Select id, Status, Priority, Subject, Description,Case_Comments_Alexa__c from case where caseNumber = '" + caseNumber + "'";
  // auth and run query
  org.authenticate({
      username: USERNAME,
      password: PASSWORD
    })
    .then(function () {
      return org.query({
        query: query
      })
    }).then(function (results) {
      var speechOutput = 'Sorry, I could not find a case with number, ' + caseNumber;
      if (results.records.length > 0) {
        var cs = results.records[0];
        if (fieldName != '' && fieldName != null && fieldName != 'null' && fieldName != undefined && undefined != 'undefined') {
          console.log(fieldName);
          speechOutput = 'I found the case. The ' + fieldName + ' of ' + caseNumber + ' is ' + cs.get(fieldName) + '. Is there anything else I can help with?';
        } else {
          speechOutput = 'I found case ' + caseNumber + ' with status' + cs.get('status') +
            ', the priority is ' + cs.get('Priority');
        }
      }
      response.ask(speechOutput, "Salesforce", speechOutput);
    }).error(function (err) {
      var errorOutput = 'Sorry, there was a problem while making connection with salesforce.';
      response.tellWithCard(errorOutput, "Salesforce", errorOutput);
    });

}
/***/


/*** 
ALL OPEN CASES TODAY
*
//ListNewCasesRequest -->  List any cases created today
*/
function handleListNewCasesRequest(intent, session, response) {
  if (isUserHasVal()) {
    if (isUser()) {
      var query = "Select casenumber, status, subject, priority from case where status!='Closed' AND CreatedDate = TODAY and createdBy.username ='" + USERNAME + "'";
      // auth and run query
      org.authenticate({
          username: USERNAME,
          password: PASSWORD
        })
        .then(function () {
          return org.query({
            query: query
          })
        }).then(function (results) {
          speechOutput = 'Sorry, you do not have any new cases for today. Enjoy your relaxed day. Is there anything else I can help you with?'
          var recs = results.records;
          if (recs.length > 0) {
            speechOutput = 'You have ' + recs.length + ' new ' + pluralize('case', recs.length) + ', The first case number is ';
            for (i = 0; i < recs.length; i++) {
              speechOutput += i + 1 + ',  ' + recs[i].get('casenumber') + ' with status ' + recs[i].get('status') + '. The case subject is ' +
                recs[i].get('subject') + ', and the priority of this request is ' + recs[i].get('priority') + ',  ';
              if (i === recs.length - 2) speechOutput += '. Your next case number is';
            }
            speechOutput += ', That is all for you have for today. Is there anything else I can help you with?';
          }
          // Create speech output
          response.ask(speechOutput, "Salesforce", speechOutput);
        }).error(function (err) {
          var errorOutput = 'Sorry, there was a Salesforce problem while authentication.';
          response.tellWithCard(errorOutput, "Salesforce", errorOutput);
        });
    } else {
      var speechOutput = "Sorry, As a customer you do not have permission to search for a case. Please email or contact our service agents for further assistance. Is there anything else I can help you with? ";
      response.ask(speechOutput);
    }
  } else {
    handleRedirectToAuth(intent, session, response);
  }
}
/***/


/*** 
REUSABLE METHOD
*
//Used for inserting and updating case with case #
*/
function fetchCreatedCase(caseID, session, response, param) {
  var caseID = caseID;
  var speechOutput = "";
  var cs;
  var keyWrd = param;
  console.log(keyWrd);
  var query = "Select id, Status, subject, caseNumber, Priority,AlexaContactFirstName__c,AlexaContactLastName__c from case where id = '" + caseID + "'";
  // auth and run query
  org.authenticate({
      username: USERNAME,
      password: PASSWORD
    })
    .then(function () {
      return org.query({
        query: query
      })
    }).then(function (results) {
      //var speechOutput = 'Sorry, I could not find a case with number, ' + caseNumber;
      if (results.records.length > 0) {
        cs = results.records[0];
        console.log(param);
        if (keyWrd == 'insert') {
          speechOutput = "Bingo! your request regarding the purpose " + cs.get('subject') + " is submitted. Your request number is " + cs.get('caseNumber') +
            '. An agent from our support team will reach out to you soon. Is there anything else I can help you with?';
        } else {
          speechOutput = "Awesome! I updated your request " + cs.get('caseNumber') +
            '. Is there anything else I can help you with?';
        }

      }
      response.ask(speechOutput, "Salesforce", speechOutput);
    }).error(function (err) {
      var errorOutput = 'Sorry, there was a problem with Salesforce authentication. Please try again later';
      response.tell(errorOutput, "Salesforce", errorOutput);
    });

}
/***/

/*** 
Create the handler that responds to the Alexa Request.
*/
exports.handler = function (event, context) {
  // Create an instance of the Salesforce skill.
  var salesforce = new Salesforce();
  salesforce.execute(event, context);
};
/***/