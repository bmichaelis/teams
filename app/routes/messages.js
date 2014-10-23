var express    = require('express'); 		// call express
var messages    = express.Router();
var Message     = require('../models/message');
var Player     = require('../models/player');
var loggly 		 = require('loggly');

var voicejs   = require('voice.js');
var client = new voicejs.Client({
    email: 'brett.michaelis@gmail.com',
    password: 'MIch@0076!',
    tokens: require('voice.js/tokens.json')
});
var logclient = loggly.createClient({
    token: "e3aabc3f-835f-4a34-8bcc-5f722b988922",
    subdomain: "teams",
    tags: ["NodeJS"],
    json:true
});

messages.create = function(msg) {

    if(!msg.phone || !msg.message)
      return false;

    // create a message
    var message = new Message(); 		// create a new instance of the Message model
    message.player = msg.player;  // set the messages name
    message.phone = msg.phone;  // set the messages name
    message.message = msg.message;  // set the messages name
    message.thread = msg.thread ;  // set the messages name
    message.sent = false;

    // save the message and check for errors
    message.save(function(err) {
      if (err)
        res.send(err);
      logclient.log('Message Created.');
    });
};


messages.processOut = function() {
    Message.findOneAndUpdate({"sent": false}, { "sent": true }, function(err, item) {
        if(item != null && item != undefined) {
          client.sms({ to: item.phone, text: item.message}, function(err, res, data) {
            // logclient.log(item);
            // logclient.log(res);
            // logclient.log(data);
          });
        }
    });
    console.log("Finished running messages.processOut()");
};

messages.processIn = function() {
  // Get 10 unread sms messages at a time
  client.get('unread', {limit:10}, function(error, response, data){
    if(error){
      return console.log(error);
    }

    if(!data || !data.conversations_response || !data.conversations_response.conversationgroup) {
      return console.log('No conversations.');
    }

    data.conversations_response.conversationgroup.forEach(function(convo){
      console.log(convo.conversation.id);
      var count = 0;
      convo.call.reverse().some(function(msg){
        count = count + 1;
        if(msg.message_text)
          console.log("msg" + count + ":" + msg.message_text);
        // If the message only contains the word "stop" then toggle the player to active=false
        if(msg.message_text && msg.message_text.match(/^ *stop *$/i)) {
          Player.findOneAndUpdate({"cellPhone": convo.call[0].phone_number.substr(2), "active": true}, { "active": false }, function(err, item) {
              client.set('mark', {read: true, toggleTrash: true, id: convo.conversation.id}, function(error, response, data){
                if(item != null && item != undefined) {
                  console.log('stopping and replying to:', convo.call[0].phone_number.substr(2));
                  messages.create({"phone": item.cellPhone, "message": "You have been removed from the list."});
                  return true;
                }
              });
          });
        }

        // If the message only contains the word "start" then toggle the player to active=true
        else if(msg.message_text && msg.message_text.match(/^ *start *$/i)) {
          Player.findOneAndUpdate({"cellPhone": convo.call[0].phone_number.substr(2), "active": false}, { "active": true }, function(err, item) {
              client.set('mark', {read: true, toggleTrash: true, id: convo.conversation.id}, function(error, response, data){
                if(item != null && item != undefined) {
                  console.log('starting and replying to:', convo.call[0].phone_number.substr(2));
                  messages.create({"phone": item.cellPhone, "message": "You have been added to the list."});
                  return true;
                }
              });
          });
        }

        // If the message does not contain any key words, then mark it as read and move on to the next one
        else {
          client.set('mark', {read: true, id: convo.conversation.id}, function(error, response, data){
            if(error){
              return console.log(error);
            }
            if(msg.message_text != null && msg.message_text != undefined) {
              //console.log(new Date(msg.start_time).toISOString().replace(/[ZT]/g,' ').substr(0,16), msg.message_text);
              return true;
            }
          });
        }
      });
    });
  });
  console.log("Finished running messages.processIn()");
}

module.exports.messages = messages;
