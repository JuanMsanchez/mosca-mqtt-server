var http     = require('http');
var httpServ = http.createServer();
var mosca    = require('mosca');
var _        = require('lodash');
var users    = require("./db.json").users;

/* for now there is no need of this will be needed
https://github.com/mcollina/mosca/wiki#does-it-scale
var ascoltatore = {
  type: 'mqtt',
  json: false,
  mqtt: require('mqtt'),
  url: 'mqtt://192.168.0.17:8883',
  clientId: "mosca-bridge",
  username: 'mqtt-user',
  password: 'mqtt'
};

var moscaSettings = {
  port: 1883,
  backend: ascoltatore
};
*/

var moscaSettings = { port: 1883 };
var mqttServ = new mosca.Server(moscaSettings);

//Attach http server for websocket client connection
//https://github.com/mcollina/mosca/wiki/MQTT-over-Websockets#separate-http-server
mqttServ.attachHttpServer(httpServ);
httpServ.listen(3000);




mqttServ.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

mqttServ.on('published', function(packet, client) {
  console.log('Published', packet.payload.toString());
});

mqttServ.on('ready', setup);

function setup() {
  mqttServ.authenticate = authenticate;
  mqttServ.authorizePublish = authorizePublish;
  mqttServ.authorizeSubscribe = authorizeSubscribe;
  console.log('Mosca server is up and running');
}

// Accepts the connection if the username and password are valid
var authenticate = function(client, username, password, callback) {
  var authorized = _.find(users, function(user){
    return user.username == username
      && user.password == password.toString();
  });

  if (authorized) client.user = username;

  if (authorized)
    console.log("authorized user %s:%s",username, password);
  else
    console.log("unauthorized user %s:%s",username, password);

  callback(null, authorized);
};

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function(client, topic, payload, callback) {
  var mainTopic = topic.split('/')[1];
  var authorized = client.user == mainTopic;

  if (authorized)
    console.log("authorized publish to topic %s for user %s", topic, client.user);
  else
    console.log("unauthorized publish to topic %s for user %s", topic, client.user);
  callback(null, authorized);
};

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function(client, topic, callback){
  var mainTopic = topic.split('/')[1];
  var authorized = client.user == mainTopic;

  if (authorized)
    console.log("authorized subscription topic %s for user %s", topic, client.user);
  else
    console.log("unauthorized subscription topic %s for user %s", topic, client.user);
  callback(null, authorized);
};
