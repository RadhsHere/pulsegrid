const express = require('express');
const http = require('http');
const net = require('net');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const aedesPkg = require('aedes');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { queueTelemetry, startBatchProcessor } = require('./services/batchWriter');
const { evaluateVitals } = require('./services/alertEngine');
const vitalRoutes = require('./routes/vitalRoutes');

const AedesClass = aedesPkg.Aedes || aedesPkg.default || aedesPkg;
const aedes = new AedesClass();

const app = express();
app.use(express.json());

// Express REST API Routes
app.use('/api/vitals', vitalRoutes);

const server = http.createServer(app);

// Initialize Socket.io Server for Web Frontend Connections
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Web client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Web client disconnected: ${socket.id}`);
  });
});

// MQTT Broker Setup
const MQTT_PORT = 1883;
const mqttServer = net.createServer(aedes.handle);

mqttServer.listen(MQTT_PORT, () => {
  console.log(`[MQTT Broker] Listening on port ${MQTT_PORT}`);
});

// Intercept, Evaluate, Broadcast, and Queue Telemetry
aedes.on('publish', (packet, client) => {
  if (packet && packet.topic && packet.topic.startsWith('icu/bed/')) {
    try {
      const payload = JSON.parse(packet.payload.toString());

      // 1. Broadcast live vitals to Socket.io web clients
      io.emit('vitals:stream', payload);

      // 2. Evaluate Clinical Thresholds
      const alertData = evaluateVitals(payload);
      if (alertData) {
        console.warn(`[CLINICAL ALERT] Bed: ${alertData.bedId} | Issues: ${alertData.alerts.length}`);
        io.emit('vitals:alert', alertData);
      }

      // 3. Queue in RAM for MongoDB bulk insert
      queueTelemetry(payload);
    } catch (err) {
      // Ignore non-JSON system MQTT payloads
    }
  }
});

// Database Connection & Server Launch
const startDatabaseAndServer = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    try {
      // Attempt local MongoDB connection first
      await mongoose.connect('mongodb://127.0.0.1:27017/pulsegrid', { serverSelectionTimeoutMS: 2000 });
      console.log('[MongoDB] Connected to local MongoDB service.');
    } catch {
      // Fallback to in-memory database
      console.log('[MongoDB] Local service not found. Spawning temporary in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('[MongoDB] In-memory database connected successfully.');
    }
  } else {
    await mongoose.connect(mongoUri);
    console.log('[MongoDB] Connected to configured MONGO_URI.');
  }

  startBatchProcessor();

  server.listen(5000, () => {
    console.log('[HTTP Server & Socket.io] Running on port 5000');
  });
};

startDatabaseAndServer().catch((err) => {
  console.error('[MongoDB Startup Error]', err.message);
});