//Test subscription
//$ mosquitto_sub -h 0.0.0.0 -p 1883 -v -t 'users/alice/test' -u alice -P secret
//mosquitto_sub -h 192.168.0.17 -p 8883 -v -t 'users/alice/test' -u mqtt-user -P mqtt

//Test publish
//$ mosquitto_pub -h 0.0.0.0 -p 1883 -t 'users/alice/test' -u alice -P secret -m "Hi Alice!"
//$ mosquitto_sub -h 0.0.0.0 -p 1883 -t 'users/alice/test' -u alice -P secret -m "Hi Alice!"

var mosca  = require('mosca');

var ascoltatore = {
  type: 'mqtt',
  json: true,
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

var server = new mosca.Server(moscaSettings);

server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.payload);
  console.log(client);
});

server.on('ready', setup);

function setup() {
  server.authenticate = authenticate;
  server.authorizePublish = authorizePublish;
  server.authorizeSubscribe = authorizeSubscribe;
  console.log('Mosca server is up and running');
}

// Accepts the connection if the username and password are valid
var authenticate = function(client, username, password, callback) {
  var authorized = (username === 'alice' && password.toString() === 'secret');
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
    console.log("authorized publish to topic %s for user %s", mainTopic, client.user);
  else
    console.log("unauthorized publish to topic %s for user %s", mainTopic, client.user);
  callback(null, authorized);
};

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function(client, topic, callback) {
  var mainTopic = topic.split('/')[1];
  var authorized = client.user == mainTopic;

  if (authorized)
    console.log("authorized subscription topic %s for user %s", mainTopic, client.user);
  else
    console.log("unauthorized subscription topic %s for user %s", mainTopic, client.user);
  callback(null, authorized);
};
