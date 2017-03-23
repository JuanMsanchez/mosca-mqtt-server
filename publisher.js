var mqtt  = require('mqtt');
var user = require("./db.json").users[0];

var relay1 = false;
var relay2 = false;
var deviceId = "fakeid";
var deviceAlias = "server-room";

var mqttServer = {
  url: 'mqtt://127.0.0.1',
  port: 1883,
  protocolId: 'MQTT'
};

var Client = mqtt.connect(mqttServer.url + ":" + mqttServer.port, {
  username: user.username,
  password: user.password,
  protocolId: mqttServer.protocolId,
  clientId: Date.now() + ':' + user.username
});

Client.subscribe("users/"+user.username+"/"+deviceId+"/write/actuator/#");

Client.on("message", function (topic, payload){


  var route = topic.split("/");
  try{
    payload = JSON.parse(payload);
  }catch(e){
    payload = null;
  }

  var message = {
    username : route[1], //username
    deviceId : route[2], //device id
    type     : route[3], //sensor, actuator, register
    name     : route[5], //sensor, actuator or device alias (temperature, relay1, server-room)
    data     : payload  //payload recived
  };

  console.log("Message recived: %s", JSON.stringify(message));

  if(message.name == 'relay1'){
    if(message.data.value)
      relay1 = true;
    else
      relay1 = false;

    Client.publish("users/"+user.username+"/"+deviceId+"/actuator/relay1",
      JSON.stringify({"value": relay1, "origin": deviceAlias})
    );
  }

  if(message.name == 'relay2'){
    if(message.data.value)
      relay2 = true;
    else
      relay2 = false;

    Client.publish("users/"+user.username+"/"+deviceId+"/actuator/relay2",
      JSON.stringify({"value": relay2, "origin": deviceAlias})
    );
  }
});

Client.on('connect', function (){
  var randomValue = function(){
    return parseFloat((Math.random() * (25 - 35) + 25).toFixed(2));
  };

  setInterval(function(){
    Client.publish("users/"+user.username+"/"+deviceId+"/sensor/temperature",
      JSON.stringify({"value": randomValue(), "origin": deviceAlias})
    );

    Client.publish("users/"+user.username+"/"+deviceId+"/sensor/humidity",
      JSON.stringify({"value": randomValue(), "origin": deviceAlias})
    );

    Client.publish("users/"+user.username+"/"+deviceId+"/actuator/relay1",
      JSON.stringify({"value": relay1, "origin": deviceAlias})
    );

    Client.publish("users/"+user.username+"/"+deviceId+"/actuator/relay2",
      JSON.stringify({"value": relay2, "origin": deviceAlias})
    );
  },2000);

});

Client.on('error', function () {
  console.log("ERROR!");
});
