var MQTTAscoltatore = require('ascoltatori').MQTTAscoltatore;

var ascoltatore = new MQTTAscoltatore({
  type: 'mqtt',
  json: true,
  mqtt: require('mqtt'),
  url: 'mqtt://192.168.0.17:8883',
  clientId: "mosca-bridge",
  username: 'mqtt-user',
  password: 'mqtt'
});

ascoltatore.on("ready", function() {

  ascoltatore.subscribe("sink", function(topic, message) {
    console.log(message);
  });

  ascoltatore.subscribe("a/*", function(topic, message) {
    ascoltatore.publish("sink", topic + ": " + message);
  });

  ascoltatore.publish("a/g", "hello world");
  ascoltatore.publish("a/f", "hello world");
});
