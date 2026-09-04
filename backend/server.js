const express = require('express');
const http = require('http');
const net = require('net');
const mongoose = require('mongoose');
const aedesPkg = require('aedes');
const { queueTelemetry, startBatchProcessor } = require('./services/batchWriter');

const AedesClass = aedesPkg.Aedes || aedesPkg.default || aedesPkg;
const aedes = new AedesClass();

const app = express();
app.use(express.json());

const server = http.createServer(app);

// 1. MQTT Broker Setup
const MQTT_PORT = 1883;
const mqttServer = net.createServer(aedes.handle);

mqttServer.listen(MQTT_PORT, () => {
  console.log(`[MQTT Broker] Listening on port ${MQTT_PORT}`);
});

// 2. Intercept and Queue Telemetry
aedes.on('publish', (packet, client) => {
  if (packet && packet.topic && packet.topic.startsWith('icu/bed/')) {
    try {
      const payload = JSON.parse(packet.payload.toString());
      console.log(`[Incoming Telemetry] Bed: ${payload.bedId} | HR: ${payload.heartRate} | SpO2: ${payload.spO2}%`);
      
      // Send to RAM queue
      queueTelemetry(payload);
    } catch (err) {
      // Ignore non-JSON system MQTT messages
    }
  }
});

// 3. Connect to MongoDB and Start Batch Processor
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulsegrid';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[MongoDB] Connected successfully.');
    startBatchProcessor();

    server.listen(5000, () => {
      console.log('[HTTP Server] Running on port 5000');
    });
  })
  .catch((err) => {
    console.error('[MongoDB Connection Error]', err.message);
  });