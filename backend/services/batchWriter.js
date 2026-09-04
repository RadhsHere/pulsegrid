const VitalLog = require('../models/VitalLog');

let telemetryBuffer = [];
const BATCH_INTERVAL_MS = 3000; // Flush to DB every 3 seconds

// Push packet to RAM queue
const queueTelemetry = (data) => {
  telemetryBuffer.push({
    timestamp: new Date(data.timestamp),
    bedId: data.bedId,
    heartRate: data.heartRate,
    spO2: data.spO2,
    temperature: data.temperature,
  });
};

// Periodic bulk insertion
const startBatchProcessor = () => {
  setInterval(async () => {
    if (telemetryBuffer.length === 0) return;

    const batchToInsert = [...telemetryBuffer];
    telemetryBuffer = []; // Instantly reset buffer

    try {
      await VitalLog.insertMany(batchToInsert, { ordered: false });
      console.log(`[DB Batch Write] Bulk inserted ${batchToInsert.length} vital records into MongoDB.`);
    } catch (err) {
      console.error('[DB Batch Write Error]', err.message);
    }
  }, BATCH_INTERVAL_MS);
};

module.exports = { queueTelemetry, startBatchProcessor };