const express = require('express');
const http = require('http');
const net = require('net');
const aedesPkg = require('aedes');

// Safely handle CommonJS / ESM export variations in Aedes v0.51+
const AedesClass = aedesPkg.Aedes || aedesPkg.default || aedesPkg;
const aedes = new AedesClass();

const app = express();
const server = http.createServer(app);

const MQTT_PORT = 1883;
const mqttServer = net.createServer(aedes.handle);

mqttServer.listen(MQTT_PORT, () => {
  console.log(`[MQTT Broker] Listening on port ${MQTT_PORT}`);
});

// Intercept incoming MQTT telemetry payloads
aedes.on('publish', (packet, client) => {
  if (packet && packet.topic && packet.topic.startsWith('icu/bed/')) {
    const payload = packet.payload.toString();
    console.log(`[Incoming Telemetry] Topic: ${packet.topic} | Payload: ${payload}`);
  }
});

server.listen(5000, () => {
  console.log('[HTTP Server] Running on port 5000');
});