#mosca-mqtt-server
Basic implementation of mosca (https://github.com/mcollina/mosca) as mqtt broker with basic auth.
Topic subscribe and publish validation (the username must be the second element in the topic path)


##Test subscription
`$ mosquitto_sub -h 0.0.0.0 -p 1883 -v -t 'users/alice/test' -u allice -P secret`

##Test publish
`$ mosquitto_pub -h 0.0.0.0 -p 1883 -t 'users/alice/test' -u alice -P secret -m "Hi Alice!"`
