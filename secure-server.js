// server-side
const url = require('url')
const fs = require('fs');
var static = require('node-static');

/* MQTT client init*/    
var mqtt=require('mqtt');

let mqttConfigData = fs.readFileSync('./mqtt-config.json');
let mqttConfig = JSON.parse(mqttConfigData);

const options = {
  clientId: 'ws-mqtt-bridge',
  timeout: 3,
  useSSL: mqttConfig.broker.useSSL,
}

var brokerUrl = `${mqttConfig.broker.protocol}://${mqttConfig.broker.host}:${mqttConfig.broker.port}`;
console.log(`Connecting to: '${brokerUrl}'`);
var mqttClient = mqtt.connect(brokerUrl, options)
mqttClient.on("connect",function(){	
  console.log("MQTT connected");
});

// subscribe to topics defined in configuration files
mqttConfig.subscribers.forEach( (config) => {
  console.log(`Subscribing to '${config.topic}'`);
  mqttClient.subscribe(config.topic);
});

// this map contains last received message on a given topic if valueName is defined in configuration file
let msgCache = new Map();

mqttClient.on('message', function (topic, msg) {
  console.log(`Received message on MQTT topic '${topic}': ${msg.toString()}`)
  let message = undefined;
  try {
    message = JSON.parse(msg);
  } catch (e) {
    console.error("Failed to parse received message");
    return console.error(e);
  }
  
  // search web socket to transfer message
  mqttConfig.subscribers.forEach( (config) => {
    if (config.topic === topic){
      if (config.valueName) {
        msgCache.set(config.valueName, message);
      }
      if( clients[config['ws-to']] && clients[config['ws-to']].clientId) {
        console.log(`Sending web socket event '${config['ws-event']}' to '${config['ws-to']}'`);
        sockets[clients[config['ws-to']].clientId].emit(config['ws-event'], message);
      }
    }
  });
})

const server = require('https').createServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  rejectUnauthorized: false
}, handler);

var file = new(static.Server)();

function handler (req, res) { //create server
  console.log(req.url);
  // server resources from "public" folder
  req.url = "public" + decodeURIComponent(req.url);
  file.serve(req, res);
};

var sockets = [];
var clients = [];

const httpsServer = require('https').createServer({
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  rejectUnauthorized: false
}, handler);

httpsServer.listen(8443, function listening() {
    console.log('Listening on %d', httpsServer.address().port);
});

const httpServer = require('http').createServer(handler);
httpServer.listen(8442, function listening() {
    console.log('Listening on %d', httpServer.address().port);
});

const Server = require('socket.io');
const io = new Server();
io.attach(httpServer);
io.attach(httpsServer);

io.sockets.on('connection', function connection(ws) {
  console.log('connection: '+ws.id);
  sockets[ws.id] = ws;
  
  ws.on('storeClientInfo', function (data) {
      var clientInfo = new Object();
      clientInfo.customId = data.customId;
      clientInfo.clientId = ws.id;
      clients[data.customId]=clientInfo;
      console.log('storing client info', clientInfo);
      ws.send('client info received');
  });

  ws.on('open', function open() {
      console.log('connected');
  });

  ws.on('close', function close() {
      console.log(ws.id+' disconnected');
  });

  ws.on('message', function incoming(msg) {
      console.log('received: %s', msg);
      let message = undefined;
      try {
        message = JSON.parse(msg);
        let to = message.to;
        let mqttMsg = false;
        // search if message has to be sent as MQTT message
        mqttConfig.publishers.forEach( (config) => {
          if (message.to === config['ws-to'] && message.event === config['ws-event']){
            console.log(`Publishing MQTT message to topic '${config.topic}'`);
            mqttClient.publish(config.topic, message.message);
            mqttMsg = true;
          }
        });
        // no MQTT config found, sending message as web socket event
        if (!mqttMsg) {
          console.log('Sending WebSocket message');
          if(clients[message.to]){
            console.log('sending message to socket: ', clients[message.to].clientId, message.message);
            sockets[clients[message.to].clientId].emit(message.event, message.message);
          } else {
            console.error('No client socket found');
          }
        }
      } catch (e) {
        console.error("Failed to process received message");
        return console.error(e);
      }
  });
  
  ws.on('getStoredValue', function incoming(msg) {
    console.log('getStoredValue received: ', msg);
    /*
      "valueName": "universe-mode",
      "to": "ar-universe",
      "ws-reply-event": "switchUniverse"
    */
    let message = msg;
    try {
      console.log('msg cache: ', msgCache);
      
      let to = message.to;
      let lastMsg = msgCache.get(message.valueName);
      console.log('lastMsg: ', lastMsg);
      if(clients[message.to]){
        console.log('sending message to socket: ', clients[message.to].clientId, lastMsg);
        sockets[clients[message.to].clientId].emit(message['ws-reply-event'], lastMsg);
      } else {
        console.error('No client socket found');
      }
    } catch (e) {
      console.error("Failed to process getStoredValue received message");
      return console.error(e);
    }
  });
});

